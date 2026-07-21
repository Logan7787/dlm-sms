'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export function SplashScreen({ onComplete, minDurationMs = 2400 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Studio System...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const intervalTime = 30; // update interval ms
    const totalSteps = minDurationMs / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.min(Math.round((step / totalSteps) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress < 30) {
        setStatusText('Initializing Studio System...');
      } else if (currentProgress < 65) {
        setStatusText('Loading Material Inventory & Ledgers...');
      } else if (currentProgress < 90) {
        setStatusText('Configuring Invoicing Modules...');
      } else {
        setStatusText('Welcome to Daylight Media');
      }

      if (currentProgress >= 100) {
        clearInterval(timer);
        // Start smooth fade out transition
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 600); // match transition duration
        }, 200);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Radial Light Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-pink-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Sparkle Particles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-indigo-400/40 blur-[1px] animate-float-1 pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full bg-purple-400/30 blur-[1px] animate-float-2 pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-pink-400/40 blur-[1px] animate-float-3 pointer-events-none" />

      {/* Grid Pattern Overlay for Tech Feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center animate-logo-in">
        
        {/* Animated Outer Glowing Aura Ring */}
        <div className="relative mb-8 group">
          {/* Rotating Gradient Ring */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-xl animate-spin-slow" />
          
          {/* Pulsing Backlight */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-80 animate-pulse-glow" />

          {/* Logo Frame Glass Container */}
          <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-3xl bg-slate-900/90 border border-slate-700/60 p-4 shadow-2xl backdrop-blur-2xl flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Daylight Media Logo"
              width={140}
              height={140}
              priority
              className="object-contain w-full h-full drop-shadow-[0_10px_20px_rgba(99,102,241,0.5)] transform transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Studio Management Platform</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
            Daylight Media
          </h1>
          
          <p className="text-sm text-slate-400 font-medium max-w-xs">
            Stock, Inventory & Invoicing System
          </p>
        </div>

        {/* Shimmer Progress Bar Container */}
        <div className="w-full space-y-3">
          <div className="relative w-full h-2 rounded-full bg-slate-900 border border-slate-800/80 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full animate-shimmer transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              {statusText}
            </span>
            <span className="font-bold text-indigo-300">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 text-xs font-medium text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1 py-1.5 px-3 rounded-lg hover:bg-slate-900/60"
      >
        <span>Skip intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
