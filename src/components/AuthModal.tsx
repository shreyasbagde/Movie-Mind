import React, { useState } from 'react';
import { X, Heart, LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { authModal, closeAuthModal, login } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>(authModal.mode || 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!authModal.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const displayName = mode === 'signup' && name.trim() ? name.trim() : email.split('@')[0];
    login({
      name: displayName,
      email: email.trim(),
      favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
      favoriteMovieIds: [],
    });
  };

  const handleDemoLogin = () => {
    login({
      name: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
      favoriteMovieIds: ['m-1', 'm-2', 'm-3'],
    });
  };

  const handleGoogleLogin = () => {
    login({
      name: 'Google Cinephile',
      email: 'cinephile.user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      favoriteGenres: ['Sci-Fi', 'Thriller'],
      favoriteMovieIds: ['m-1', 'm-3'],
    });
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        id="auth-modal-card"
        className="relative w-full max-w-md rounded-3xl bg-[#0d0d0f]/90 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-gray-100 overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-600/15 blur-[60px] pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pending Favorite Notification Banner */}
        {authModal.pendingMovieTitle && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 flex-shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="text-xs">
              <p className="text-white font-bold">Sign in required</p>
              <p className="text-gray-300">
                Sign in to add <span className="text-red-400 font-semibold">&ldquo;{authModal.pendingMovieTitle}&rdquo;</span> to your Favorites List!
              </p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-500 mb-3">
            {mode === 'signin' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to MovieMind' : 'Create Your Account'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {mode === 'signin'
              ? 'Save your favorite movies and sync recommendations across devices'
              : 'Join to build your personal watchlist and unlock AI recommendations'}
          </p>
        </div>

        {/* Quick Instant Sign-In Options */}
        <div className="space-y-2.5 mb-6">
          <button
            id="btn-quick-demo-login"
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>1-Click Sign In as Demo Cinephile</span>
          </button>

          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0d0d0f] px-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest absolute">
            or with email
          </span>
        </div>

        {/* Traditional Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 backdrop-blur-md transition-all"
                />
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 backdrop-blur-md transition-all"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 backdrop-blur-md transition-all"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-white/5 border-white/10 text-red-600 focus:ring-red-600/30"
              />
              <span>Remember me</span>
            </label>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => alert('Password reset link sent to demo email!')}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-red-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In & Continue</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Mode */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {mode === 'signin' ? (
            <p>
              Don&rsquo;t have an account?{' '}
              <button
                id="btn-switch-signup"
                onClick={() => setMode('signup')}
                className="font-bold text-red-500 hover:text-red-400 underline ml-1"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                id="btn-switch-signin"
                onClick={() => setMode('signin')}
                className="font-bold text-red-500 hover:text-red-400 underline ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
