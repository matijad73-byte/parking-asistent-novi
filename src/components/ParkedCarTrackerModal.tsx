import React from 'react';
import { ParkedLocation, Vehicle } from '../types';
import { ParkedCarTracker } from './ParkedCarTracker';
import { X, MapPin } from 'lucide-react';

interface ParkedCarTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkedLocation: ParkedLocation | null;
  userCoords: { lat: number; lng: number } | null;
  vehicles: Vehicle[];
  onSaveParkedLocation: (location: ParkedLocation | null) => void;
  onOpenMap: () => void;
  onTriggerGps: () => void;
}

export const ParkedCarTrackerModal: React.FC<ParkedCarTrackerModalProps> = ({
  isOpen,
  onClose,
  parkedLocation,
  userCoords,
  vehicles,
  onSaveParkedLocation,
  onOpenMap,
  onTriggerGps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gde sam parkirao</h3>
              <p className="text-xs text-slate-500">Lokacija i navigacija do automobila</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracker Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <ParkedCarTracker
            parkedLocation={parkedLocation}
            userCoords={userCoords}
            vehicles={vehicles}
            onSaveParkedLocation={onSaveParkedLocation}
            onOpenMap={onOpenMap}
            onTriggerGps={onTriggerGps}
          />
        </div>
      </div>
    </div>
  );
};
