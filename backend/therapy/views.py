from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MoodLog, ChatMessage
from .serializers import MoodLogSerializer, ChatMessageSerializer
from .services import analyze_sentiment, get_ai_response

class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message_text = request.data.get('message')
        if not message_text:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        sentiment = analyze_sentiment(message_text)
        
        # Save user message
        ChatMessage.objects.create(
            user=request.user,
            role='user',
            content=message_text,
            sentiment=sentiment
        )

        # Get history (last 10 messages for AI context)
        history = ChatMessage.objects.filter(
            user=request.user,
            role__in=['user', 'assistant']
        ).order_by('-created_at')[:10]
        history = reversed(history)

        # Get AI response
        ai_response_text = get_ai_response(request.user, message_text, history, sentiment)

        # Save AI response
        ChatMessage.objects.create(
            user=request.user,
            role='assistant',
            content=ai_response_text
        )

        return Response({
            "response": ai_response_text,
            "sentiment": sentiment
        })

class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(
            user=self.request.user,
            role__in=['user', 'assistant']
        ).order_by('created_at')[:100]

class MoodLogView(generics.ListCreateAPIView):
    serializer_class = MoodLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MoodLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
