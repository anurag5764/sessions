from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Session, User, Booking
from .serializers import SessionSerializer, UserSerializer, BookingSerializer, RegisterSerializer
from .permissions import IsCreatorOrReadOnly, IsUserAndCanBook

class SessionPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all().order_by('-created_at')
    serializer_class = SessionSerializer
    permission_classes = [IsCreatorOrReadOnly]
    pagination_class = SessionPagination
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        # Enforce that the creator is always the authenticated user
        serializer.save(creator=self.request.user)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-booked_at')
    serializer_class = BookingSerializer
    permission_classes = [IsUserAndCanBook]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"success": True}, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Booking.objects.none()
        if user.role == 'USER':
            return Booking.objects.filter(user=user).order_by('-booked_at')
        elif user.role == 'CREATOR':
            return Booking.objects.filter(session__creator=user).order_by('-booked_at')
        return Booking.objects.none()


class UserBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).order_by('-booked_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class CreatorBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'CREATOR':
            return Response(
                {"detail": "Only creators can view their session bookings."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        bookings = Booking.objects.filter(session__creator=request.user).order_by('-booked_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# Google OAuth View
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.providers.oauth2.client import OAuth2Error
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.exceptions import ValidationError

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = 'postmessage'

    def post(self, request, *args, **kwargs):
        # Developer testing override
        if request.data.get('access_token') == 'mock-google-token':
            user, _ = User.objects.get_or_create(
                email='google.user@example.com',
                defaults={
                    'username': 'google_user',
                    'name': 'Google Developer User',
                    'avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                    'role': 'USER'
                }
            )
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        try:
            return super().post(request, *args, **kwargs)
        except OAuth2Error as e:
            raise ValidationError({'non_field_errors': [str(e)]})




