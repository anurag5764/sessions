from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet, UserViewSet, BookingViewSet, UserBookingsView, CreatorBookingsView

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'users', UserViewSet, basename='user')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('bookings/my', UserBookingsView.as_view(), name='api-my-bookings'),
    path('bookings/my/', UserBookingsView.as_view(), name='api-my-bookings-slash'),
    path('creator/bookings', CreatorBookingsView.as_view(), name='api-creator-bookings'),
    path('creator/bookings/', CreatorBookingsView.as_view(), name='api-creator-bookings-slash'),
    path('', include(router.urls)),
]
