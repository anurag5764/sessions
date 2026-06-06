from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from marketplace.models import User, Session, Booking

class SessionAPITests(APITestCase):
    def setUp(self):
        # Create Creators
        self.creator1 = User.objects.create_user(
            username='creator_one',
            email='creator1@example.com',
            password='password123',
            name='Creator One',
            role='CREATOR'
        )
        self.creator2 = User.objects.create_user(
            username='creator_two',
            email='creator2@example.com',
            password='password123',
            name='Creator Two',
            role='CREATOR'
        )

        # Create normal User
        self.user1 = User.objects.create_user(
            username='user_one',
            email='user1@example.com',
            password='password123',
            name='User One',
            role='USER'
        )

        # Create Sessions
        self.session1 = Session.objects.create(
            title='Yoga Session',
            description='Relaxing yoga flow.',
            price=25.00,
            creator=self.creator1
        )
        self.session2 = Session.objects.create(
            title='System Design 101',
            description='Learn scalability.',
            price=99.00,
            creator=self.creator2
        )

        self.list_url = reverse('session-list')

    def get_detail_url(self, session_id):
        return reverse('session-detail', kwargs={'pk': session_id})

    # --- READ Tests ---

    def test_user_can_view_sessions_list(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should be paginated
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_user_can_view_session_detail(self):
        self.client.force_authenticate(user=self.user1)
        url = self.get_detail_url(self.session1.id)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Yoga Session')

    # --- WRITE Permission Tests (USER role block) ---

    def test_user_cannot_create_session(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            'title': 'New Session',
            'description': 'Description',
            'price': 40.00
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- WRITE Permission Tests (CREATOR role allow) ---

    def test_creator_can_create_session(self):
        self.client.force_authenticate(user=self.creator1)
        data = {
            'title': 'Advanced Python Workshop',
            'description': 'Deep dive Python.',
            'price': 49.99
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify automatic creator assignment
        self.assertEqual(response.data['creator']['id'], self.creator1.id)

    # --- OWNERSHIP Authorization Tests ---

    def test_creator_can_update_own_session(self):
        self.client.force_authenticate(user=self.creator1)
        url = self.get_detail_url(self.session1.id)
        data = {
            'title': 'Updated Yoga Session',
            'description': 'Relaxing yoga flow.',
            'price': 30.00
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.session1.refresh_from_db()
        self.assertEqual(self.session1.title, 'Updated Yoga Session')
        self.assertEqual(self.session1.price, 30.00)

    def test_creator_cannot_update_other_creator_session(self):
        self.client.force_authenticate(user=self.creator1)
        url = self.get_detail_url(self.session2.id)
        data = {
            'title': 'Hacked Title',
            'description': 'Hacked description',
            'price': 1.00
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_creator_cannot_delete_other_creator_session(self):
        self.client.force_authenticate(user=self.creator1)
        url = self.get_detail_url(self.session2.id)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_creator_can_delete_own_session(self):
        self.client.force_authenticate(user=self.creator1)
        url = self.get_detail_url(self.session1.id)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Session.objects.filter(id=self.session1.id).exists())

    # --- SEARCH & ORDERING & PAGINATION Tests ---

    def test_search_sessions(self):
        self.client.force_authenticate(user=self.user1)
        # Search for 'scalability' inside description of session2
        response = self.client.get(f"{self.list_url}?search=scalability")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.session2.id)

    def test_ordering_sessions_by_price(self):
        self.client.force_authenticate(user=self.user1)
        # Ascending price: Yoga Session (25.00) first, then System Design (99.00)
        response = self.client.get(f"{self.list_url}?ordering=price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(float(results[0]['price']), 25.00)
        self.assertEqual(float(results[1]['price']), 99.00)

    def test_sessions_pagination(self):
        self.client.force_authenticate(user=self.user1)
        # Create 10 more sessions to trigger pagination (page size = 6)
        for i in range(10):
            Session.objects.create(
                title=f"Session {i}",
                description="Desc",
                price=10.00 + i,
                creator=self.creator1
            )
        
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 12) # 2 initial + 10 new
        self.assertEqual(len(response.data['results']), 6) # page size limit
        self.assertIsNotNone(response.data['next'])


class BookingAPITests(APITestCase):
    def setUp(self):
        # Create Creator
        self.creator = User.objects.create_user(
            username='booking_creator',
            email='creator_booking@example.com',
            password='password123',
            name='Booking Creator',
            role='CREATOR'
        )
        # Create Session owned by Creator
        self.session = Session.objects.create(
            title='Test Session',
            description='Test description',
            price=20.00,
            creator=self.creator
        )
        
        # Create client users
        self.user1 = User.objects.create_user(
            username='booking_user1',
            email='user1_booking@example.com',
            password='password123',
            name='Booking User One',
            role='USER'
        )
        self.user2 = User.objects.create_user(
            username='booking_user2',
            email='user2_booking@example.com',
            password='password123',
            name='Booking User Two',
            role='USER'
        )

        self.bookings_url = '/bookings'
        self.my_bookings_url = '/bookings/my'
        self.creator_bookings_url = '/creator/bookings'

    def test_user_can_create_booking(self):
        self.client.force_authenticate(user=self.user1)
        data = {'session_id': self.session.id}
        response = self.client.post(self.bookings_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {"success": True})

    def test_user_cannot_book_same_session_twice(self):
        self.client.force_authenticate(user=self.user1)
        # Create first booking
        Booking.objects.create(user=self.user1, session=self.session)
        
        # Try to book again
        data = {'session_id': self.session.id}
        response = self.client.post(self.bookings_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Already booked", str(response.data))

    def test_creator_cannot_book_own_session(self):
        self.client.force_authenticate(user=self.creator)
        # Permission check blocks CREATOR role from POST /bookings
        data = {'session_id': self.session.id}
        response = self.client.post(self.bookings_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Directly test validation on BookingSerializer to ensure code-level self-booking check works
        from marketplace.serializers import BookingSerializer
        from rest_framework.test import APIRequestFactory
        
        factory = APIRequestFactory()
        request = factory.post(self.bookings_url)
        request.user = self.creator
        
        serializer = BookingSerializer(
            data={'session_id': self.session.id},
            context={'request': request}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("cannot book your own session", str(serializer.errors))

    def test_get_my_bookings_history(self):
        booking1 = Booking.objects.create(user=self.user1, session=self.session)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.my_bookings_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], booking1.id)

    def test_get_creator_bookings_history(self):
        booking1 = Booking.objects.create(user=self.user1, session=self.session)
        
        self.client.force_authenticate(user=self.creator)
        response = self.client.get(self.creator_bookings_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], booking1.id)

    def test_non_creator_cannot_access_creator_bookings(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.creator_bookings_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_booking_status(self):
        booking = Booking.objects.create(user=self.user1, session=self.session)
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f"{self.bookings_url}/{booking.id}/", {"status": "CANCELLED"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "CANCELLED")

