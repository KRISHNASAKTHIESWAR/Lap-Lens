'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VehicleSelection() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const vehicleNumbers = [
    1, 2, 3, 4, 5, 6, 10, 11, 14, 16, 18, 20,
    22, 23, 24, 27, 31, 33, 44, 55, 63, 77, 81, 99
  ];
  

  const handleVehicleSelect = async (vehicleId: number,raceName:string="Race 1") => {
    setSelectedVehicle(vehicleId);
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/session/create?vehicle_id=${vehicleId}&race_name=${encodeURIComponent(raceName)}`,{
            method: 'POST',
        }
      );
      const session = await response.json();
      router.push(`/analysis?session_id=${session.session_id}&vehicle_id=${vehicleId}`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">

      {/* 🔥 Carbon Fiber Background */}
      <div className="absolute inset-0 bg-[url('/carbon.png')] bg-repeat opacity-20"></div>

      {/* 🔺 Red Motion Blur Sweep */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-black mix-blend-screen animate-pulse"></div>

      {/* 🔥 Toyota Gazoo Racing Accent Beam */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-red-700/20 blur-3xl rounded-full"></div>
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-red-500/10 blur-2xl rounded-full"></div>

      {/* HEADER */}
      <div className="relative z-10 text-center pt-16 pb-8">
        <Link href="/">
          <h1 className="text-5xl md:text-7xl font-orbitron font-extrabold tracking-tighter hover:scale-105 transition-transform">
            LAP<span className="text-red-600">LENS</span>
          </h1>
        </Link>

        <p className="text-gray-300 mt-3 tracking-wider text-lg">
          BARBER MOTORSPORTS PARK
        </p>

        <div className="mx-auto mt-4 w-28 h-1 bg-red-600 rounded-full shadow-red-600 shadow-lg"></div>
      </div>

      {/* VEHICLE GRID */}
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5 px-6 pb-20">

        {vehicleNumbers.map((num) => {
          const isActive = selectedVehicle === num;

          return (
            <button
              key={num}
              disabled={isLoading && !isActive}
              onClick={() => handleVehicleSelect(num)}
              className={`group relative aspect-square rounded-xl border-2 backdrop-blur-md 
                transition-all duration-500 overflow-hidden
                flex items-center justify-center 
                font-orbitron text-2xl font-bold

                ${
                  isActive
                    ? 'border-red-600 bg-red-700/80 scale-110 shadow-xl shadow-red-600/40'
                    : 'border-white/10 bg-white/5 hover:scale-105 hover:border-red-600'
                }
              `}
            >

              {/* 🔥 Glow sweep on hover */}
              <div
                className="absolute inset-0 bg-gradient-to-r 
                from-transparent via-red-500/20 to-transparent
                translate-x-[-120%] group-hover:translate-x-[120%]
                transition-transform duration-1000"
              />

              {/* Number */}
              <span
                className={`relative z-10 ${
                  isActive ? 'text-white drop-shadow-lg scale-125' : 'text-gray-300'
                }`}
              >
                {num}
              </span>

              {/* Loading Screen */}
              {isLoading && isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-700/80">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* LOADING STATUS */}
      {isLoading && (
        <div className="relative z-10 text-center pb-10">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 border border-red-500 backdrop-blur-md shadow-lg shadow-red-600/30">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="ml-2 text-red-200 tracking-widest">
              INITIALIZING VEHICLE {selectedVehicle} SYSTEMS...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
