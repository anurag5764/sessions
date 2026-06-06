'use client';

import React, { use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchSession, createBooking } from '../../../lib/api';
import { useAuth } from '../../providers';

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sessionId = parseInt(id, 10);

  const { user, openLogin } = useAuth();

  // Fetch Session Details
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId),
    enabled: !isNaN(sessionId),
  });

  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: () => createBooking(sessionId),
  });

  if (isNaN(sessionId)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-350 rounded-3xl p-8 text-center max-w-md">
          <p className="font-bold text-lg mb-2">Invalid Session ID</p>
          <Link href="/" className="text-xs text-violet-400 hover:underline">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 animate-pulse space-y-8">
        <div className="h-6 bg-zinc-900 rounded w-24" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="h-96 bg-zinc-900 rounded-3xl w-full" />
            <div className="h-8 bg-zinc-900 rounded w-2/3" />
            <div className="h-24 bg-zinc-900 rounded w-full" />
          </div>
          <div className="h-64 bg-zinc-900 rounded-3xl w-full" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-350 rounded-3xl p-8 text-center max-w-md">
          <p className="font-bold text-lg mb-2">Session Not Found</p>
          <p className="text-xs text-zinc-400 mb-6">The session you are looking for may have been deleted or does not exist.</p>
          <Link href="/" className="inline-block bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs hover:bg-zinc-850">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isCreatorOfSession = user?.id === session.creator?.id;

  return (
    <div className="flex-1 bg-gradient-to-b from-zinc-950 to-black text-zinc-100 min-h-screen relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl -z-10" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-8 group transition-all"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sessions Catalog
        </Link>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[420px] rounded-3xl overflow-hidden border border-zinc-850 bg-zinc-950 shadow-2xl">
              <img
                src={session.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                alt={session.title}
                className="object-cover w-full h-full opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">{session.title}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-violet-400 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                  Category: Private Mentoring
                </span>
                <span className="text-xs font-semibold text-zinc-500">
                  Added on {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-850 pt-6">
              <h3 className="text-base font-bold text-zinc-200 mb-3">About this session</h3>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{session.description}</p>
            </div>

            {/* Creator profile card */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <img
                src={session.creator?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                alt={session.creator?.name}
                className="w-16 h-16 rounded-full object-cover border border-zinc-800"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-base font-bold text-zinc-150">{session.creator?.name}</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 uppercase">
                    {session.creator?.role}
                  </span>
                </div>
                <p className="text-xs text-zinc-450">{session.creator?.email}</p>
                <p className="text-xs text-zinc-550 pt-1">Verify profile and view past review metrics.</p>
              </div>
            </div>
          </div>

          {/* Booking / Checkout Widget */}
          <div className="bg-zinc-900 border border-zinc-850 rounded-3xl p-6 shadow-2xl relative">
            <div className="absolute top-0 right-6 w-24 h-24 bg-violet-600/5 rounded-full blur-2xl -z-10" />

            <div className="pb-6 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Price</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-extrabold text-white">${session.price}</span>
                <span className="text-xs text-zinc-500">/ Session</span>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400">Included features:</h4>
              <ul className="text-xs text-zinc-450 space-y-2.5">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  1-on-1 private video call (60 mins)
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Interactive dashboard workspace
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Detailed meeting summary report
                </li>
              </ul>
            </div>

            {/* Booking State Machine Container */}
            <div className="pt-2">
              {bookingMutation.isSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
                    Session booked successfully!
                  </div>
                  <Link
                    href="/dashboard/user"
                    className="w-full inline-block text-center bg-emerald-600 hover:bg-emerald-550 text-white font-semibold py-3 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/10"
                  >
                    Go to My Bookings
                  </Link>
                </div>
              ) : (
                <>
                  {bookingMutation.isError && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs font-medium">
                      {/* Parse the API error response if possible */}
                      {((bookingMutation.error as any).response?.data?.[0]) || 
                       ((bookingMutation.error as any).response?.data?.non_field_errors?.[0]) || 
                       (bookingMutation.error as any).message || 
                       'Booking failed. Please try again.'}
                    </div>
                  )}

                  {!user ? (
                    <button
                      onClick={openLogin}
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-3.5 rounded-2xl text-xs transition-all shadow-lg"
                    >
                      Sign In to Book Session
                    </button>
                  ) : isCreatorOfSession ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full bg-zinc-800 text-zinc-555 border border-zinc-700/50 py-3.5 rounded-2xl text-xs font-semibold cursor-not-allowed"
                      >
                        Book Session
                      </button>
                      <p className="text-[10px] text-zinc-500 text-center">
                        You cannot book your own session.
                      </p>
                    </div>
                  ) : user.role === 'CREATOR' ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full bg-zinc-800 text-zinc-555 border border-zinc-700/50 py-3.5 rounded-2xl text-xs font-semibold cursor-not-allowed"
                      >
                        Book Session
                      </button>
                      <p className="text-[10px] text-zinc-500 text-center">
                        Your account is registered as a Creator. Only User accounts can create bookings.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => bookingMutation.mutate()}
                      disabled={bookingMutation.isPending}
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                    >
                      {bookingMutation.isPending ? 'Confirming...' : 'Book Session Now'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
