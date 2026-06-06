'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../app/providers';

export default function Navbar() {
  const { user, loading, openLogin, openRegister, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 bg-zinc-950/80">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all duration-300">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Sessions
            </h1>
            <p className="text-[10px] text-zinc-500 leading-none">Marketplace</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-300 hover:text-white hover:scale-105 transition-all font-medium">
            Catalog
          </Link>
          
          {user && user.role === 'USER' && (
            <Link
              href="/dashboard/user"
              className="text-sm text-zinc-300 hover:text-white hover:scale-105 transition-all font-medium"
            >
              My Bookings
            </Link>
          )}

          {user && user.role === 'CREATOR' && (
            <Link
              href="/dashboard/creator"
              className="text-sm text-zinc-300 hover:text-white hover:scale-105 transition-all font-medium"
            >
              Creator Space
            </Link>
          )}
        </nav>

        {/* User Account Section */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-28 h-9 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 px-3 py-1.5 rounded-2xl shadow-inner transition-all text-left"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                />
                <div>
                  <p className="text-xs font-semibold text-zinc-200 leading-none">{user.name}</p>
                  <span
                    className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-md mt-1 leading-none ${
                      user.role === 'CREATOR'
                        ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'
                        : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <svg className="w-3 h-3 text-zinc-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-20 animate-fade-in">
                    <div className="px-3 py-2 border-b border-zinc-800 mb-2">
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-850 transition-all"
                    >
                      My Profile
                    </Link>
                    {user.role === 'USER' && (
                      <Link
                        href="/dashboard/user"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-850 transition-all"
                      >
                        My Bookings
                      </Link>
                    )}
                    {user.role === 'CREATOR' && (
                      <Link
                        href="/dashboard/creator"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-850 transition-all"
                      >
                        Creator Space
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 transition-all text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={openLogin}
                className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-xl transition-all"
              >
                Sign In
              </button>
              <button
                onClick={openRegister}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-zinc-850"
            />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-850 bg-zinc-950 p-4 space-y-3 animate-fade-in">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900"
          >
            Catalog
          </Link>
          {user && (
            <>
              {user.role === 'USER' && (
                <Link
                  href="/dashboard/user"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900"
                >
                  My Bookings
                </Link>
              )}
              {user.role === 'CREATOR' && (
                <Link
                  href="/dashboard/creator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900"
                >
                  Creator Space
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </>
          )}
          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLogin();
                }}
                className="w-full text-center text-sm font-semibold text-zinc-400 hover:text-white py-2 rounded-xl border border-zinc-800"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openRegister();
                }}
                className="w-full text-center text-sm font-semibold text-white py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
