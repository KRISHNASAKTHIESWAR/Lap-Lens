import { Session } from '../../lib/types';

interface VehicleSelectorProps {
  sessions: Session[];
  selectedVehicle: number | null;
  onVehicleSelect: (vehicleId: number) => void;
  isLoading: boolean;
}

export default function VehicleSelector({ 
  sessions, 
  selectedVehicle, 
  onVehicleSelect, 
  isLoading 
}: VehicleSelectorProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-white font-orbitron">
        ACTIVE VEHICLES
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {sessions.map((session) => (
          <button
            key={session.vehicle_id}
            onClick={() => onVehicleSelect(session.vehicle_id)}
            disabled={isLoading}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-300 transform hover:scale-105
              ${selectedVehicle === session.vehicle_id
                ? 'border-red-600 bg-red-600/20 shadow-lg shadow-red-500/25'
                : 'border-gray-600 bg-gray-700/50 hover:border-red-500/50'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="text-center">
              <div className={`
                text-3xl font-bold font-orbitron mb-2
                ${selectedVehicle === session.vehicle_id ? 'text-white' : 'text-gray-300'}
              `}>
                #{session.vehicle_id}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                {session.status === 'active' ? (
                  <span className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    ACTIVE
                  </span>
                ) : (
                  <span>INACTIVE</span>
                )}
              </div>
            </div>

            {/* Selection indicator */}
            {selectedVehicle === session.vehicle_id && (
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}