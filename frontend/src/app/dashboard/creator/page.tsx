'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSessions, createSession, fetchCreatorBookings, updateBookingStatus } from '../../../lib/api';
import { useAuth } from '../../providers';

export default function CreatorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'sessions' | 'bookings'>('sessions');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states for new session
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
  });
  const [formError, setFormError] = useState('');

  // Route protection
  useEffect(() => {
    if (!loading && (!user || user.role !== 'CREATOR')) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch all sessions (to filter my sessions)
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    enabled: !!user && user.role === 'CREATOR',
  });

  // Fetch Received Bookings
  const { data: creatorBookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['creatorBookings'],
    queryFn: fetchCreatorBookings,
    enabled: !!user && user.role === 'CREATOR',
  });

  // Filter sessions owned by current logged-in creator
  const mySessions = sessionsData?.results?.filter(
    (session) => session.creator?.id === user?.id
  ) || [];

  // Create Session Mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: { title: string; description: string; price: number; image?: string }) =>
      createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setCreateModalOpen(false);
      setFormData({ title: '', description: '', price: '', image: '' });
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] || 
        'Failed to create session. Please check your inputs.'
      );
    },
  });

  // Update Booking Status Mutation (Accept/Reject)
  const statusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: number; status: 'CONFIRMED' | 'CANCELLED' }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorBookings'] });
    },
  });

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Price must be a valid positive number.');
      return;
    }
    createSessionMutation.mutate({
      title: formData.title,
      description: formData.description,
      price: priceNum,
      image: formData.image || undefined,
    });
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 min-h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- Calculations for Statistics Panel ---
  const totalBookings = creatorBookings?.length || 0;
  
  const confirmedBookings = creatorBookings?.filter(b => b.status === 'CONFIRMED') || [];
  const pendingBookings = creatorBookings?.filter(b => b.status === 'PENDING') || [];
  const cancelledBookings = creatorBookings?.filter(b => b.status === 'CANCELLED') || [];

  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.session.price || '0'), 0);
  const activeBookingsCount = confirmedBookings.length + pendingBookings.length;

  // Function to calculate booking count per session ID
  const getBookingCountForSession = (sessionId: number) => {
    if (!creatorBookings) return 0;
    return creatorBookings.filter(b => b.session.id === sessionId).length;
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100 min-h-screen relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl -z-10" />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title and Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Creator Dashboard</h2>
            <p className="text-xs text-zinc-400 mt-1">Monitor statistics, manage session listings, and moderate client reservations.</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-fuchsia-500/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Session Offer
          </button>
        </div>

        {/* 1. Statistics Cards Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Card 1: Total Earnings */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Total Revenue</span>
            <h3 className="text-3xl font-extrabold text-white mt-2">${totalEarnings.toFixed(2)}</h3>
            <p className="text-[10px] text-zinc-400 mt-1.5">From confirmed client bookings</p>
          </div>

          {/* Card 2: Hosted Sessions */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl -z-10" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Sessions Hosted</span>
            <h3 className="text-3xl font-extrabold text-white mt-2">{mySessions.length}</h3>
            <p className="text-[10px] text-zinc-400 mt-1.5">Active catalog offers</p>
          </div>

          {/* Card 3: Active Bookings */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl -z-10" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Active Bookings</span>
            <h3 className="text-3xl font-extrabold text-white mt-2">{activeBookingsCount}</h3>
            <p className="text-[10px] text-zinc-400 mt-1.5">Pending and Confirmed bookings</p>
          </div>

          {/* Card 4: Funnel Counts */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Booking Summary</span>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <span className="text-xs font-extrabold text-emerald-400">{confirmedBookings.length}</span>
                <span className="block text-[8px] text-zinc-500 mt-0.5">Approved</span>
              </div>
              <div className="p-1 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <span className="text-xs font-extrabold text-amber-400">{pendingBookings.length}</span>
                <span className="block text-[8px] text-zinc-500 mt-0.5">Pending</span>
              </div>
              <div className="p-1 bg-rose-500/5 rounded-lg border border-rose-500/10">
                <span className="text-xs font-extrabold text-rose-450">{cancelledBookings.length}</span>
                <span className="block text-[8px] text-zinc-500 mt-0.5">Cancelled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-4 px-2 text-sm font-semibold relative transition-all ${
              activeTab === 'sessions' ? 'text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Manage Sessions ({mySessions.length})
            {activeTab === 'sessions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-6 text-sm font-semibold relative transition-all ${
              activeTab === 'bookings' ? 'text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Client Reservations ({totalBookings})
            {activeTab === 'bookings' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-500 rounded-full" />
            )}
          </button>
        </div>

        {/* 2. Tables Panel */}
        
        {/* Tab 1: Manage Sessions Table */}
        {activeTab === 'sessions' && (
          <div>
            {sessionsLoading ? (
              <div className="bg-zinc-900/20 border border-zinc-850 rounded-3xl p-8 space-y-4 animate-pulse">
                <div className="h-6 bg-zinc-900 rounded w-1/4" />
                <div className="h-24 bg-zinc-900 rounded w-full" />
              </div>
            ) : mySessions.length > 0 ? (
              <div className="bg-zinc-900/20 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-zinc-850 text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                        <th className="py-4 px-6">Session Offer</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6">Date Created</th>
                        <th className="py-4 px-6 text-center">Total Bookings</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 text-sm">
                      {mySessions.map((session) => (
                        <tr key={session.id} className="hover:bg-zinc-850/20 transition-all">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={session.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}
                                alt={session.title}
                                className="w-10 h-10 rounded-xl object-cover border border-zinc-800/80 flex-shrink-0"
                              />
                              <Link
                                href={`/session/${session.id}`}
                                className="font-bold text-zinc-200 hover:text-fuchsia-400 line-clamp-1 hover:underline transition-all"
                              >
                                {session.title}
                              </Link>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-extrabold text-white">
                            ${session.price}
                          </td>
                          <td className="py-4 px-6 text-xs text-zinc-450">
                            {new Date(session.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-zinc-300">
                            {getBookingCountForSession(session.id)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400">
                              Active Listing
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/20 border border-zinc-850 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-zinc-350">No sessions hosted yet</p>
                  <p className="text-xs text-zinc-500 mt-1">Create a mentoring offer to start attracting client reservations.</p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all"
                >
                  Create Your First Listing
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Client Reservations Table */}
        {activeTab === 'bookings' && (
          <div>
            {bookingsLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="bg-zinc-900/40 border border-zinc-855 h-24 rounded-3xl w-full" />
              </div>
            ) : bookingsError ? (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-350 rounded-3xl p-8 text-center max-w-md mx-auto">
                <p className="font-bold text-base mb-2">Error fetching bookings</p>
                <p className="text-xs text-zinc-400">Check connectivity to the database server containers.</p>
              </div>
            ) : creatorBookings && creatorBookings.length > 0 ? (
              <div className="bg-zinc-900/20 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-zinc-850 text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                        <th className="py-4 px-6">Client / User</th>
                        <th className="py-4 px-6">Requested Session</th>
                        <th className="py-4 px-6">Date Requested</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 text-sm">
                      {creatorBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-zinc-850/20 transition-all">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={booking.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                                alt={booking.user.name}
                                className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                              />
                              <div>
                                <p className="font-semibold text-zinc-200">{booking.user.name}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{booking.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Link
                              href={`/session/${booking.session.id}`}
                              className="font-bold text-zinc-300 hover:text-fuchsia-400 hover:underline line-clamp-1"
                            >
                              {booking.session.title}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-xs text-zinc-450">
                            {new Date(booking.booked_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right font-extrabold text-white">
                            ${booking.session.price}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase border ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {booking.status === 'PENDING' ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => statusMutation.mutate({ bookingId: booking.id, status: 'CONFIRMED' })}
                                  disabled={statusMutation.isPending}
                                  className="text-[11px] bg-emerald-600 hover:bg-emerald-550 text-white px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => statusMutation.mutate({ bookingId: booking.id, status: 'CANCELLED' })}
                                  disabled={statusMutation.isPending}
                                  className="text-[11px] bg-zinc-800 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/20 px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-550 font-medium">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/20 border border-zinc-850 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-550">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-zinc-350">No reservation requests</p>
                  <p className="text-xs text-zinc-500 mt-1">Bookings requested by users on your host sessions will list here.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Session Form */}
        {createModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-fuchsia-500/5">
              {/* Close Button */}
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-200 rounded-full hover:bg-zinc-800/50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-bold text-white mb-2">Host a New Session</h3>
              <p className="text-xs text-zinc-400 mb-6">Create a coaching session with customized pricing and description.</p>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Python Architecture Code Review"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what client users will gain in this mentoring call..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Price ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      placeholder="e.g., 99.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="bg-zinc-800 hover:bg-zinc-750 text-zinc-350 border border-zinc-750 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSessionMutation.isPending}
                    className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-fuchsia-500/20 disabled:opacity-50"
                  >
                    {createSessionMutation.isPending ? 'Publishing...' : 'Publish Session Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
