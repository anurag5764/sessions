'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchSessions, api } from '../lib/api';

export default function Home() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch API Health Status
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['apiHealth'],
    queryFn: async () => {
      const { data } = await api.get<{ status: string }>('/api/health');
      return data;
    },
    refetchInterval: 10000, // Check health every 10s
  });

  // Fetch Marketplace Sessions
  const { data: sessionsData, isLoading: sessionsLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  });

  // Filtered and Sorted Sessions
  const filteredSessions = sessionsData?.results?.filter((session) =>
    session.title.toLowerCase().includes(search.toLowerCase()) ||
    session.description.toLowerCase().includes(search.toLowerCase())
  );

  const sortedSessions = filteredSessions?.sort((a, b) => {
    if (sortBy === 'price-low') {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    if (sortBy === 'price-high') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    // Newest first (default)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="flex-1 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100 min-h-screen relative">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl -z-10" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* API Health Banner */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl px-4 py-2 text-xs shadow-inner">
            <span className="text-zinc-400">API Gateway:</span>
            {healthLoading ? (
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
                Checking...
              </span>
            ) : healthData?.status === 'healthy' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
                Operational
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
            Learn from Creators, Developers, & Architects
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8">
            Book 1-on-1 private mentoring sessions, workshops, and architectural review calls with elite professionals.
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search sessions by topic, tech..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-zinc-650"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-zinc-300"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </section>

        {/* Sessions list */}
        <section>
          {sessionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl h-[420px] animate-pulse flex flex-col justify-between p-6">
                  <div className="space-y-4">
                    <div className="bg-zinc-850 rounded-2xl h-48 w-full" />
                    <div className="h-6 bg-zinc-850 rounded w-2/3" />
                    <div className="h-4 bg-zinc-850 rounded w-full" />
                    <div className="h-4 bg-zinc-850 rounded w-5/6" />
                  </div>
                  <div className="h-10 bg-zinc-850 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-3xl p-8 text-center max-w-md mx-auto">
              <p className="font-semibold mb-2">Error loading sessions</p>
              <p className="text-sm text-rose-400/80">Make sure the Django database container and services are fully operational.</p>
            </div>
          ) : sortedSessions && sortedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative flex flex-col bg-zinc-900/30 border border-zinc-850 hover:border-violet-500/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/5"
                >
                  {/* Session Card Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                    <img
                      src={session.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                      alt={session.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl px-3 py-1 text-sm font-semibold text-violet-400">
                      ${session.price}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {/* Creator badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={session.creator?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                          alt={session.creator?.name}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-300">{session.creator?.name}</p>
                          <p className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase">
                            {session.creator?.role}
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 text-zinc-100 group-hover:text-white transition-colors">
                        {session.title}
                      </h3>
                      <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                        {session.description}
                      </p>
                    </div>

                    <Link
                      href={`/session/${session.id}`}
                      className="w-full text-center bg-zinc-800/80 hover:bg-violet-650 hover:text-white border border-zinc-750 hover:border-violet-500/50 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800/50 text-zinc-500 rounded-3xl p-12 text-center max-w-md mx-auto">
              <p className="font-medium">No sessions found matching "{search}"</p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-800/40 py-8 mt-24 text-center text-xs text-zinc-650">
        <p>© 2026 Sessions Marketplace. All rights reserved.</p>
        <p className="mt-1">Powered by Next.js, Tailwind CSS, Django, & PostgreSQL.</p>
      </footer>
    </div>
  );
}
