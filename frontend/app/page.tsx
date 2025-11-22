// Revamped Next.js + TypeScript Landing Page (with video background)
// Toyota Gazoo Racing Inspired – Futuristic, Clean, High‑Performance UI

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnter = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/vehicles");
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-[0.88]"
      >
        <source src="/f1-racing.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0"></div>

      {/* GAZOO RED GLASS OVERLAY */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-700/10 via-transparent to-red-900/10"></div>

      {/* HYPER GRID */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:55px_55px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white text-center px-6 select-none">
        {/* TITLE */}
        <h1 className="font-orbitron text-[4rem] md:text-[7rem] font-extrabold tracking-tight drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]">
          <span className="text-white">LAP</span>
          <span className="text-red-600 animate-pulse">LENS</span>
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-gray-300 font-light max-w-2xl leading-relaxed">
          REAL‑TIME TELEMETRY INTELLIGENCE
          <br />
          <span className="text-red-400 tracking-widest">BARBER MOTORSPORTS PARK</span>
        </p>

        {/* CENTER LINE */}
        <div className="mt-6 w-40 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

        {/* ENTER BUTTON */}
        <button
          onClick={handleEnter}
          disabled={isLoading}
          className="group mt-10 relative px-14 py-4 text-xl font-bold rounded-xl border-2 border-red-600 overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_35px_rgba(255,0,0,0.5)]"
        >
          <span className="relative z-10 tracking-widest">
            {isLoading ? "INITIALIZING..." : "ENTER RACE CONTROL"}
          </span>

          {/* Hover fill */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </button>

        {/* LOADING DOTS */}
        {isLoading && (
          <div className="mt-14 text-center">
            <div className="flex space-x-2 justify-center mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                ></div>
              ))}
            </div>
            <p className="text-gray-400 text-sm tracking-widest">
              BOOTING TELEMETRY SYSTEM...
            </p>
          </div>
        )}
      </div>

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${7 + Math.random() * 7}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
