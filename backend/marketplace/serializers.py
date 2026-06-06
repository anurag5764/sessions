from rest_framework import serializers
from .models import User, Session, Booking

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'avatar', 'role']


class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    creator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='creator', write_only=True, required=False
    )

    class Meta:
        model = Session
        fields = [
            'id', 
            'title', 
            'description', 
            'price', 
            'image', 
            'creator', 
            'creator_id', 
            'created_at'
        ]


class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    session = SessionSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(), source='session', write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id', 
            'user', 
            'user_id', 
            'session', 
            'session_id', 
            'status', 
            'booked_at'
        ]

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication credentials were not provided.")
        
        # When creating, user will be request.user unless explicitly provided
        user = attrs.get('user', request.user)
        session = attrs.get('session')

        if session:
            # 1. Creator cannot book own session
            if session.creator == user:
                raise serializers.ValidationError("You cannot book your own session.")

            # 2. User cannot book same session twice (exclude CANCELLED status)
            existing_booking = Booking.objects.filter(user=user, session=session).exclude(status='CANCELLED')
            if self.instance:
                existing_booking = existing_booking.exclude(pk=self.instance.pk)
                
            if existing_booking.exists():
                raise serializers.ValidationError("Already booked")

        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'name', 'password', 'avatar', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            avatar=validated_data.get('avatar', ''),
            role=validated_data.get('role', 'USER')
        )
        return user

