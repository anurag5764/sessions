# pyrefly: ignore [missing-import]
from django.contrib import admin
# pyrefly: ignore [missing-import]
from django.urls import path, include
# pyrefly: ignore [missing-import]
from django.http import JsonResponse
from marketplace.views import RegisterView, ProfileView, GoogleLogin, BookingViewSet, UserBookingsView, CreatorBookingsView
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def health_check(request):
    return JsonResponse({"status": "healthy"})

booking_list = BookingViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

booking_detail = BookingViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health_check),
    path('api/health/', health_check),
    path('api/', include('marketplace.urls')),
    
    # Auth routes
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login', TokenObtainPairView.as_view(), name='login'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh', TokenRefreshView.as_view(), name='refresh'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    
    # Google OAuth
    path('auth/google', GoogleLogin.as_view(), name='google_login'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    # Profile route
    path('api/profile', ProfileView.as_view(), name='profile'),
    path('api/profile/', ProfileView.as_view(), name='profile'),

    # Root bookings routes
    path('bookings', booking_list, name='root-bookings'),
    path('bookings/', booking_list, name='root-bookings-slash'),
    path('bookings/<int:pk>', booking_detail, name='root-bookings-detail'),
    path('bookings/<int:pk>/', booking_detail, name='root-bookings-detail-slash'),
    path('bookings/my', UserBookingsView.as_view(), name='root-my-bookings'),
    path('bookings/my/', UserBookingsView.as_view(), name='root-my-bookings-slash'),
    path('creator/bookings', CreatorBookingsView.as_view(), name='root-creator-bookings'),
    path('creator/bookings/', CreatorBookingsView.as_view(), name='root-creator-bookings-slash'),
]

