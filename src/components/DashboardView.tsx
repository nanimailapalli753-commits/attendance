import React from "react";
import { Student, Subject, AttendanceMetrics, CMSNavTab } from "../types";
import {
  Percent,
  BookOpen,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Camera,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  Info,
} from "lucide-react";
import { predictSemesterAttendance } from "../data/mockData";

interface DashboardViewProps {
  student: Student;
  subjects: Subject[];
  metrics: AttendanceMetrics;
  onNavigate: (tab: CMSNavTab) => void;
  onOpenDailyVerification: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  subjects,
  metrics,
  onNavigate,
  onOpenDailyVerification,
}) => {
  const isVerifiedToday =
    student.dailyVerifiedDate === new Date().toISOString().split("T")[0] ||
    student.dailyVerifiedDate === "2026-09-13";

  // Calculate predicted semester attendance based on expected 85% future attendance for remaining 40 classes
  const remainingProjectedClasses = 40;
  const predictedRate = predictSemesterAttendance(
    metrics.totalAttended,
    metrics.totalConducted,
    remainingProjectedClasses,
    85
  );

  // Status-specific styling
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
      {/* Primary Institutional Overall Warning Banner */}
      <div
        className={`rounded-2xl p-5 border ${statusConfig.border} ${statusConfig.bg} transition-all shadow-sm`}
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Institutional Attendance Warning
                </span>
                <span
                  id="dashboard-status-pill"
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${statusConfig.badge}`}
                >
                  STATUS: {statusConfig.label}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Overall Attendance: {metrics.overallPercentage}%
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                {metrics.statusMessage}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              id="dashboard-banner-calendar-btn"
              onClick={() => onNavigate("calendar")}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Attendance Calendar</span>
            </button>
            <button
              onClick={() => onNavigate("overall")}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key CMS Metric Cards (Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Overall Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Overall Attendance
            </span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div
              id="card-overall-percentage"
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${statusConfig.color}`}
            >
              {metrics.overallPercentage}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Req. Min: {metrics.requiredPercentage}%
            </p>
          </div>
        </div>

        {/* Card 2: Total Classes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Classes
            </span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div
              id="card-total-classes"
              className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight"
            >
              {metrics.totalConducted}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Conducted across semester</p>
          </div>
        </div>

        {/* Card 3: Classes Attended */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Classes Attended
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div
              id="card-classes-attended"
              className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight"
            >
              {metrics.totalAttended}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {metrics.totalAbsent} absent / {metrics.totalConducted} total
            </p>
          </div>
        </div>

        {/* Card 4: Classes Can Miss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Classes Can Miss
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div
              id="card-classes-can-miss"
              className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight"
            >
              {!metrics.hasData ? 0 : metrics.canMissClasses}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {!metrics.hasData
                ? "Requires recorded classes"
                : metrics.canMissClasses > 0
                ? `Safe cushion (${metrics.requiredPercentage}% req.)`
                : metrics.overallPercentage < metrics.requiredPercentage
                ? "Attend classes to recover"
                : "Avoid missing classes"}
            </p>
          </div>
        </div>

        {/* Card 5: Predicted Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Predicted Attendance
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div
              id="card-predicted-attendance"
              className={`font-black font-mono tracking-tight ${
                predictedRate === null
                  ? "text-sm sm:text-base text-slate-400 font-sans"
                  : "text-2xl sm:text-3xl text-cyan-400"
              }`}
            >
              {predictedRate === null ? "Not enough data" : `${predictedRate}%`}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {predictedRate === null ? "Requires manual attendance entries" : "Based on projected 85%"}
            </p>
          </div>
        </div>

        {/* Card 6: Attendance Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Attendance Status
            </span>
            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
          </div>
          <div>
            <div
              id="card-attendance-status"
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${statusConfig.color}`}
            >
              {statusConfig.label}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Official threshold check</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Today's Period Action + Subject-wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Daily Verification & Today's Attendance Quick Action */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                <span>Today&apos;s Attendance Action</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date().toISOString().split("T")[0]}
              </span>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Daily Face Verification:</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isVerifiedToday
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isVerifiedToday ? "✓ Completed" : "Pending Check-in"}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isVerifiedToday
                  ? "Daily verification completed. You can record manual period attendance for Java, Python, Mathematics, Data Structures, AI, and English."
                  : "Complete your one-time daily face verification to record and submit your timetable attendance."}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {!isVerifiedToday ? (
              <button
                id="dashboard-verify-daily-btn"
                onClick={onOpenDailyVerification}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Verify Face for Today</span>
              </button>
            ) : (
              <button
                id="dashboard-goto-today-btn"
                onClick={() => onNavigate("today")}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Open Today&apos;s Attendance</span>
              </button>
            )}

            <button
              onClick={() => onNavigate("timetable")}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>View Weekly Timetable</span>
            </button>

            <button
              id="dashboard-goto-calendar-btn"
              onClick={() => onNavigate("calendar")}
              className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Attendance Calendar (Past & Future)</span>
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Subject-wise Attendance Supporting Information */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Subject-wise Attendance (Supporting Information)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Individual subject metrics are for reference. Official semester eligibility uses Overall Attendance.
              </p>
            </div>
            <button
              onClick={() => onNavigate("overall")}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5">
            {subjects.map((sub) => {
              const hasData = sub.conducted > 0;
              const pct = hasData
                ? Number(((sub.attended / sub.conducted) * 100).toFixed(1))
                : 0;
              const isLow = hasData && pct < metrics.requiredPercentage;

              return (
                <div
                  key={sub.id}
                  className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {sub.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">
                        {sub.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {sub.attended} / {sub.conducted} classes
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          !hasData
                            ? "bg-slate-800 text-slate-400"
                            : isLow
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        !hasData
                          ? "bg-slate-700"
                          : isLow
                          ? "bg-rose-500"
                          : pct >= 85
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
