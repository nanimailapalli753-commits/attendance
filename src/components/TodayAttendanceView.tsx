import React, { useState, useMemo, useEffect } from "react";
import {
  Student,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  NonWorkingDay,
} from "../types";
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Send,
  ShieldCheck,
  Camera,
  Calendar,
  Check,
  X as XIcon,
  RotateCcw,
  Sparkles,
  Info,
  Ban,
} from "lucide-react";
import { checkIsNonWorkingDay, formatDateToDDMMYYYY } from "../data/mockData";

interface TodayAttendanceViewProps {
  student: Student;
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendanceHistory: AttendanceRecord[];
  academicHolidays?: NonWorkingDay[];
  workingSundays?: string[];
  onSubmitTodayAttendance: (
    records: {
      period: number;
      time: string;
      subjectId: string;
      subjectName: string;
      status: "PRESENT" | "ABSENT";
    }[],
    targetDate?: string
  ) => void;
  onOpenDailyVerification: (targetDate?: string) => void;
}

export const TodayAttendanceView: React.FC<TodayAttendanceViewProps> = ({
  student,
  subjects,
  timetable,
  attendanceHistory,
  academicHolidays,
  workingSundays,
  onSubmitTodayAttendance,
  onOpenDailyVerification,
}) => {
  // Pre-configured academic days to support Day 1, Day 2, Day 3 progressive testing
  const ACADEMIC_DAYS = [
    { id: "day-1", label: "Day 1 (Sunday)", date: "2026-09-13", display: "Sunday, 13 Sep 2026" },
    { id: "day-2", label: "Day 2 (Vinayaka Chavithi)", date: "2026-09-14", display: "Monday, 14 Sep 2026 (14-09-2026)" },
    { id: "day-3", label: "Day 3 (Working Day)", date: "2026-09-15", display: "Tuesday, 15 Sep 2026" },
    { id: "day-4", label: "Day 4 (Working Day)", date: "2026-09-16", display: "Wednesday, 16 Sep 2026" },
  ];

  const [selectedDate, setSelectedDate] = useState<string>("2026-09-13");

  // Check if selectedDate is a Non-Working Day / Holiday using Siddhartha Academy holiday list
  const holidayCheck = useMemo(() => {
    return checkIsNonWorkingDay(selectedDate, academicHolidays, workingSundays);
  }, [selectedDate, academicHolidays, workingSundays]);

  // Formatted date string for holiday display (e.g. September 14, 2026 and 14-09-2026)
  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDate.split("-").map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate]);

  const ddMmYyyyDate = useMemo(() => {
    return formatDateToDDMMYYYY(selectedDate);
  }, [selectedDate]);

  // Check if student completed one-time face verification for the selected date
  const isVerifiedForSelectedDate = useMemo(() => {
    if (!student) return false;
    const verifiedList = student.verifiedDates || [];
    return (
      verifiedList.includes(selectedDate) ||
      student.dailyVerifiedDate === selectedDate ||
      (selectedDate === "2026-09-13" && student.dailyVerifiedDate === "2026-09-13")
    );
  }, [student, selectedDate]);

  // Standard 5 curriculum periods per day matching the user's PRD specification
  // (e.g. Day 1: 5 periods -> 4 Present, 1 Absent = 80%; Day 2: 5 periods -> 5 Present = 90%)
  const dayPeriods: TimetableSlot[] = useMemo(() => {
    return [
      {
        id: "p-1",
        day: "Monday",
        period: 1,
        time: "09:00 - 10:00",
        subjectId: "sub-java",
        subjectName: "Java",
        faculty: "Dr. K. Srinivas Rao",
        room: "Room 301",
      },
      {
        id: "p-2",
        day: "Monday",
        period: 2,
        time: "10:00 - 11:00",
        subjectId: "sub-math",
        subjectName: "Mathematics",
        faculty: "Prof. M. V. Ratnam",
        room: "Room 302",
      },
      {
        id: "p-3",
        day: "Monday",
        period: 3,
        time: "11:15 - 12:15",
        subjectId: "sub-python",
        subjectName: "Python",
        faculty: "Dr. P. Venkata Lakshmi",
        room: "Lab 2",
      },
      {
        id: "p-4",
        day: "Monday",
        period: 4,
        time: "01:15 - 02:15",
        subjectId: "sub-ds",
        subjectName: "Data Structures",
        faculty: "Dr. B. Janardhana Rao",
        room: "Room 304",
      },
      {
        id: "p-5",
        day: "Monday",
        period: 5,
        time: "02:15 - 03:15",
        subjectId: "sub-ai",
        subjectName: "AI",
        faculty: "Dr. S. Madhavi",
        room: "Room 405",
      },
    ];
  }, []);

  // Check if any periods have already been submitted for the selected date
  const submittedRecordsForDate = useMemo(() => {
    return attendanceHistory.filter(
      (h) => h.studentId === student.id && h.date === selectedDate
    );
  }, [attendanceHistory, student.id, selectedDate]);

  const hasAlreadySubmitted = submittedRecordsForDate.length > 0;

  // Selections state: { [periodNumber]: "PRESENT" | "ABSENT" }
  const [periodSelections, setPeriodSelections] = useState<{
    [period: number]: "PRESENT" | "ABSENT";
  }>({});

  // Sync selections when selectedDate or submitted records change
  useEffect(() => {
    const initial: { [period: number]: "PRESENT" | "ABSENT" } = {};
    dayPeriods.forEach((p) => {
      const existing = submittedRecordsForDate.find((r) => r.period === p.period);
      if (existing) {
        initial[p.period] = existing.status;
      } else {
        // Default to PRESENT for easy manual logging
        initial[p.period] = "PRESENT";
      }
    });
    setPeriodSelections(initial);
  }, [selectedDate, submittedRecordsForDate, dayPeriods]);

  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleToggleStatus = (period: number, status: "PRESENT" | "ABSENT") => {
    setPeriodSelections((prev) => ({
      ...prev,
      [period]: status,
    }));
  };

  const handleSelectAllPresent = () => {
    const updated: { [period: number]: "PRESENT" | "ABSENT" } = {};
    dayPeriods.forEach((p) => {
      updated[p.period] = "PRESENT";
    });
    setPeriodSelections(updated);
  };

  const handleSetSampleDay1 = () => {
    // 4 Present, 1 Absent (e.g. absent in AI)
    setPeriodSelections({
      1: "PRESENT",
      2: "PRESENT",
      3: "PRESENT",
      4: "PRESENT",
      5: "ABSENT",
    });
  };

  // Live counters for current day
  const presentCount = Object.values(periodSelections).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(periodSelections).filter((s) => s === "ABSENT").length;
  const dayRate =
    dayPeriods.length > 0 ? ((presentCount / dayPeriods.length) * 100).toFixed(0) : "0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerifiedForSelectedDate) {
      onOpenDailyVerification(selectedDate);
      return;
    }

    const recordsToSubmit = dayPeriods.map((p) => ({
      period: p.period,
      time: p.time,
      subjectId: p.subjectId,
      subjectName: p.subjectName,
      status: periodSelections[p.period] || "PRESENT",
    }));

    onSubmitTodayAttendance(recordsToSubmit, selectedDate);
    setSubmittedMessage(
      `Attendance for ${selectedDate} submitted! Recorded ${presentCount} Present, ${absentCount} Absent.`
    );
    setTimeout(() => setSubmittedMessage(null), 6000);
  };

  const currentDayInfo =
    ACADEMIC_DAYS.find((d) => d.date === selectedDate) || {
      label: "Selected Date",
      display: selectedDate,
    };

  return (
    <div className="space-y-6">
      {/* Day Selector & Academic Calendar Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Calendar className="w-4 h-4" />
              <span>ACADEMIC TIMETABLE &amp; PERIOD ATTENDANCE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Manual Period Attendance
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {currentDayInfo.display} • 5 Timetable Periods
            </p>
          </div>

          {/* Daily Face Verification Status */}
          <div className="flex flex-col sm:items-end gap-1.5">
            {isVerifiedForSelectedDate ? (
              <div
                id="daily-verification-status-badge"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Daily Verification: ✓ Completed</span>
              </div>
            ) : (
              <button
                id="btn-verify-face-prompt"
                type="button"
                onClick={() => onOpenDailyVerification(selectedDate)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer animate-pulse"
              >
                <Camera className="w-4 h-4" />
                <span>Verify Face for {currentDayInfo.label}</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              {isVerifiedForSelectedDate
                ? "Identity verified once today. You may now record your periods."
                : "One-time daily verification required before submitting attendance."}
            </span>
          </div>
        </div>

        {/* Day Selector Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Select Day:</span>
            <div className="flex flex-wrap gap-2">
              {ACADEMIC_DAYS.map((day) => {
                const active = selectedDate === day.date;
                const isDayVerified =
                  (student.verifiedDates && student.verifiedDates.includes(day.date)) ||
                  student.dailyVerifiedDate === day.date;
                const isDayRecorded = attendanceHistory.some(
                  (h) => h.studentId === student.id && h.date === day.date
                );

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span>{day.label}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ({day.date.slice(5)})
                    </span>
                    {isDayRecorded && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Submitted" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">Quick Test:</span>
            <button
              type="button"
              onClick={handleSetSampleDay1}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
              title="Sets 4 Present, 1 Absent (80% rate)"
            >
              Preset: 4 Present, 1 Absent
            </button>
            <button
              type="button"
              onClick={handleSelectAllPresent}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
              title="Sets 5 Present, 0 Absent (100% rate)"
            >
              Preset: 5 Present
            </button>
          </div>
        </div>

        {/* Information & Toast */}
        {!isVerifiedForSelectedDate && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                Daily Verification Required for {currentDayInfo.label}
              </p>
              <p className="text-slate-300 mt-0.5">
                PVP Siddhartha College uses a single daily facial check-in per day. Complete the verification once, then manage all 5 periods freely without repeating face scans.
              </p>
            </div>
          </div>
        )}

        {submittedMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{submittedMessage}</span>
          </div>
        )}
      </div>

      {/* Check for Non-Working Day / Holiday */}
      {holidayCheck.isNonWorkingDay ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="space-y-3">
            <div className="text-xs font-mono tracking-wider text-slate-400 uppercase font-semibold">
              {ddMmYyyyDate} — {formattedSelectedDate}
            </div>
            
            {/* 🔴 Non-Working Day badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-extrabold text-sm shadow-sm">
                <span className="text-rose-400 text-base leading-none">🔴</span>
                <span>Non-Working Day</span>
              </div>
            </div>

            {/* Prominent Title (e.g. Vinayaka Chavithi) */}
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {holidayCheck.title}
            </h2>

            {holidayCheck.reason && holidayCheck.reason !== holidayCheck.title && (
              <div className="text-xs text-amber-400 font-semibold">
                Occasion / Category: {holidayCheck.reason}
              </div>
            )}
          </div>

          {/* User's exact prompt message */}
          <div className="max-w-lg mx-auto bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 text-center">
            <p className="text-rose-200 font-bold text-base sm:text-lg leading-relaxed">
              &ldquo;College is not working on this day. Attendance cannot be entered.&rdquo;
            </p>
          </div>

          {/* Strict Rules info */}
          <div className="max-w-lg mx-auto bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 text-left space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Ban className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Non-Working Day Enforcement:</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              There is NO subject list or timetable on this screen. Present/Absent attendance cannot be entered. This date is completely excluded from Total Conducted Classes and percentage calculations.
            </p>
          </div>
        </div>
      ) : (
        /* Manual Period Attendance Table & Controls */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  {currentDayInfo.label} Timetable Periods ({dayPeriods.length} Classes)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Select <strong>Present</strong> or <strong>Absent</strong> for each period, then click Submit to recalculate your official metrics.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {hasAlreadySubmitted && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-semibold">
                  ✓ Recorded in History
                </span>
              )}
            </div>
          </div>

        {/* Period Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 sm:px-6">Period</th>
                <th className="py-3 px-4 sm:px-6">Time</th>
                <th className="py-3 px-4 sm:px-6">Subject</th>
                <th className="py-3 px-4 sm:px-6">Faculty &amp; Venue</th>
                <th className="py-3 px-4 sm:px-6 text-center">Attendance Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {dayPeriods.map((slot) => {
                const currentSelection = periodSelections[slot.period] || "PRESENT";
                const isPresent = currentSelection === "PRESENT";
                const isAbsent = currentSelection === "ABSENT";

                return (
                  <tr
                    key={slot.period}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-200">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                        {slot.period}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-300 text-xs">
                      {slot.time}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-white text-sm">
                        {slot.subjectName}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        CSE Dept
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 text-xs">
                      <div>{slot.faculty}</div>
                      <div className="text-[10px] text-slate-500">{slot.room}</div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <div className="inline-flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 gap-1">
                        {/* Present Button */}
                        <button
                          type="button"
                          id={`period-${slot.period}-present-btn`}
                          onClick={() => handleToggleStatus(slot.period, "PRESENT")}
                          className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            isPresent
                              ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                              : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800/80"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Present</span>
                        </button>

                        {/* Absent Button */}
                        <button
                          type="button"
                          id={`period-${slot.period}-absent-btn`}
                          onClick={() => handleToggleStatus(slot.period, "ABSENT")}
                          className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAbsent
                              ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                              : "text-slate-400 hover:text-rose-300 hover:bg-slate-800/80"
                          }`}
                        >
                          <XIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Footer & Live Formula Preview */}
        <div className="p-4 sm:p-6 bg-slate-950/60 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tally Metrics */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-300 font-medium">Present:</span>
              <span
                id="today-tally-present"
                className="text-base font-bold font-mono text-emerald-400"
              >
                {presentCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-xs text-slate-300 font-medium">Absent:</span>
              <span
                id="today-tally-absent"
                className="text-base font-bold font-mono text-rose-400"
              >
                {absentCount}
              </span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <span className="text-xs text-slate-400">Day Rate:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                ({presentCount} / {dayPeriods.length}) × 100 = {dayRate}%
              </span>
            </div>
          </div>

          {/* Submission Action */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              id="btn-submit-today-attendance"
              onClick={handleSubmit}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit {currentDayInfo.label} Attendance</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Recalculation Formula Explainer */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200">Official Recalculation Rule:</span>
          <p className="mt-0.5 leading-relaxed">
            Overall Attendance = (Total Attended Classes / Total Conducted Classes) × 100.
            New student accounts begin with 0 classes and 0% attendance. Every submitted period updates the official history and recalculates the dashboard immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
