'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '../../lib/api';
import { useAuth } from '../providers';

export default function ProfilePage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    role: 'USER' as 'USER' | 'CREATOR',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Sync form state when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        role: user.role || 'USER',
      });
    }
  }, [user]);

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name: string; avatar: string; role: 'USER' | 'CREATOR' }) => {
      if (!user) throw new Error('Not authenticated');
      return updateUserProfile(user.id, data);
    },
    onSuccess: async () => {
      setSuccessMsg('Profile updated successfully!');
      setErrorMsg('');
      await refreshProfile(); // Refresh AuthContext user state
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setSuccessMsg('');
      setErrorMsg(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] || 
        'Failed to update profile. Please try again.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!formData.name.trim()) {
      setErrorMsg('Name field is required.');
      return;
    }
    updateMutation.mutate({
      name: formData.name,
      avatar: formData.avatar,
      role: formData.role,
    });
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 min-h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100 min-h-screen relative">
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl -z-10" />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Profile</h2>
        <p className="text-xs text-zinc-400 mb-8 border-b border-zinc-800 pb-6">
          View your account credentials and update personal details. Change your role to test different access dashboards.
        </p>

        {/* Profile Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Avatar Preview Panel */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-6 text-center space-y-4">
            <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-lg shadow-violet-500/5">
              <img
                src={formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                }}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-250 leading-none">{formData.name || 'Anonymous User'}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">{user?.email}</p>
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-550 block mb-1">Current Active Space</span>
              <span
                className={`text-[9px] font-bold tracking-wider px-3 py-1 rounded-full uppercase inline-block ${
                  formData.role === 'CREATOR'
                    ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400'
                    : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                }`}
              >
                {formData.role}
              </span>
            </div>
          </div>

          {/* Form Panel */}
          <div className="md:col-span-2 bg-zinc-900/20 border border-zinc-850 rounded-3xl p-6 md:p-8 space-y-6">
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username (Read-Only)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.username}
                    className="w-full bg-zinc-950 border border-zinc-850/60 text-zinc-500 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address (Read-Only)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email}
                    className="w-full bg-zinc-950 border border-zinc-850/60 text-zinc-500 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Avatar URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Sandbox Workspace Role Selection</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all ${
                      formData.role === 'USER'
                        ? 'bg-violet-600/10 border-violet-500 text-violet-400'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:bg-zinc-900'
                    }`}
                  >
                    User (Seeker)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'CREATOR' })}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all ${
                      formData.role === 'CREATOR'
                        ? 'bg-fuchsia-600/10 border-fuchsia-500 text-fuchsia-400'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-450 hover:bg-zinc-900'
                    }`}
                  >
                    Creator (Mentor)
                  </button>
                </div>
                <p className="text-[10px] text-zinc-550 mt-2 text-center">
                  Swapping your role will immediately enable your access to the corresponding Dashboard and actions.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-violet-500/10 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
