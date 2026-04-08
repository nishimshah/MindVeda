import openai
from django.conf import settings
from .models import ChatMessage

def analyze_sentiment(text):
    text = text.lower()
    positive_words = ['happy', 'great', 'good', 'wonderful', 'amazing', 'love', 'excited', 'grateful', 'thankful', 'joy', 'fantastic', 'excellent', 'blessed', 'hopeful', 'calm', 'peaceful']
    negative_words = ['sad', 'angry', 'depressed', 'anxious', 'worried', 'stressed', 'scared', 'lonely', 'hopeless', 'tired', 'frustrated', 'overwhelmed', 'hurt', 'pain', 'afraid', 'panic', 'cry']

    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)

    if negative_count > positive_count:
        return 'negative'
    if positive_count > negative_count:
        return 'positive'
    return 'neutral'

def get_ai_response(user, current_message, history, sentiment):
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    system_prompt = f"""You are MindVeda AI, a calm, supportive, and empathetic mental wellness companion. 
You are NOT a licensed therapist or medical professional. Never provide medical advice or diagnoses.
The user's name is {user.name}. They are in the {user.age_group} age group.
Their goals are: {', '.join(user.goals) if user.goals else 'general wellness'}.
{f'They have noted: {", ".join(user.special_needs)}' if user.special_needs else ''}
The detected sentiment of their current message is: {sentiment}.
Respond in a warm, calming tone. Keep responses concise (2-4 sentences unless they ask for more).
If they seem distressed, gently suggest professional help resources.
Use simple language. Be encouraging and supportive."""

    messages = [{"role": "system", "content": system_prompt}]
    for h in history:
        messages.append({"role": "user" if h.role == "user" else "assistant", "content": h.content})
    
    messages.append({"role": "user", "content": current_message})

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=300,
            temperature=0.7,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Fallback responses
        fallback_responses = {
            'negative': f"I hear you, {user.name}. It sounds like you're going through a tough time, and that's okay. Remember, it's perfectly normal to feel this way sometimes. Would you like to try a breathing exercise in our Calm Zone, or would you prefer to keep talking?",
            'positive': f"That's wonderful to hear, {user.name}! 😊 It's great that you're feeling good. Keep nurturing those positive feelings. Is there anything specific you'd like to work on today?",
            'neutral': f"Thank you for sharing, {user.name}. I'm here to listen and support you. What's on your mind today? We can chat, or if you'd prefer, we have some great brain training exercises and calming activities available.",
        }
        return fallback_responses.get(sentiment, fallback_responses['neutral'])
