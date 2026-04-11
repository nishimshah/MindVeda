import openai
from django.conf import settings
from .models import ChatMessage
from accounts.models import TherapistTask

def analyze_sentiment(text):
    text = text.lower()
    positive_words = ['happy', 'great', 'good', 'wonderful', 'amazing', 'love', 'excited', 'grateful', 'thankful', 'joy', 'fantastic', 'excellent', 'blessed', 'hopeful', 'calm', 'peaceful']
    negative_words = ['sad', 'angry', 'depressed', 'anxious', 'worried', 'stressed', 'scared', 'lonely', 'hopeless', 'tired', 'frustrated', 'overwhelmed', 'hurt', 'pain', 'afraid', 'panic', 'cry']

    pos_count = sum(1 for w in positive_words if w in text)
    neg_count = sum(1 for w in negative_words if w in text)

    if neg_count > pos_count: return 'negative'
    if pos_count > neg_count: return 'positive'
    return 'neutral'

def get_ai_response(user, current_message, history, sentiment):
    # 1. Gather Rich Context
    mode_info = getattr(user, 'modes', None)
    current_mode = mode_info.current_mode if mode_info else "general"
    tasks = TherapistTask.objects.filter(patient=user, status='pending').order_by('due_date')[:3]
    task_list = [t.title for t in tasks]
    
    # 2. Local Intent Detection (Smart Fallback/Accuracy)
    msg = current_message.lower()
    
    if "plan" in msg and "day" in msg:
        if task_list:
            return f"Certainly, {user.name}. Based on your therapist's recommendations, I suggest focusing on these tasks today: {', '.join(task_list)}. We can balance these with a quick breathing session when you're done. Does that sound manageable?"
        return f"To plan your day, {user.name}, I suggest starting with a 5-minute Focus Flow in our Calm Zone to ground yourself, followed by one of your Brain Training sessions. Small steps lead to big progress!"
    
    if "exercise" in msg or "activity" in msg or "something to do" in msg:
        return f"I recommend checking out our 'Focus Flow' in the Calm Zone. It uses the 4-7-8 technique which is great for {current_mode} regulation. Would you like to try that now?"

    if "hello" in msg or "hi" in msg or "hey" in msg:
        return f"Hello {user.name}! I'm your MindVeda companion. How is your {current_mode} management going today? I'm here to support you."

    # 3. Proceed to AI with Rich Prompt
    client = None
    if settings.OPENAI_API_KEY:
        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        except: pass

    if client:
        system_prompt = f"""You are MindVeda AI, a calm, supportive, and empathetic mental wellness companion. 
User Name: {user.name}
User Age Group: {user.age_group}
Current Clinical Mode: {current_mode}
Active Goals: {', '.join(user.goals) if user.goals else 'general wellness'}
Assigned Clinical Tasks: {', '.join(task_list) if task_list else 'none'}
Current Sentiment: {sentiment}

CONSTRAINTS:
1. You are NOT a doctor. Never give medical advice.
2. Be highly specific to the user's questions. 
3. If they ask to plan their day, mention their Clinical Tasks if any.
4. Keep tone gentle, encouraging, and accurate.
5. Max 3 sentences unless detailed advice is requested."""

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
            print(f"AI API Error: {e}")

    # 4. Final Dynamic Fallback if AI fails and no local intent matched
    fallbacks = {
        'negative': f"I'm here for you, {user.name}. Dealing with {current_mode} can be taxing. Take a moment to just breathe. Would you like to talk more about what's making you feel {sentiment}?",
        'positive': f"I love that energy, {user.name}! Nurturing a positive state is key for your {current_mode} progress. What's one thing you're proud of today?",
        'neutral': f"I'm listening, {user.name}. Since you're in {current_mode} mode, maybe we could look at your daily tasks or try a quick focus session? What feels right for you?"
    }
    return fallbacks.get(sentiment, fallbacks['neutral'])
