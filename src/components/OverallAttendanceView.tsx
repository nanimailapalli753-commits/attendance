import React from "react";
import { Subject, AttendanceMetrics, Student } from "../types";
import {
  PieChart,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Award,
  BookOpen,
  Info,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AIAttendanceAdvisor } from "./AIAttendanceAdvisor";

interface OverallAttendanceViewProps {
  student?: Student | null;
  subjects: Subject[];
  metrics: AttendanceMetrics;
}

export const OverallAttendanceView: React.FC<OverallAttendanceViewProps> = ({
  student,
  subjects,
  metrics,
}) => {
  const statusConfig = {
    NEW: {
      color: "text-slate-300",
      bg: "bg-slate-900/90",
      border: "border-slate-800",
      badge: "bg-slate-800 text-slate-300 border border-slate-700",
      icon: Info,
      label: "NEW",
    },
    GOOD: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500/20 text-emerald-300",
      icon: CheckCircle2,
      label: "GOOD",
    },
    WARNING: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      badge: "bg-amber-500/20 text-amber-300",
      icon: AlertTriangle,
      label: "WARNING",
    },
    CRITICAL: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      badge: "bg-rose-500/20 text-rose-300",
      icon: AlertOctagon,
      label: "CRITICAL",
    },
  }[metrics.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <PieChart className="w-4 h-4" />
          <span>INSTITUTIONAL METRICS</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
          Overall Attendance Analysis
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Combined attendance computation across all registered curriculum subjects at PVP Siddhartha Engineering College.
        </p>
      </div>

      {/* Primary Mandate Banner: Main Warning Based on Overall Attendance */}
      <div
        className={`p-5 rounded-2xl border ${statusConfig.border} ${statusConfig.bg} shadow-sm space-y-3`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statusConfig.badge}`}
            >
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Primary College Evaluation
                </span>
                <span
                  id="overall-status-badge"
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${statusConfig.badge}`}
                >
                  STATUS: {statusConfig.label}
                </span>
              </div>
              <h3 className="text-2xl font-black font-mono text-white mt-0.5">
                Overall Attendance: {metrics.overallPercentage}%
              </h3>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Mandatory Minimum
            </span>
            <p className="text-lg font-bold font-mono text-amber-400">
              {metrics.requiredPercentage}% Required
            </p>
          </div>
        </div>

        {/* The Exact Status Message from Prompt */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm font-medium text-slate-200">
          {metrics.statusMessage}
        </div>

        {/* Mandatory Policy Clarification */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Official Policy:</strong> Institutional eligibility warnings are strictly calculated from your combined overall attendance across all subjects, not from individual courses.
          </span>
        </div>
      </div>

      {/* Classes You Can Miss & Recovery Guidance (Section 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Safe Absence Cushion
              </span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-2">
              Classes You Can Miss: {!metrics.hasData ? 0 : metrics.canMissClasses}
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {!metrics.hasData
              ? "No attendance records submitted yet. Complete daily face verification and mark period attendance to calculate your safe cushion."
              : metrics.canMissClasses > 0
              ? `You can safely miss up to ${metrics.canMissClasses} future class periods while keeping your overall attendance comfortably at or above ${metrics.requiredPercentage}%.`
              : "You should avoid missing additional classes."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Overall Tally
              </span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-2">
              {metrics.totalAttended} / {metrics.totalConducted}{" "}
              <span className="text-sm font-normal text-slate-400 font-sans">
                classes attended ({metrics.totalAbsent} absent)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {!metrics.hasData
              ? "New student account with 0% attendance. Daily face verification and period logging will build your official academic record."
              : metrics.overallPercentage < metrics.requiredPercentage
              ? `You need to attend upcoming classes regularly to recover your attendance (minimum ${metrics.recoveryClassesNeeded} consecutive classes).`
              : "Consistently attending scheduled lectures ensures complete eligibility for semester examinations."}
          </p>
        </div>
      </div>

      {/* Subject-wise Attendance Breakdown (Section 4 Supporting Info) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Subject-wise Breakdown (Supporting Information)</span>
            </h4>
            <p className="text-xs text-slate-400">
              Details for each curriculum component in the current semester.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 sm:px-6">Subject</th>
                <th className="py-3 px-4 sm:px-6">Faculty In-charge</th>
                <th className="py-3 px-4 sm:px-6 text-center">Attended</th>
                <th className="py-3 px-4 sm:px-6 text-center">Conducted</th>
                <th className="py-3 px-4 sm:px-6 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {subjects.map((sub) => {
                const hasData = sub.conducted > 0;
                const pct = hasData
                  ? Number(((sub.attended / sub.conducted) * 100).toFixed(1))
                  : 0;
                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-white">{sub.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sub.code}</div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-300">
                      <div>{sub.faculty}</div>
                      <div className="text-[10px] text-slate-500">{sub.room}</div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center font-mono font-bold text-emerald-400">
                      {sub.attended}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center font-mono text-slate-300">
                      {sub.conducted}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs ${
                          !hasData
                            ? "bg-slate-800 text-slate-400"
                            : pct < metrics.requiredPercentage
                            ? "bg-rose-500/20 text-rose-300"
                            : pct >= 85
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Attendance Advisor */}
      <AIAttendanceAdvisor
        subjects={subjects}
        overallMetrics={metrics}
        studentName={student?.name || "Student"}
      />
    </div>
  );
};
