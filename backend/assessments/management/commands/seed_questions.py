"""
assessments/management/commands/seed_questions.py

Seeds the AssessmentQuestion table with clinical question banks.
Run: python manage.py seed_questions

Sources:
  - GAD-7 (anxiety): Spitzer et al., 2006
  - PHQ-9 (depression): Kroenke et al., 2001
  - Conners-inspired (adhd): adapted screening items
  - PSS-10 (stress): Cohen et al., 1983
"""
from django.core.management.base import BaseCommand
from assessments.models import AssessmentQuestion


QUESTIONS = {
    'anxiety': [
        ("q1", "Feeling nervous, anxious, or on edge", "0-3"),
        ("q2", "Not being able to stop or control worrying", "0-3"),
        ("q3", "Worrying too much about different things", "0-3"),
        ("q4", "Trouble relaxing", "0-3"),
        ("q5", "Being so restless that it is hard to sit still", "0-3"),
        ("q6", "Becoming easily annoyed or irritable", "0-3"),
        ("q7", "Feeling afraid as if something awful might happen", "0-3"),
    ],
    'depression': [
        ("q1", "Little interest or pleasure in doing things", "0-3"),
        ("q2", "Feeling down, depressed, or hopeless", "0-3"),
        ("q3", "Trouble falling or staying asleep, or sleeping too much", "0-3"),
        ("q4", "Feeling tired or having little energy", "0-3"),
        ("q5", "Poor appetite or overeating", "0-3"),
        ("q6", "Feeling bad about yourself — or that you are a failure", "0-3"),
        ("q7", "Trouble concentrating on things, such as reading or watching TV", "0-3"),
        ("q8", "Moving or speaking so slowly that other people could have noticed", "0-3"),
        ("q9", "Thoughts that you would be better off dead or of hurting yourself", "0-3"),
    ],
    'adhd': [
        ("q1", "How often do you have trouble wrapping up the final details of a project?", "never-always"),
        ("q2", "How often do you have difficulty getting things in order when you have to do a task that requires organization?", "never-always"),
        ("q3", "How often do you have problems remembering appointments or obligations?", "never-always"),
        ("q4", "When you have a task that requires a lot of thought, how often do you avoid getting started?", "never-always"),
        ("q5", "How often do you fidget or squirm with your hands or feet when you have to sit for a long time?", "never-always"),
        ("q6", "How often do you feel overly active and compelled to do things, like you were driven by a motor?", "never-always"),
        ("q7", "How often do you make careless mistakes when you have to work on a boring or difficult project?", "never-always"),
        ("q8", "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?", "never-always"),
        ("q9", "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?", "never-always"),
        ("q10", "How often do you misplace or have difficulty finding things at home or at work?", "never-always"),
        ("q11", "How often are you distracted by activity or noise around you?", "never-always"),
        ("q12", "How often do you leave your seat in meetings or other situations in which you are expected to remain seated?", "never-always"),
        ("q13", "How often do you feel restless or fidgety?", "never-always"),
        ("q14", "How often do you have difficulty unwinding and relaxing when you have time to yourself?", "never-always"),
        ("q15", "How often do you find yourself talking too much when you are in social situations?", "never-always"),
        ("q16", "How often do you interrupt others when they are busy?", "never-always"),
        ("q17", "How often do you have difficulty waiting your turn in situations when turn taking is required?", "never-always"),
        ("q18", "How often do you interrupt or intrude on what others are doing?", "never-always"),
    ],
    'stress': [
        ("q1", "In the last month, how often have you been upset because of something that happened unexpectedly?", "0-4"),
        ("q2", "In the last month, how often have you felt that you were unable to control the important things in your life?", "0-4"),
        ("q3", "In the last month, how often have you felt nervous and 'stressed'?", "0-4"),
        ("q4", "How often have you dealt successfully with irritating life hassles? (reverse)", "0-4"),
        ("q5", "How often have you felt that you were effectively coping with important changes occurring in your life? (reverse)", "0-4"),
        ("q6", "How often have you felt confident about your ability to handle your personal problems? (reverse)", "0-4"),
        ("q7", "How often have you been able to control irritations in your life? (reverse)", "0-4"),
        ("q8", "How often have you felt that things were going your way? (reverse)", "0-4"),
        ("q9", "How often have you been angered because of things that happened that were outside of your control?", "0-4"),
        ("q10", "How often have you felt difficulties were piling up so high that you could not overcome them?", "0-4"),
    ],
}


class Command(BaseCommand):
    help = 'Seeds the assessment question bank with clinical screening questions.'

    def handle(self, *args, **options):
        total_created = 0
        total_skipped = 0

        for condition, questions in QUESTIONS.items():
            for order, (key, text, scale) in enumerate(questions, start=1):
                obj, created = AssessmentQuestion.objects.get_or_create(
                    condition=condition,
                    question_key=key,
                    defaults={
                        'question_text': text,
                        'scale': scale,
                        'order': order,
                        'is_active': True,
                    }
                )
                if created:
                    total_created += 1
                else:
                    total_skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Seeded questions: {total_created} created, {total_skipped} already existed.'
        ))
