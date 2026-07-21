'use client';

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export function SplashScreen({ onComplete, minDurationMs = 2800 }: SplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black cursor-pointer select-none transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>{`
        .splash-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,153,0,0.25) 0%, rgba(255,153,0,0) 70%);
          animation: pulseGlow 2.5s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .logo-wrap {
          position: relative;
          opacity: 0;
          transform: scale(0.4) rotate(-8deg);
          animation: logoIn 1.1s cubic-bezier(.34,1.56,.64,1) forwards;
        }

        @keyframes logoIn {
          0% { opacity: 0; transform: scale(0.4) rotate(-8deg); }
          60% { opacity: 1; transform: scale(1.08) rotate(2deg); }
          80% { transform: scale(0.97) rotate(-1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .logo-img {
          width: 340px;
          max-width: 80vw;
          display: block;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 18px rgba(255,153,0,0.35));
        }

        .shine {
          position: absolute;
          top: 0;
          left: -150%;
          width: 60%;
          height: 100%;
          background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
          z-index: 3;
          animation: shineSweep 2.6s ease-in-out 1.1s infinite;
          pointer-events: none;
        }

        @keyframes shineSweep {
          0% { left: -150%; }
          35% { left: 150%; }
          100% { left: 150%; }
        }

        .loader {
          margin-top: 44px;
          display: flex;
          gap: 10px;
          opacity: 0;
          animation: fadeUp .6s ease-out 1.0s forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FF9900;
          animation: dotBounce 1s ease-in-out infinite;
        }

        .dot:nth-child(2) { animation-delay: .15s; }
        .dot:nth-child(3) { animation-delay: .3s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .4; }
          40% { transform: translateY(-10px); opacity: 1; }
        }

        .tagline {
          margin-top: 18px;
          color: #888;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeUp .6s ease-out 1.3s forwards;
        }
      `}</style>

      <div className="splash-container">
        <div className="glow-bg"></div>
        <div className="logo-wrap">
          <img className="logo-img" src="/logo.png" alt="Daylight Media Logo" />
          <div className="shine"></div>
        </div>
        <div className="loader">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <div className="tagline">Stock &amp; Inventory Management System</div>
      </div>
    </div>
  );
}
