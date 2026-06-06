'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchMyBookings, updateBookingStatus } from '../../../lib/api';
import { useAuth } from '../../providers';

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [bookingTab, setBookingTab] = useState<'active' | 'past'>('active');

  // Route protection
  useEffect(() => {
    if (!loading && (!user || user.role !== 'USER')) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch My Bookings
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['userBookings'],
    queryFn: fetchMyBookings,
    enabled: !!user && user.role === 'USER',
  });

  // Cancel Booking Mutation
  const cancelMutation = useMutation({
    mutationFn: (bookingId: number) => updateBookingStatus(bookingId, 'CANCELLED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });

  if (loading || (!user && !loading)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 min-h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Split bookings into active (PENDING/CONFIRMED) and past (CANCELLED)
  const activeBookings = bookings?.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED') || [];
  const pastBookings = bookings?.filter((b) => b.status === 'CANCELLED') || [];

  return (
    <div className="flex-1 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100 min-h-screen relative">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl -z-10" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Client Dashboard</h2>
            <p className="text-xs text-zinc-400 mt-1">Manage your active coaching bookings and workspace details.</p>
          </div>
          <Link
            href="/"
            className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all"
          >
            Find Sessions Catalog
          </Link>
        </div>

        {/* Layout: Profile (1 Column) & Bookings Tables (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Profile Card */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 space-y-5 shadow-xl relative">
            <div className="absolute top-0 right-4 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl -z-10" />
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Profile Summary</h3>
            
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.name}
                className="w-14 h-14 rounded-full object-cover border border-zinc-800"
              />
              <div>
                <h4 className="text-base font-bold text-zinc-200">{user?.name}</h4>
                <p className="text-xs text-zinc-400 leading-none">{user?.username}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">Email Address</span>
                <span className="text-xs text-zinc-300 break-all">{user?.email}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">Workspace Role</span>
                <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 uppercase mt-0.5 inline-block">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/profile"
                className="w-full inline-block text-center bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 font-semibold py-2.5 rounded-xl text-xs transition-all hover:text-white"
              >
                Edit Profile Settings
              </Link>
            </div>
          </div>

          {/* Right Column: Bookings Workspace with Tabs & Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab selection bar */}
            <div className="flex justify-between items-center bg-zinc-900/30 border border-zinc-850 rounded-2xl p-1.5 shadow-inner">
              <div className="flex gap-1">
                <button
                  onClick={() => setBookingTab('active')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    bookingTab === 'active'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Active Bookings ({activeBookings.length})
                </button>
                <button
                  onClick={() => setBookingTab('past')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    bookingTab === 'past'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Past / Cancelled ({pastBookings.length})
                </button>
              </div>
              
              <span className="text-[10px] text-zinc-500 px-3 hidden sm:inline-block font-medium">
                Total Bookings: {bookings?.length || 0}
              </span>
            </div>

            {/* Bookings Display */}
            {isLoading ? (
              <div className="bg-zinc-905/20 border border-zinc-850 rounded-3xl p-8 space-y-4 animate-pulse">
                <div className="h-6 bg-zinc-900 rounded w-1/4" />
                <div className="h-24 bg-zinc-900 rounded w-full" />
              </div>
            ) : error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-350 rounded-3xl p-8 text-center">
                <p className="font-bold text-base mb-2">Error loading bookings</p>
                <p className="text-xs text-zinc-400">Please make sure the containers are fully operational and try again.</p>
              </div>
            ) : (
              <div className="bg-zinc-900/20 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl">
                
                {/* Table wrapper */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-zinc-850 text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                        <th className="py-4 px-6">Session</th>
                        <th className="py-4 px-6">Mentor / Creator</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6">Date Booked</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 text-sm">
                      
                      {/* Active Bookings Tab */}
                      {bookingTab === 'active' && (
                        activeBookings.length > 0 ? (
                          activeBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-zinc-850/20 transition-all">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={booking.session.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}
                                    alt={booking.session.title}
                                    className="w-10 h-10 rounded-xl object-cover border border-zinc-800/80 flex-shrink-0"
                                  />
                                  <Link
                                    href={`/session/${booking.session.id}`}
                                    className="font-bold text-zinc-200 hover:text-violet-400 line-clamp-1 hover:underline transition-all"
                                  >
                                    {booking.session.title}
                                  </Link>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs">
                                <p className="font-semibold text-zinc-350">{booking.session.creator?.name}</p>
                                <p className="text-zinc-500 mt-0.5">{booking.session.creator?.email}</p>
                              </td>
                              <td className="py-4 px-6 text-right font-extrabold text-white">
                                ${booking.session.price}
                              </td>
                              <td className="py-4 px-6 text-xs text-zinc-400">
                                {new Date(booking.booked_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase border ${
                                    booking.status === 'CONFIRMED'
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                  }`}
                                >
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => {
                                    if (confirm('Cancel this booking reservation?')) {
                                      cancelMutation.mutate(booking.id);
                                    }
                                  }}
                                  disabled={cancelMutation.isPending}
                                  className="text-xs bg-zinc-800 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-450 border border-zinc-700 hover:border-rose-500/20 px-2.5 py-1.5 rounded-lg transition-all font-semibold"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-zinc-500">
                              <div className="space-y-2">
                                <p className="font-semibold">No active bookings</p>
                                <p className="text-xs text-zinc-600">You don't have any pending or confirmed bookings.</p>
                              </div>
                            </td>
                          </tr>
                        )
                      )}

                      {/* Past Bookings Tab */}
                      {bookingTab === 'past' && (
                        pastBookings.length > 0 ? (
                          pastBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-zinc-850/20 transition-all text-zinc-400">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={booking.session.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100'}
                                    alt={booking.session.title}
                                    className="w-10 h-10 rounded-xl object-cover border border-zinc-800/80 flex-shrink-0 grayscale opacity-50"
                                  />
                                  <Link
                                    href={`/session/${booking.session.id}`}
                                    className="font-bold text-zinc-400 hover:text-zinc-200 line-clamp-1 hover:underline transition-all"
                                  >
                                    {booking.session.title}
                                  </Link>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs">
                                <p className="font-semibold text-zinc-400">{booking.session.creator?.name}</p>
                                <p className="text-zinc-650 mt-0.5">{booking.session.creator?.email}</p>
                              </td>
                              <td className="py-4 px-6 text-right font-extrabold text-zinc-350">
                                ${booking.session.price}
                              </td>
                              <td className="py-4 px-6 text-xs text-zinc-500">
                                {new Date(booking.booked_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase border bg-rose-500/10 border-rose-500/20 text-rose-450">
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center text-xs text-zinc-600 font-medium">
                                No Actions Available
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-zinc-500">
                              <div className="space-y-2">
                                <p className="font-semibold">No past bookings</p>
                                <p className="text-xs text-zinc-650">No cancelled sessions records found.</p>
                              </div>
                            </td>
                          </tr>
                        )
                      )}

                    </tbody>
                  </table>
                </div>

              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
