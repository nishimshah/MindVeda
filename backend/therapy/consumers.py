"""
therapy/consumers.py

WebSocket consumer for real-time therapist-patient chat using Django Channels.
Each conversation room is keyed as 'chat_{therapist_id}_{patient_id}'.
Messages are persisted to the ChatMessage model.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return

        self.user = user
        self.other_id = self.scope['url_route']['kwargs'].get('other_id')

        # Build a deterministic room name regardless of who connects first
        ids = sorted([str(user.id), str(self.other_id)])
        self.room_name = f"chat_{'_'.join(ids)}"
        self.room_group_name = f"ws_{self.room_name}"

        # Verify the link between these two users exists and is active
        is_linked = await self.verify_link(user.id, int(self.other_id))
        if not is_linked:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Send recent message history on connect
        messages = await self.get_history(user.id, int(self.other_id))
        await self.send(text_data=json.dumps({'type': 'history', 'messages': messages}))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get('message', '').strip()
        if not message_text:
            return

        # Persist message
        saved = await self.save_message(self.user.id, message_text, self.other_id)

        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_text,
                'sender_id': self.user.id,
                'sender_name': self.user.name,
                'timestamp': saved['timestamp'],
            }
        )

    async def chat_message(self, event):
        """Relay a message received from the group to the WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp'],
        }))

    # ── Database helpers (sync → async) ────────────────

    @database_sync_to_async
    def verify_link(self, user_id, other_id):
        from accounts.models import TherapistPatientLink
        return TherapistPatientLink.objects.filter(
            status='active'
        ).filter(
            # Either direction: therapist→patient or patient→therapist
            therapist_id__in=[user_id, other_id],
            user_id__in=[user_id, other_id],
        ).exists()

    @database_sync_to_async
    def save_message(self, sender_id, content, recipient_id):
        from therapy.models import ChatMessage
        msg = ChatMessage.objects.create(
            user_id=sender_id,
            recipient_id=recipient_id,
            role='clinical',
            content=content,
        )
        return {'timestamp': msg.created_at.isoformat()}

    @database_sync_to_async
    def get_history(self, user_id, other_id):
        from therapy.models import ChatMessage
        from django.db.models import Q
        
        # Messages where (sender=user AND recipient=other) OR (sender=other AND recipient=user)
        # and role is clinical
        msgs = ChatMessage.objects.filter(
            Q(user_id=user_id, recipient_id=other_id) |
            Q(user_id=other_id, recipient_id=user_id),
            role='clinical'
        ).order_by('-created_at')[:50]
        
        return [
            {
                'message': m.content,
                'sender_id': m.user_id,
                'timestamp': m.created_at.isoformat(),
            }
            for m in reversed(list(msgs))
        ]
