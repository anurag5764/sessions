'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  googleBypassLogin: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
    avatar: '',
    role: 'USER' as 'USER' | 'CREATOR',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch profile to verify existing token on mount
  const refreshProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>('/api/profile/');
      setUser(data);
    } catch (err) {
      // Clear token if invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const openLogin = () => {
    setErrorMsg('');
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setErrorMsg('');
    setAuthModalTab('register');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setErrorMsg('');
  };

  const login = async (email: string, password: string) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      // SimpleJWT accepts credentials via the defined USERNAME_FIELD ("email").
      // Some setups expect 'username' parameter in body to map to USERNAME_FIELD.
      // We pass both for maximum compatibility.
      const { data } = await api.post<{ access: string; refresh: string }>('/auth/login', {
        email,
        username: email,
        password,
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      const profileRes = await api.get<User>('/api/profile/');
      setUser(profileRes.data);
      closeAuthModal();
      setFormData({ email: '', password: '', username: '', name: '', avatar: '', role: 'USER' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid credentials.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const register = async (registerData: any) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.post<{ access: string; refresh: string; user: User }>('/auth/register', registerData);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setUser(data.user);
      closeAuthModal();
      setFormData({ email: '', password: '', username: '', name: '', avatar: '', role: 'USER' });
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Registration failed.';
      if (data) {
        // Collect field validation errors
        const fields = Object.keys(data);
        if (fields.length > 0) {
          msg = `${fields[0]}: ${data[fields[0]][0] || data[fields[0]]}`;
        }
      }
      setErrorMsg(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/';
  };

  const googleBypassLogin = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.post<{ access: string; refresh: string; user: User }>('/auth/google', {
        access_token: 'mock-google-token',
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setUser(data.user);
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg('Google login failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalTab === 'login') {
      try {
        await login(formData.email, formData.password);
      } catch (err) {}
    } else {
      try {
        await register({
          username: formData.username || formData.email.split('@')[0],
          email: formData.email,
          name: formData.name,
          password: formData.password,
          avatar: formData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${formData.name}`,
          role: formData.role,
        });
      } catch (err) {}
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user,
          loading,
          authModalOpen,
          authModalTab,
          openLogin,
          openRegister,
          closeAuthModal,
          setAuthModalTab,
          login,
          register,
          logout,
          googleBypassLogin,
          refreshProfile,
        }}
      >
        {children}

        {/* Beautiful Glassmorphic Auth Modal */}
        {authModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-violet-500/10">
              {/* Close Button */}
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-200 rounded-full hover:bg-zinc-800/50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Tabs */}
              <div className="flex border-b border-zinc-800 mb-6">
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all ${
                    authModalTab === 'login'
                      ? 'text-violet-400 border-b-2 border-violet-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalTab('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all ${
                    authModalTab === 'register'
                      ? 'text-violet-400 border-b-2 border-violet-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {authModalTab === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
                      <input
                        type="text"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                {authModalTab === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Avatar URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Account Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'USER' })}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            formData.role === 'USER'
                              ? 'bg-violet-600/10 border-violet-500 text-violet-400'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          User (Seeker)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'CREATOR' })}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            formData.role === 'CREATOR'
                              ? 'bg-fuchsia-600/10 border-fuchsia-500 text-fuchsia-400'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          Creator (Mentor)
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : authModalTab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <hr className="border-zinc-850" />
                <span className="absolute top-1/2 -translate-y-1/2 bg-zinc-900 px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  Or Sandbox Bypass
                </span>
              </div>

              {/* Google Developer Sign In */}
              <button
                type="button"
                onClick={googleBypassLogin}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 py-3 rounded-xl text-xs font-semibold text-zinc-200 transition-all disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.637 0 3.107.619 4.234 1.724l3.095-3.095C19.16 2.548 15.86 1.1 12.24 1.1 6.182 1.1 1.285 5.996 1.285 12s4.897 10.9 10.955 10.9c6.262 0 10.418-4.402 10.418-10.6 0-.718-.08-1.4-.24-2.015H12.24z" />
                </svg>
                Sign In with Google (Dev Override)
              </button>
            </div>
          </div>
        )}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
