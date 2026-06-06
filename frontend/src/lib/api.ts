import axios from 'axios';

// Handles Vercel deployment variable, browser relative path, and server-side docker routing
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://backend:8000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token in browser environment
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar: string;
  role: 'USER' | 'CREATOR';
}

export interface Session {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  creator: User;
  created_at: string;
}

export interface Booking {
  id: number;
  user: User;
  session: Session;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  booked_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Session Endpoints
export const fetchSessions = async (): Promise<PaginatedResponse<Session>> => {
  const { data } = await api.get<PaginatedResponse<Session>>('/api/sessions/');
  return data;
};

export const fetchSession = async (id: number): Promise<Session> => {
  const { data } = await api.get<Session>(`/api/sessions/${id}/`);
  return data;
};

export const createSession = async (sessionData: {
  title: string;
  description: string;
  price: number;
  image?: string;
}): Promise<Session> => {
  const { data } = await api.post<Session>('/api/sessions/', sessionData);
  return data;
};

// Booking Endpoints
export const fetchMyBookings = async (): Promise<Booking[]> => {
  const { data } = await api.get<Booking[]>('/bookings/my');
  return data;
};

export const fetchCreatorBookings = async (): Promise<Booking[]> => {
  const { data } = await api.get<Booking[]>('/creator/bookings');
  return data;
};

export const createBooking = async (sessionId: number): Promise<{ success: boolean }> => {
  const { data } = await api.post<{ success: boolean }>('/bookings', { session_id: sessionId });
  return data;
};

export const updateBookingStatus = async (
  bookingId: number,
  status: 'CONFIRMED' | 'CANCELLED'
): Promise<Booking> => {
  const { data } = await api.patch<Booking>(`/bookings/${bookingId}/`, { status });
  return data;
};

// Profile Endpoints
export const updateUserProfile = async (
  userId: number,
  profileData: {
    name?: string;
    avatar?: string;
    role?: 'USER' | 'CREATOR';
  }
): Promise<User> => {
  const { data } = await api.patch<User>(`/api/users/${userId}/`, profileData);
  return data;
};
