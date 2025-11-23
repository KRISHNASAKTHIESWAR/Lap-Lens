'use client';

import { Session, AllPredictionsResponse } from '../../lib/types';
import { api } from '../../lib/api';
import { useState } from 'react';

interface SessionInfoProps {
  session: Session;
  predictions: AllPredictionsResponse | null;
  onSessionClosed?: () => void;
}

export default function SessionInfo({ session, predictions,onSessionClosed }: SessionInfoProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseSession = async () => {
    setIsClosing(true);
    try {
      await api.closeSession(session.session_id);
      // Call the parent callback when session is closed
      if (onSessionClosed) {
        onSessionClosed();
      }
    } catch (error) {
      console.error('Error closing session:', error);
    } finally {
      setIsClosing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400';
      case 'closed':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="
      bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-2xl p-6 
      border border-[#1a1a1a] 
      shadow-[0_0_20px_rgba(255,0,0,0.15)] 
      hover:shadow-[0_0_35px_rgba(255,0,0,0.3)]
      transition-all duration-500
    ">
      <h2 className="
        text-2xl font-bold font-orbitron tracking-widest mb-6 
        text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.35)]
        border-b border-red-600/50 pb-2
      ">
        SESSION INFO
      </h2>

      {/* DETAILS */}
      <div className="space-y-4 mb-8">
        {/* Line */}
        <div className="flex justify-between items-center py-3 border-b border-[#222]">
          <span className="text-gray-400 font-medium">Session ID</span>
          <span className="text-white font-mono text-sm bg-[#1a1a1a] px-2 py-1 rounded">
            {session.session_id.slice(0, 8)}...
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-[#222]">
          <span className="text-gray-400 font-medium">Vehicle</span>
          <span className="text-red-500 font-bold text-xl font-orbitron">
            #{session.vehicle_id}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-[#222]">
          <span className="text-gray-400 font-medium">Race</span>
          <span className="text-white font-semibold text-right">
            {session.race_name}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-[#222]">
          <span className="text-gray-400 font-medium">Created</span>
          <span className="text-white text-sm tracking-wide">
            {formatDate(session.created_at)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-[#222]">
          <span className="text-gray-400 font-medium">Status</span>
          <span className={`font-semibold flex items-center space-x-2 ${getStatusColor(session.status)}`}>
            <div
              className={`w-3 h-3 rounded-full ${
                session.status === 'active'
                  ? 'bg-green-500'
                  : session.status === 'closed'
                  ? 'bg-red-600'
                  : 'bg-yellow-400'
              } animate-pulse shadow-[0_0_8px_currentColor]`}
            ></div>
            <span className="tracking-widest">{session.status.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* CURRENT LAP */}
      {predictions && (
        <div
          className="
            mb-6 p-5 rounded-xl 
            bg-[#111]/60 border border-[#1f1f1f]
            shadow-[0_0_12px_rgba(255,0,0,0.1)]
          "
        >
          <h3 className="text-lg font-semibold text-gray-300 tracking-wider mb-4">
            CURRENT LAP
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">Lap Number</div>
              <div className="text-3xl font-orbitron font-bold text-white drop-shadow">
                {predictions.lap}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-400">Vehicle</div>
              <div className="text-3xl font-orbitron font-bold text-red-500 drop-shadow">
                #{predictions.vehicle_id}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLOSE SESSION ONLY */}
      <div className="space-y-4">
        <button
          onClick={handleCloseSession}
          disabled={isClosing || session.status === 'closed'}
          className={`
            w-full py-3 px-5 rounded-xl font-semibold font-orbitron tracking-wide
            transition-all duration-300
            ${
              session.status === 'closed' || isClosing
                ? 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.35)] hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:scale-[1.02]'
            }
          `}
        >
          {isClosing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>CLOSING...</span>
            </div>
          ) : (
            'CLOSE SESSION'
          )}
        </button>
      </div>

      {/* SUMMARY */}
      {predictions && (
        <div className="mt-8 pt-6 border-t border-[#222]">
          <h3 className="text-lg font-semibold text-gray-300 tracking-wider mb-4">
            PREDICTION SUMMARY
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Lap Time Confidence</span>
              <span className="text-white font-semibold tracking-wide">
                {(predictions.lap_time_confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Pit Stop Probability</span>
              <span className="text-white font-semibold tracking-wide">
                {(predictions.pit_probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Tire Confidence</span>
              <span className="text-white font-semibold tracking-wide">
                {(predictions.tire_confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
