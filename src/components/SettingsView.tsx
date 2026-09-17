import React from "react";
import { Settings, ShieldCheck, Sliders, RotateCcw, Check, Sparkles, Camera } from "lucide-react";

interface SettingsViewProps {
  requiredThreshold: number;
  onUpdateThreshold: (val: number) => void;
  onResetTodayVerification: () => void;
  onResetAllData: () => void;
  isVerifiedToday: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  requiredThreshold,
  onUpdateThreshold,
  onResetTodayVerification,
  onResetAllData,
  isVerifiedToday,
}) => {
  const thresholds = [75, 80, 85];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Settings className="w-4 h-4" />
          <span>PORTAL CONFIGURATION</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
          Portal Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure attendance criteria, simulation rules, and account reset options.
        </p>
      </div>

      <div className="space-y-4">
        {/* Threshold Setting */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Institutional Attendance Requirement Threshold</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set the minimum overall attendance threshold used for GOOD / WARNING / CRITICAL warnings.
              </p>
            </div>
            <span className="font-mono font-bold text-amber-400 text-base bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
              {requiredThreshold}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {thresholds.map((t) => {
              const active = requiredThreshold === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdateThreshold(t)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    active
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                      : "bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-base font-mono">{t}%</span>
                  <span className="text-[10px] opacity-80">
                    {t === 75
                      ? "Standard JNTUK"
                      : t === 80
                      ? "PVP Recommended"
                      : "Honors Benchmark"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Verification Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Daily Face Verification Status</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Face recognition is used only once per day for portal check-in.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Current Status: </span>
              <span
                className={`font-semibold ${
                  isVerifiedToday ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isVerifiedToday
                  ? "✓ Verified for Today"
                  : "Pending Daily Verification"}
              </span>
            </div>

            {isVerifiedToday && (
              <button
                type="button"
                onClick={onResetTodayVerification}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Today Check-in
              </button>
            )}
          </div>
        </div>

        {/* Reset All Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset Portal Data to Official College Defaults</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clears manual test modifications, custom subjects, or altered period records and reloads official defaults.
            </p>
          </div>

          <button
            type="button"
            onClick={onResetAllData}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Data to College Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
