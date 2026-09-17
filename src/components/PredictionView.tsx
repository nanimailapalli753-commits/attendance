import React, { useState } from "react";
import { AttendanceMetrics, Subject } from "../types";
import {
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Info,
} from "lucide-react";
import { predictSemesterAttendance } from "../data/mockData";

interface PredictionViewProps {
  metrics: AttendanceMetrics;
  subjects: Subject[];
}

export const PredictionView: React.FC<PredictionViewProps> = ({ metrics, subjects }) => {
  const [futureClasses, setFutureClasses] = useState<number>(40);
  const [expectedRate, setExpectedRate] = useState<number>(85);

  const predictedPercentage = predictSemesterAttendance(
    metrics.totalAttended,
    metrics.totalConducted,
    futureClasses,
    expectedRate
  );

  const hasData = metrics.hasData && predictedPercentage !== null;
  const isEligible = hasData && predictedPercentage >= metrics.requiredPercentage;
  const delta = hasData ? Number((predictedPercentage - metrics.overallPercentage).toFixed(1)) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <TrendingUp className="w-4 h-4" />
          <span>PROJECTION ENGINE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
          Semester Attendance Prediction
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Simulate future semester attendance scenarios based on planned class attendance.
        </p>
      </div>

      {/* Comparison Headline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Overall Attendance */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Overall Attendance
            </span>
            <div
              id="prediction-current-overall"
              className="text-2xl sm:text-3xl font-black font-mono text-white mt-2"
            >
              Current Overall: {metrics.overallPercentage}%
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Based on {metrics.totalAttended} / {metrics.totalConducted} classes attended so far ({metrics.totalAbsent} absent).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Required Threshold</span>
            <span className="font-mono font-bold text-amber-400">
              {metrics.requiredPercentage}%
            </span>
          </div>
        </div>

        {/* Predicted Semester Attendance */}
        <div
          className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
            !hasData
              ? "bg-slate-900 border-slate-800 text-slate-300"
              : isEligible
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/20 border-rose-500/30 text-rose-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Predicted Semester Attendance
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  !hasData
                    ? "bg-slate-800 text-slate-400 border border-slate-700"
                    : isEligible
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {!hasData ? "NOT ENOUGH DATA" : isEligible ? "ELIGIBLE" : "INELIGIBLE"}
              </span>
            </div>
            <div
              id="prediction-projected-overall"
              className="text-2xl sm:text-3xl font-black font-mono text-white mt-2"
            >
              {!hasData ? "Not enough data" : `Predicted: ${predictedPercentage}%`}
            </div>
            <p className="text-xs text-slate-300 mt-2">
              {!hasData ? (
                "Attendance prediction requires actual manual attendance entries."
              ) : (
                <>
                  Net change:{" "}
                  <span
                    className={`font-mono font-bold ${
                      (delta || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {(delta || 0) >= 0 ? `+${delta}%` : `${delta}%`}
                  </span>{" "}
                  from current standing.
                </>
              )}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs">
            {!hasData ? (
              <>
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-400 font-medium">
                  Log today's attendance periods after daily face verification to generate predictions.
                </span>
              </>
            ) : isEligible ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">
                  Safely clears the {metrics.requiredPercentage}% minimum requirement.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-300 font-medium">
                  Falls short of {metrics.requiredPercentage}%. Higher future attendance needed.
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sliders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Interactive Projection Parameters</h3>
        </div>

        {!hasData && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white">Baseline Data Required for Simulation</span>
              <p className="text-slate-400 leading-relaxed">
                This account has 0 conducted classes. Once you mark your first day of attendance (Present/Absent for timetable periods), dynamic projection calculations and simulator controls will be fully operational.
              </p>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${!hasData ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Slider 1: Expected Future Attendance Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="slider-expected-rate"
                className="text-xs font-semibold text-slate-300"
              >
                Expected Future Attendance Rate:
              </label>
              <span className="font-mono font-bold text-amber-400 text-sm bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                {expectedRate}%
              </span>
            </div>
            <input
              id="slider-expected-rate"
              type="range"
              min="0"
              max="100"
              step="1"
              value={expectedRate}
              onChange={(e) => setExpectedRate(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Miss all)</span>
              <span>75% (Minimum)</span>
              <span>100% (Attend all)</span>
            </div>
          </div>

          {/* Slider 2: Remaining Semester Classes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="slider-future-classes"
                className="text-xs font-semibold text-slate-300"
              >
                Remaining Semester Classes:
              </label>
              <span className="font-mono font-bold text-blue-400 text-sm bg-blue-400/10 px-2.5 py-0.5 rounded border border-blue-400/20">
                {futureClasses} classes
              </span>
            </div>
            <input
              id="slider-future-classes"
              type="range"
              min="10"
              max="100"
              step="5"
              value={futureClasses}
              onChange={(e) => setFutureClasses(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 classes</span>
              <span>40 classes (Mid-sem)</span>
              <span>100 classes (End-sem)</span>
            </div>
          </div>
        </div>

        {/* Mathematical Breakdown Box */}
        {hasData && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
            <div className="text-amber-400 font-bold mb-1">
              Projection Calculation Breakdown:
            </div>
            <div className="flex justify-between">
              <span>Projected Total Classes:</span>
              <span>{metrics.totalConducted + futureClasses} classes</span>
            </div>
            <div className="flex justify-between">
              <span>Projected Attended Classes:</span>
              <span>
                {metrics.totalAttended} + {Math.round((futureClasses * expectedRate) / 100)} ={" "}
                {metrics.totalAttended + Math.round((futureClasses * expectedRate) / 100)} classes
              </span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
              <span>Final Projected Semester Rate:</span>
              <span className="text-amber-400">{predictedPercentage}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
