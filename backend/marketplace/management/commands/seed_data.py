# pyrefly: ignore [missing-import]
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from marketplace.models import User, Session, Booking

class Command(BaseCommand):
    help = 'Seeds sample data for the Sessions Marketplace'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        Booking.objects.all().delete()
        Session.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write('Creating users and creators...')
        
        # Create creators
        creator1 = User.objects.create_user(
            username='sarah_dev',
            email='sarah.creator@example.com',
            password='password123',
            name='Sarah Jenkins',
            avatar='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            role='CREATOR',
            is_staff=True
        )
        
        creator2 = User.objects.create_user(
            username='alex_archi',
            email='alex.creator@example.com',
            password='password123',
            name='Alex Rivera',
            avatar='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            role='CREATOR'
        )

        # Create normal users
        user1 = User.objects.create_user(
            username='bob_learns',
            email='bob.user@example.com',
            password='password123',
            name='Bob Miller',
            avatar='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            role='USER'
        )
        
        user2 = User.objects.create_user(
            username='alice_codes',
            email='alice.user@example.com',
            password='password123',
            name='Alice Chang',
            avatar='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
            role='USER'
        )

        self.stdout.write('Creating sessions...')
        
        sessions_data = [
            {
                'title': 'Yoga Session',
                'description': 'A relaxing Vinyasa flow session for all skill levels to improve flexibility and core strength.',
                'price': 25.00,
                'image': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
                'creator': creator1
            },
            {
                'title': 'System Design & Scalability 101',
                'description': 'Learn how to architect large-scale systems, design database schemas, and apply caching strategies.',
                'price': 99.00,
                'image': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
                'creator': creator2
            },
            {
                'title': 'Tailwind CSS Masterclass',
                'description': 'Build modern, beautiful, and completely responsive landing pages using utility-first CSS configurations.',
                'price': 29.50,
                'image': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
                'creator': creator1
            },
            {
                'title': 'Django & PostgreSQL Backend Mastery',
                'description': 'Deep dive into Django REST Framework, database migrations, security best practices, and Gunicorn deployment.',
                'price': 79.99,
                'image': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
                'creator': creator2
            }
        ]

        created_sessions = []
        for s in sessions_data:
            session = Session.objects.create(**s)
            created_sessions.append(session)
            self.stdout.write(f'  Created session: {session.title}')

        self.stdout.write('Creating sample bookings...')
        
        Booking.objects.create(
            user=user1,
            session=created_sessions[0],
            status='CONFIRMED'
        )
        Booking.objects.create(
            user=user1,
            session=created_sessions[1],
            status='PENDING'
        )
        Booking.objects.create(
            user=user2,
            session=created_sessions[2],
            status='CONFIRMED'
        )
        Booking.objects.create(
            user=user2,
            session=created_sessions[0],
            status='CANCELLED'
        )

        # Seed Site configuration for django-allauth
        self.stdout.write('Seeding django-allauth Site and Google SocialApp...')
        site, created = Site.objects.get_or_create(
            id=1,
            defaults={'domain': 'localhost', 'name': 'localhost'}
        )
        if not created and site.domain != 'localhost':
            site.domain = 'localhost'
            site.name = 'localhost'
            site.save()

        # Seed Google SocialApp
        google_app, app_created = SocialApp.objects.get_or_create(
            provider='google',
            defaults={
                'name': 'Google OAuth App',
                'client_id': 'google-client-id-placeholder.apps.googleusercontent.com',
                'secret': 'google-client-secret-placeholder',
            }
        )
        if app_created:
            google_app.sites.add(site)

        self.stdout.write(self.style.SUCCESS('Database successfully seeded with marketplace data!'))
