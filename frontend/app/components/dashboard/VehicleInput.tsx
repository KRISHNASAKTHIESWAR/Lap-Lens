'use client';

import { useState } from 'react';

interface VehicleInputProps {
  onVehicleSelect: (vehicleId: number) => void;
  isLoading: boolean;
}

export default function VehicleInput({ onVehicleSelect, isLoading }: VehicleInputProps) {
  const [vehicleId, setVehicleId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(vehicleId);
    if (id > 0 && id <= 99) {
      onVehicleSelect(id);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold font-orbitron mb-4 text-white">
        START TELEMETRY ANALYSIS
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            VEHICLE NUMBER
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="Enter vehicle number (1-99)"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !vehicleId}
          className={`
            px-8 py-3 bg-red-600 text-white font-bold rounded-lg transition-all duration-300
            hover:bg-red-700 hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            border border-red-500/30
            ${isLoading ? 'animate-pulse' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>CONNECTING...</span>
            </div>
          ) : (
            <span className="tracking-widest">START ANALYSIS</span>
          )}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Enter any vehicle number to create a session and get real predictions from the ML model</p>
      </div>
    </div>
  );
}