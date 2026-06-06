from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('USER', 'USER'),
        ('CREATOR', 'CREATOR'),
    ]
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    avatar = models.URLField(max_length=500, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')

    # Remove inherited fields we don't need to avoid confusion
    first_name = None
    last_name = None

    # Use email as the primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    def __str__(self):
        return f"{self.name} ({self.role})"


class Session(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(max_length=500, blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('CONFIRMED', 'CONFIRMED'),
        ('CANCELLED', 'CANCELLED'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    booked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.session.title} ({self.status})"
