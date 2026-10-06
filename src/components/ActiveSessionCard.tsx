import React, { useState, useEffect } from 'react';
import { ParkingPaymentSession } from '../types';
import { LicensePlateBadge } from './LicensePlateBadge';
import { triggerNativeSms } from '../utils/smsHelper';
import {
  testParkingAlert,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
} from '../utils/notificationHelper';
import {
  Clock,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Bell,
  Volume2,
  CheckCircle2,
} from 'lucide-react';

interface ActiveSessionCardProps {
  session: ParkingPaymentSession;
  onExtendSession: (session: ParkingPaymentSession) => void;
  onEndSession: () => void;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  session,
  onExtendSession,
  onEndSession,
}) => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
  );
  const [notifPermission, setNotifPermission] = useState<string>(getNotificationPermissionStatus());
  const [testSuccessMessage, setTestSuccessMessage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [session.expiresAt]);

  const totalDurationSeconds = session.durationMinutes * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalDurationSeconds - timeLeftSeconds) / totalDurationSeconds) * 100)
  );

  const minutesLeft = Math.floor(timeLeftSeconds / 60);
  const secondsLeft = timeLeftSeconds % 60;
  const isExpiringSoon = timeLeftSeconds > 0 && timeLeftSeconds <= 5 * 60; // 5 minutes warning
  const isExpired = timeLeftSeconds <= 0;

  const handleExtend = () => {
    triggerNativeSms(session.smsNumber, session.vehiclePlate);
    onExtendSession(session);
  };

  const formattedExpiryTime = new Date(session.expiresAt).toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="active-parking-session-card"
      className={`p-4 rounded-3xl border transition-all duration-300 shadow-sm space-y-3.5 ${
        isExpired
          ? 'bg-red-950/80 border-red-700 text-white'
          : isExpiringSoon
          ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-400/40 text-white'
          : 'bg-[#12243d] border-blue-900/70 text-white'
      }`}
    >
      {/* Top Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-amber-400' : 'bg-emerald-400'
            } animate-ping`}
          />
          <span
            className={`text-xs font-bold ${
              isExpired ? 'text-red-300' : isExpiringSoon ? 'text-amber-300' : 'text-emerald-300'
            }`}
          >
            {isExpired
              ? 'PARKING JE ISTEKAO'
              : isExpiringSoon
              ? 'ISTIČE ZA MANJE OD 5 MINUTA'
              : 'AKTIVAN PARKING'}
          </span>
        </div>
        <LicensePlateBadge plate={session.vehiclePlate} size="sm" />
      </div>

      {/* Main Info Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-blue-200/80 font-semibold mb-0.5">
            {session.cityName} • {session.zoneName}
          </div>
          <div
            className={`font-mono font-black text-3xl sm:text-4xl tracking-tight ${
              isExpired
                ? 'text-red-400'
                : isExpiringSoon
                ? 'text-amber-400 animate-pulse'
                : 'text-white'
            }`}
          >
            {isExpired
              ? '00:00'
              : `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft
                  .toString()
                  .padStart(2, '0')}`}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            Ističe u: <span className="font-bold text-white">{formattedExpiryTime}</span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="#1e3a5f"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke={isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981'}
              strokeWidth="4"
              strokeDasharray={138.2}
              strokeDashoffset={138.2 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000"
            />
          </svg>
          <Clock className="w-5 h-5 absolute text-blue-300" />
        </div>
      </div>

      {/* Expiry Alert Warning */}
      {isExpiringSoon && (
        <div className="p-2.5 rounded-xl bg-amber-900/60 border border-amber-600/80 flex items-center gap-2 text-xs text-amber-200 font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>
            Vaš parking ističe za <b>manje od 5 minuta</b>. Izaberite produženje ili odustanite.
          </span>
        </div>
      )}

      {/* Notification and Audible Alarm Status & Test Trigger */}
      <div className="p-2 rounded-xl bg-[#183153] border border-blue-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-200 min-w-0">
          <Bell className={`w-3.5 h-3.5 flex-shrink-0 ${notifPermission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="truncate">
            {notifPermission === 'granted' ? (
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline text-emerald-400" />
                Push notifikacija 5 min pre isteka: <b>Aktivna (radi i kada je aplikacija isključena)</b>
              </span>
            ) : (
              <span className="text-amber-300 font-medium">
                Push notifikacija 5 min pre isteka nije omogućena
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {notifPermission !== 'granted' && isNotificationSupported() && (
            <button
              type="button"
              onClick={async () => {
                const granted = await requestNotificationPermission();
                setNotifPermission(granted ? 'granted' : 'denied');
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              Uključi alarm
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await testParkingAlert();
              setTestSuccessMessage(true);
              setNotifPermission(getNotificationPermissionStatus());
              setTimeout(() => setTestSuccessMessage(false), 3500);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#1f3f6a] hover:bg-[#274f85] text-blue-100 font-bold text-[11px] border border-blue-700/60 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            title="Isprobaj zvuk alarma i push notifikaciju"
          >
            <Volume2 className="w-3 h-3 text-blue-300" />
            <span>{testSuccessMessage ? 'Zvuk testiran! 🔔' : 'Testiraj zvuk i alarm'}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons: Produži / Odustani */}
      <div className="flex gap-2 pt-0.5">
        <button
          id="btn-extend-parking"
          onClick={handleExtend}
          className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Produži parking (SMS {session.smsNumber})</span>
        </button>

        <button
          id="btn-end-session"
          onClick={onEndSession}
          className="py-2.5 px-3.5 rounded-xl bg-[#183153] hover:bg-[#1f3f6a] text-slate-300 hover:text-white text-xs font-semibold border border-blue-800/60 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Odustani</span>
        </button>
      </div>
    </div>
  );
};
