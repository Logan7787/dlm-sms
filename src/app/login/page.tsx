'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useStudio } from '@/context/studio-context';
import { SplashScreen } from '@/components/ui/splash-screen';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useStudio();
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if splash was already shown in current session
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('dlm_splash_seen');
    if (hasSeenSplash === 'true') {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('dlm_splash_seen', 'true');
    setShowSplash(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      const user = loginUser(email, password);
      setLoading(false);
      if (user) {
        router.push('/dashboard');
      } else {
        setErrorMsg('Invalid email or password. Please check your credentials.');
      }
    }, 500);
  };

  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  return (
    <>
      {/* Animated Splash Screen Overlay */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Background Decorative Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating background grid tech lines */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="w-full max-w-md z-10 animate-logo-in">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto h-20 w-20 rounded-2xl bg-slate-900/90 border border-slate-700/60 p-2 shadow-xl shadow-indigo-500/15 flex items-center justify-center mb-4 group transition-transform duration-300 hover:scale-105">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-md group-hover:opacity-70 transition-opacity" />
              <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-slate-950">
                <Image
                  src="/logo.png"
                  alt="Daylight Media Logo"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Daylight Media Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1">Material Inventory & Invoicing Portal</p>
          </div>

          {/* Login Form Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800 shadow-2xl">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="name@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Replay Splash Screen Link */}
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={handleReplaySplash}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Replay Animated Splash Screen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
