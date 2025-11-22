'use client';

import { useState, useEffect } from 'react';

interface ControlPanelProps {
  activeView: string;
  onViewChange: (view: any) => void;
  vehicleId: number;
}

export default function ControlPanel({ activeView, onViewChange, vehicleId }: ControlPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState({
    telemetry: true,
    predictions: true,
    gps: true,
    ai: true,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const views = [
    { id: 'overview', label: 'OVERVIEW', color: 'from-[#EB0A1E] to-black', description: 'Key metrics and predictions' },
    { id: 'telemetry', label: 'TELEMETRY',  color: 'from-[#D70D1E] to-black', description: 'Live data streams' },
    { id: 'predictions', label: 'AI PREDICTIONS',  color: 'from-black to-[#EB0A1E]', description: 'ML model insights' },
    { id: 'track', label: 'TRACK MAP', color: 'from-black to-[#9B0B16]', description: 'Live positioning' },
    { id: 'metrics', label: 'ANALYTICS', color: 'from-[#9B0B16] to-black', description: 'Detailed analysis' },
  ];

  const getStatusColor = (status: boolean) => (status ? 'bg-[#EB0A1E]' : 'bg-gray-800');

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl p-6 border border-[#EB0A1E]/40 shadow-[0_0_25px_rgba(235,10,30,0.4)] transition-all duration-700 hover:shadow-[0_0_40px_rgba(235,10,30,0.6)]">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C00819] to-black rounded-2xl flex items-center justify-center border border-[#EB0A1E]/80 shadow-[0_0_10px_rgba(235,10,30,0.5)]">
              <span className="text-2xl font-bold text-white">#{vehicleId}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#EB0A1E] rounded-full border-2 border-black animate-ping"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold font-orbitron text-white bg-gradient-to-r from-white to-[#EB0A1E] bg-clip-text text-transparent">
              TOYOTA CONTROL
            </h1>
            <p className="text-gray-300 text-sm mt-1 flex items-center space-x-2">
              <span>Toyota GR</span>
              <span className="text-[#EB0A1E]">•</span>
              <span className="text-[#EB0A1E] flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-[#EB0A1E] rounded-full animate-pulse" />
                <span>LIVE</span>
              </span>
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(systemStatus).map(([system, status]) => (
            <div key={system} className="flex items-center space-x-2 bg-gray-800/70 px-3 py-2 rounded-lg border border-gray-700/70">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">{system}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              group relative flex flex-col items-center p-4 rounded-xl border transition-all duration-500 transform
              ${activeView === view.id 
                ? `bg-gradient-to-br ${view.color} border-[#EB0A1E]/50 scale-105 shadow-[0_0_20px_rgba(235,10,30,0.5)]`
                : 'bg-gray-900/70 border-gray-700 hover:border-[#EB0A1E]/60 hover:scale-105 hover:bg-gray-800/80'}
              overflow-hidden
            `}
          >
            {activeView === view.id && (
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
            )}
            <span className={`
              font-orbitron font-semibold text-sm tracking-wide relative z-10 text-center
              ${activeView === view.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}
            `}>
              {view.label}
            </span>

            <span className={`
              text-xs mt-1 relative z-10 text-center
              ${activeView === view.id ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-300'}
            `}>
              {view.description}
            </span>
          </button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-4 border-t border-[#EB0A1E]/30 gap-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#EB0A1E] rounded-full animate-pulse"></div>
            <span className="text-[#EB0A1E] font-semibold">SYSTEM ACTIVE</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">AI ONLINE</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400 font-semibold">GPS SYNCED</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="font-mono bg-black/90 px-3 py-1 rounded-lg border border-[#EB0A1E]/40 text-white">
            {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="font-mono bg-black/90 px-3 py-1 rounded-lg border border-[#EB0A1E]/40 text-white">
            VEHICLE #{vehicleId}
          </div>
        </div>
      </div>

      {/* Connection Quality */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <span>CONNECTION QUALITY:</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1 h-3 rounded-full transition-all duration-300 ${
                  bar <= 4 ? 'bg-[#EB0A1E]' : 'bg-gray-700'
                } ${bar === 4 ? 'animate-pulse' : ''}`}
              />
            ))}
          </div>
          <span className="text-[#EB0A1E] font-semibold">EXCELLENT</span>
        </div>
        <div>
          LATENCY: <span className="text-[#EB0A1E] font-mono">18ms</span>
        </div>
      </div>
    </div>
  );
}
