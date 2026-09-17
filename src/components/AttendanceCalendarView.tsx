import React, { useState, useMemo, useEffect } from "react";
import {
  Student,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  AttendanceMetrics,
  CMSNavTab,
  NonWorkingDay,
} from "../types";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  UserCheck,
  AlertCircle,
  Save,
  Check,
  RotateCcw,
  Calendar as CalendarIcon,
  ShieldCheck,
  Layers,
  Sparkles,
  Info,
  SlidersHorizontal,
  Ban,
  CalendarOff,
  Building2,
  Tag,
} from "lucide-react";
import {
  SEMESTER_CONFIG,
  isDateWithinSemester,
  getTimetableForDate,
  DEFAULT_ACADEMIC_HOLIDAYS,
  checkIsNonWorkingDay,
  formatDateToDDMMYYYY,
} from "../data/mockData";
import { CalendarDatePicker } from "./CalendarDatePicker";

interface AttendanceCalendarViewProps {
  student: Student;
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendanceHistory: AttendanceRecord[];
  metrics: AttendanceMetrics;
  academicHolidays?: NonWorkingDay[];
  workingSundays?: string[];
  onSaveDateAttendance: (
    records: {
      period: number;
      time: string;
      subjectId: string;
      subjectName: string;
      status: "PRESENT" | "ABSENT";
    }[],
    targetDate: string,
    dayName: string
  ) => void;
  onDeleteDateAttendance?: (dateStr: string) => void;
  onClearAllAttendance?: () => void;
  onAddHoliday?: (holiday: NonWorkingDay) => void;
  onUpdateHoliday?: (holiday: NonWorkingDay) => void;
  onDeleteHoliday?: (dateStr: string) => void;
  onToggleWorkingSunday?: (dateStr: string) => void;
  onResetHolidays?: () => void;
  onNavigate?: (tab: CMSNavTab) => void;
}

export const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({
  student,
  timetable,
  attendanceHistory,
  metrics,
  academicHolidays,
  workingSundays,
  onSaveDateAttendance,
  onDeleteDateAttendance,
  onClearAllAttendance,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
  onToggleWorkingSunday,
  onResetHolidays,
}) => {
  // Academic Holidays state fallback if not controlled by parent
  const [internalHolidaysList, setInternalHolidaysList] = useState<NonWorkingDay[]>(() => {
    const saved = localStorage.getItem("siddhartha_academy_holidays_2026");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved holidays", e);
      }
    }
    return DEFAULT_ACADEMIC_HOLIDAYS;
  });

  // Effective holiday schedule and working Sundays
  const effectiveHolidays = useMemo(() => {
    return academicHolidays && academicHolidays.length > 0
      ? academicHolidays
      : internalHolidaysList;
  }, [academicHolidays, internalHolidaysList]);

  const effectiveWorkingSundays = useMemo(() => {
    return workingSundays || [];
  }, [workingSundays]);

  // Current calendar month view state (Default to September 2026 as per CMS semester timeline)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 is September (0-indexed: Jan=0, Aug=7, Sep=8)

  // Selected date for review or attendance entry (YYYY-MM-DD)
  // Default to September 1, 2026
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-01");

  // Admin override toggle for entering attendance outside official semester bounds
  const [allowOutsideSemester, setAllowOutsideSemester] = useState<boolean>(false);

  // Success indicator message after saving
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Quick confirmation for resetting all records
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Modal state for declaring a custom holiday / working day
  const [showHolidayModal, setShowHolidayModal] = useState<boolean>(false);
  const [customHolidayReason, setCustomHolidayReason] = useState<string>("Government Holiday");
  const [customHolidayTitle, setCustomHolidayTitle] = useState<string>("Non-Working Day");

  // Administrator Holiday Management Modal State
  const [showAdminHolidayModal, setShowAdminHolidayModal] = useState<boolean>(false);
  const [adminActiveTab, setAdminActiveTab] = useState<"list" | "add" | "sundays">("list");
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");
  const [newHolidayDate, setNewHolidayDate] = useState<string>("");
  const [newHolidayTitle, setNewHolidayTitle] = useState<string>("");
  const [newHolidayReason, setNewHolidayReason] = useState<string>("Government Holiday");
  const [newHolidayType, setNewHolidayType] = useState<"GOVERNMENT_HOLIDAY" | "COLLEGE_HOLIDAY" | "NATIONAL_HOLIDAY">("GOVERNMENT_HOLIDAY");

  // Today reference string
  const todayStr = "2026-09-13";

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthName = monthNames[currentMonth];

  // Quick navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
    setSelectedDate("2026-09-13");
  };

  // Group student's existing attendance records by date
  // Holidays have zero effect: exclude any records belonging to non-working days
  const attendanceByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>();
    attendanceHistory
      .filter((r) => {
        if (r.studentId !== student.id) return false;
        const nonWorking = checkIsNonWorkingDay(r.date, effectiveHolidays, effectiveWorkingSundays);
        return !nonWorking.isNonWorkingDay;
      })
      .forEach((rec) => {
        const existing = map.get(rec.date) || [];
        existing.push(rec);
        map.set(rec.date, existing);
      });
    return map;
  }, [attendanceHistory, student.id, effectiveHolidays, effectiveWorkingSundays]);

  // Calendar matrix calculation for the displayed month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSunday: boolean;
      isNonWorkingDay: boolean;
      isCustomWorkingDay?: boolean;
      holidayReason: string;
      holidayTitle: string;
      isWithinSemester: boolean;
      records: AttendanceRecord[];
      status: "EMPTY" | "COMPLETED" | "PARTIAL" | "NON_WORKING";
      presentCount: number;
      absentCount: number;
      totalPeriods: number;
    }[] = [];

    // Helper to build a single day object
    const buildDayObj = (year: number, month: number, dayNum: number, isCurMonth: boolean) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const recs = attendanceByDate.get(dateStr) || [];
      const holidayCheck = checkIsNonWorkingDay(dateStr, effectiveHolidays, effectiveWorkingSundays);
      const isSun = holidayCheck.isSunday;
      const isNonWorking = holidayCheck.isNonWorkingDay;

      const presentCount = recs.filter((r) => r.status === "PRESENT").length;
      const absentCount = recs.filter((r) => r.status === "ABSENT").length;
      const totalPeriods = 5;

      let status: "EMPTY" | "COMPLETED" | "PARTIAL" | "NON_WORKING" = "EMPTY";
      if (isNonWorking) {
        status = "NON_WORKING";
      } else if (recs.length >= totalPeriods) {
        status = "COMPLETED";
      } else if (recs.length > 0) {
        status = "PARTIAL";
      }

      return {
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: isCurMonth,
        isToday: dateStr === todayStr,
        isSunday: isSun,
        isNonWorkingDay: isNonWorking,
        isCustomWorkingDay: holidayCheck.isCustomWorkingDay,
        holidayReason: holidayCheck.reason,
        holidayTitle: holidayCheck.title,
        isWithinSemester: isDateWithinSemester(dateStr),
        records: isNonWorking ? [] : recs,
        status,
        presentCount: isNonWorking ? 0 : presentCount,
        absentCount: isNonWorking ? 0 : absentCount,
        totalPeriods,
      };
    };

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push(buildDayObj(y, m, dayNum, false));
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      days.push(buildDayObj(currentYear, currentMonth, dayNum, true));
    }

    // Next month padding days to fill grid cleanly
    const remaining = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push(buildDayObj(y, m, dayNum, false));
    }

    return days;
  }, [currentYear, currentMonth, attendanceByDate, todayStr, effectiveHolidays, effectiveWorkingSundays]);

  // Selected date metadata, holiday verification, and timetable calculation
  const selectedDateInfo = useMemo(() => {
    const timetableInfo = getTimetableForDate(selectedDate, timetable);
    const existingRecords = attendanceByDate.get(selectedDate) || [];
    const isWithin = isDateWithinSemester(selectedDate);
    const isPast = selectedDate < todayStr;
    const isToday = selectedDate === todayStr;
    const isFuture = selectedDate > todayStr;

    // Check if this date is a Non-Working Day / Holiday
    const holidayCheck = checkIsNonWorkingDay(selectedDate, effectiveHolidays, effectiveWorkingSundays);
    const ddMmYyyy = formatDateToDDMMYYYY(selectedDate);

    // Exact requested display format: e.g. "September 15, 2026"
    const parts = selectedDate.split("-").map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const monthDayYearFormatted = dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const fullFormattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      dateStr: selectedDate,
      ddMmYyyy,
      monthDayYearFormatted,
      fullFormattedDate,
      dayName: timetableInfo.dayName,
      isSunday: holidayCheck.isSunday,
      isCustomWorkingDay: holidayCheck.isCustomWorkingDay,
      isNonWorkingDay: holidayCheck.isNonWorkingDay,
      holidayReason: holidayCheck.reason || "Government Holiday",
      holidayTitle: holidayCheck.title || "Non-Working Day",
      holidayDescription: holidayCheck.description,
      scheduledSlots: holidayCheck.isNonWorkingDay ? [] : timetableInfo.slots,
      existingRecords: holidayCheck.isNonWorkingDay ? [] : existingRecords,
      isWithin,
      isPast,
      isToday,
      isFuture,
    };
  }, [selectedDate, timetable, attendanceByDate, todayStr, effectiveHolidays, effectiveWorkingSundays]);

  // State for the manual selections for each period of the selected date
  // Keyed by period number: 1, 2, 3, 4, 5 -> "PRESENT" | "ABSENT"
  const [periodSelections, setPeriodSelections] = useState<Record<number, "PRESENT" | "ABSENT">>({});

  // When selectedDate changes, populate periodSelections from existing records (or default to empty)
  useEffect(() => {
    // If selected date is a Non-Working Day, clear any selection
    if (selectedDateInfo.isNonWorkingDay) {
      setPeriodSelections({});
      setSaveSuccessMsg(null);
      return;
    }

    const existing = attendanceByDate.get(selectedDate) || [];
    const map: Record<number, "PRESENT" | "ABSENT"> = {};

    if (existing.length > 0) {
      existing.forEach((r) => {
        map[r.period] = r.status;
      });
    }
    setPeriodSelections(map);
    setSaveSuccessMsg(null);
  }, [selectedDate, attendanceByDate, selectedDateInfo.isNonWorkingDay]);

  // Handle single period toggle
  const handleTogglePeriod = (period: number, status: "PRESENT" | "ABSENT") => {
    if (selectedDateInfo.isNonWorkingDay) return;
    setPeriodSelections((prev) => ({
      ...prev,
      [period]: status,
    }));
  };

  // Quick batch selection helpers
  const handleMarkAllPresent = () => {
    if (selectedDateInfo.isNonWorkingDay) return;
    const map: Record<number, "PRESENT" | "ABSENT"> = {};
    selectedDateInfo.scheduledSlots.forEach((slot) => {
      map[slot.period] = "PRESENT";
    });
    setPeriodSelections(map);
  };

  const handleMarkAllAbsent = () => {
    if (selectedDateInfo.isNonWorkingDay) return;
    const map: Record<number, "PRESENT" | "ABSENT"> = {};
    selectedDateInfo.scheduledSlots.forEach((slot) => {
      map[slot.period] = "ABSENT";
    });
    setPeriodSelections(map);
  };

  // Save attendance for the selected date
  const handleSaveAttendance = () => {
    // CRITICAL: Prevent attendance entry on non-working days
    if (selectedDateInfo.isNonWorkingDay) {
      return;
    }

    if (selectedDateInfo.scheduledSlots.length === 0) {
      return;
    }

    // Build the records array from manual selections
    const recordsToSave = selectedDateInfo.scheduledSlots.map((slot) => {
      const status = periodSelections[slot.period] || "PRESENT";
      return {
        period: slot.period,
        time: slot.time,
        subjectId: slot.subjectId,
        subjectName: slot.subjectName,
        status,
      };
    });

    onSaveDateAttendance(recordsToSave, selectedDate, selectedDateInfo.dayName);

    const presentCount = recordsToSave.filter((r) => r.status === "PRESENT").length;
    const totalCount = recordsToSave.length;
    setSaveSuccessMsg(
      `Attendance for ${selectedDate} saved! (${presentCount}/${totalCount} Present). Overall metrics recalculated.`
    );

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 5000);
  };

  // Clear attendance for this specific date
  const handleClearSelectedDate = () => {
    if (onDeleteDateAttendance) {
      onDeleteDateAttendance(selectedDate);
      setPeriodSelections({});
      setSaveSuccessMsg(`Attendance records for ${selectedDate} cleared.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Toggle Holiday / Working Day status for the selected date
  const handleToggleHolidayForSelectedDate = () => {
    // If it's Sunday, toggle working Sunday override
    if (selectedDateInfo.isSunday) {
      if (onToggleWorkingSunday) {
        onToggleWorkingSunday(selectedDate);
      }
      setSaveSuccessMsg(
        selectedDateInfo.isCustomWorkingDay
          ? `Sunday ${selectedDate} reverted to Non-Working Day.`
          : `Sunday ${selectedDate} marked as a WORKING DAY by Administrator override.`
      );
      setTimeout(() => setSaveSuccessMsg(null), 5000);
      return;
    }

    if (selectedDateInfo.isNonWorkingDay) {
      // Remove from holidays -> make it a working day
      if (onDeleteHoliday) {
        onDeleteHoliday(selectedDate);
      } else {
        const updated = internalHolidaysList.filter((h) => h.date !== selectedDate);
        setInternalHolidaysList(updated);
        localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(updated));
      }
      setSaveSuccessMsg(`${selectedDate} marked as a WORKING DAY. Timetable unlocked.`);
    } else {
      // Add to holidays -> make it a non-working day
      const newHoliday: NonWorkingDay = {
        date: selectedDate,
        title: customHolidayTitle || "Non-Working Day",
        reason: customHolidayReason || "Government Holiday",
        type: "GOVERNMENT_HOLIDAY",
        description: "College is not working on this day. Attendance cannot be entered.",
      };
      if (onAddHoliday) {
        onAddHoliday(newHoliday);
      } else {
        const updated = [...internalHolidaysList.filter((h) => h.date !== selectedDate), newHoliday];
        setInternalHolidaysList(updated);
        localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(updated));
      }

      // If there were any existing attendance records for this date, delete them so it has zero effect
      if (onDeleteDateAttendance) {
        onDeleteDateAttendance(selectedDate);
      }
      setSaveSuccessMsg(`${selectedDate} marked as a NON-WORKING DAY (${newHoliday.reason}). Attendance entry locked.`);
    }

    setShowHolidayModal(false);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Admin: Add new holiday from modal
  const handleAdminAddNewHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayTitle.trim()) {
      alert("Please specify a valid date and holiday name.");
      return;
    }

    const item: NonWorkingDay = {
      date: newHolidayDate,
      title: newHolidayTitle.trim(),
      reason: newHolidayReason.trim() || "Government Holiday",
      type: newHolidayType,
      description: "College is not working on this day. Attendance cannot be entered.",
    };

    if (onAddHoliday) {
      onAddHoliday(item);
    } else {
      const updated = [...internalHolidaysList.filter((h) => h.date !== item.date), item];
      setInternalHolidaysList(updated);
      localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(updated));
    }

    if (onDeleteDateAttendance) {
      onDeleteDateAttendance(item.date);
    }

    setSaveSuccessMsg(`Added holiday "${item.title}" for ${formatDateToDDMMYYYY(item.date)}.`);
    setNewHolidayDate("");
    setNewHolidayTitle("");
    setAdminActiveTab("list");
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Admin: Delete holiday
  const handleAdminDeleteHoliday = (dateStr: string, title: string) => {
    if (onDeleteHoliday) {
      onDeleteHoliday(dateStr);
    } else {
      const updated = internalHolidaysList.filter((h) => h.date !== dateStr);
      setInternalHolidaysList(updated);
      localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(updated));
    }
    setSaveSuccessMsg(`Removed holiday "${title}" (${formatDateToDDMMYYYY(dateStr)}). Date is now a working day.`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Admin: Reset to Siddhartha Academy 2026 schedule
  const handleAdminResetToDefault = () => {
    if (onResetHolidays) {
      onResetHolidays();
    } else {
      setInternalHolidaysList(DEFAULT_ACADEMIC_HOLIDAYS);
      localStorage.removeItem("siddhartha_academy_holidays_2026");
      localStorage.removeItem("siddhartha_academy_working_sundays_2026");
    }
    setSaveSuccessMsg("Reset holiday calendar to default 2026 Siddhartha Academy schedule.");
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Filtered holidays for admin modal search
  const filteredHolidays = useMemo(() => {
    if (!adminSearchQuery.trim()) return effectiveHolidays;
    const q = adminSearchQuery.toLowerCase();
    return effectiveHolidays.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.reason.toLowerCase().includes(q) ||
        h.date.includes(q) ||
        formatDateToDDMMYYYY(h.date).includes(q)
    );
  }, [effectiveHolidays, adminSearchQuery]);

  // Semester Sundays list for admin toggle
  const semesterSundays = useMemo(() => {
    const list: { dateStr: string; formattedDate: string; isWorking: boolean }[] = [];
    const curr = new Date(2026, 7, 1); // Aug 1, 2026
    const end = new Date(2026, 11, 31); // Dec 31, 2026
    while (curr <= end) {
      if (curr.getDay() === 0) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, "0");
        const d = String(curr.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        const isWorking = effectiveWorkingSundays.includes(dateStr);
        list.push({
          dateStr,
          formattedDate: `${formatDateToDDMMYYYY(dateStr)} (${curr.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
          isWorking,
        });
      }
      curr.setDate(curr.getDate() + 1);
    }
    return list;
  }, [effectiveWorkingSundays]);

  // Centralized date selection handler used by CalendarDatePicker, shortcuts, and grid clicks
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setCurrentYear(parts[0]);
      setCurrentMonth(parts[1] - 1);
    }
  };

  // Count marked in current editor
  const currentEditorMarkedCount = Object.keys(periodSelections).length;
  const currentEditorPresentCount = Object.values(periodSelections).filter((v) => v === "PRESENT").length;
  const currentEditorAbsentCount = Object.values(periodSelections).filter((v) => v === "ABSENT").length;
  const totalSlotsCount = selectedDateInfo.scheduledSlots.length || 5;

  const canEdit = !selectedDateInfo.isNonWorkingDay;

  return (
    <div className="space-y-6">
      {/* CMS Header & Prominent Calendar Date Picker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Attendance Calendar
                </h1>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MANUAL ENTRY ONLY
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  HOLIDAY LOCK ENFORCED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select any date directly via the <strong>Calendar Date Picker</strong>, or visually track attendance status on the monthly calendar below.
              </p>
            </div>
          </div>

          {/* Prominent Calendar Date Picker Widget: 📅 Select Date: [22-12-2026] */}
          <div
            id="top-date-picker-bar"
            className="bg-slate-950/90 border border-slate-700/80 rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-lg flex flex-wrap items-center gap-3"
          >
            <CalendarDatePicker
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              academicHolidays={effectiveHolidays}
              workingSundays={effectiveWorkingSundays}
              todayDateStr={todayStr}
            />
          </div>
        </div>

        {/* Semester Meta & Fast Controls Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-medium text-[11px] mr-1">
              Semester Jump:
            </span>
            {[
              { name: "Aug 2026", month: 7, year: 2026 },
              { name: "Sep 2026", month: 8, year: 2026 },
              { name: "Oct 2026", month: 9, year: 2026 },
              { name: "Nov 2026", month: 10, year: 2026 },
              { name: "Dec 2026", month: 11, year: 2026 },
            ].map((m) => {
              const isActive = currentMonth === m.month && currentYear === m.year;
              return (
                <button
                  key={m.name}
                  onClick={() => {
                    setCurrentMonth(m.month);
                    setCurrentYear(m.year);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Jump to Example Date: 22-12-2026 */}
            <button
              id="btn-test-example-date"
              onClick={() => handleSelectDate("2026-12-22")}
              className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Select 22-12-2026 (Working Day Example from Prompt)"
            >
              <span>📅 Example: 22-12-2026</span>
            </button>

            {/* Test 14-09-2026 Vinayaka Chavithi */}
            <button
              id="btn-test-vinayaka-chavithi"
              onClick={() => handleSelectDate("2026-09-14")}
              className="text-[11px] text-rose-300 hover:text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test 14-09-2026 Vinayaka Chavithi holiday rule"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Test 14-09-2026 (Vinayaka)</span>
            </button>

            {/* Test Sunday */}
            <button
              id="btn-test-sunday"
              onClick={() => handleSelectDate("2026-09-13")}
              className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test Sunday Weekly Off rule"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Test Sunday (13-09-2026)</span>
            </button>

            {/* Holiday Schedule Manager */}
            <button
              id="btn-open-holiday-schedule"
              onClick={() => setShowAdminHolidayModal(true)}
              className="text-[11px] text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Manage 2026 Siddhartha Academy Holiday List"
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              <span>Holiday Schedule ({effectiveHolidays.length})</span>
            </button>

            {/* Reset to 0% */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-500/10"
              title="Reset all entered attendance to verify zero-start behavior"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to 0%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Clearing All Attendance */}
      {showClearConfirm && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">Are you sure you want to clear all manual attendance records?</p>
              <p className="text-[11px] text-rose-300/80">
                This will reset your account to strictly 0% attendance with 0 conducted classes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onClearAllAttendance) onClearAllAttendance();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer"
            >
              Yes, Clear to 0%
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Calendar Grid on Left, Date Period Editor on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Monthly Calendar Component (7 Cols on XL) */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Month:</span>
                <span className="text-amber-400 font-mono">
                  {currentMonthName} {currentYear}
                </span>
              </h2>
            </div>

            {/* Navigation Buttons: [Previous Month] [Today] [Next Month] */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-prev-month"
                onClick={handlePrevMonth}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                id="btn-today-month"
                onClick={handleGoToToday}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono cursor-pointer transition-colors"
                title="Jump to Today (Sep 13, 2026)"
              >
                Today
              </button>

              <button
                id="btn-next-month"
                onClick={handleNextMonth}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
                title="Next Month"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-2 pb-1 text-[11px] text-slate-400 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
              <span>Working Day (Empty)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Recorded (5/5)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="font-semibold text-rose-300">🔴 Non-Working Day / Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400/60 inline-block" />
              <span>Sunday</span>
            </div>
          </div>

          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div
                key={day}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg ${
                  idx === 0 ? "text-rose-400/80 bg-rose-500/5 font-black" : "text-slate-400 bg-slate-950/40"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Dates Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              const isPast = day.dateStr < todayStr;
              const isFuture = day.dateStr > todayStr;

              return (
                <button
                  key={day.dateStr}
                  id={`cal-date-${day.dateStr}`}
                  onClick={() => handleSelectDate(day.dateStr)}
                  className={`min-h-[74px] sm:min-h-[84px] p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative group ${
                    isSelected
                      ? "border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/40 shadow-md shadow-amber-500/10 z-10"
                      : day.isNonWorkingDay
                      ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 hover:bg-rose-500/10"
                      : day.isToday
                      ? "border-amber-500/40 bg-slate-950 ring-1 ring-amber-500/30"
                      : day.isCurrentMonth
                      ? "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40"
                      : "border-slate-800/40 bg-slate-950/20 text-slate-600 opacity-60 hover:opacity-100"
                  } ${!day.isWithinSemester && !allowOutsideSemester ? "border-dashed" : ""}`}
                >
                  {/* Top row: Day Number + Badges */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold flex items-center gap-1 ${
                        isSelected
                          ? "text-amber-300"
                          : day.isNonWorkingDay
                          ? "text-rose-400 font-black"
                          : day.isToday
                          ? "text-amber-400 font-black"
                          : day.isSunday
                          ? "text-rose-400/90"
                          : day.isCurrentMonth
                          ? "text-slate-200"
                          : "text-slate-500"
                      }`}
                    >
                      <span>{day.dayNumber}</span>
                      {day.isNonWorkingDay && !day.isSunday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      )}
                    </span>

                    {/* Today Badge */}
                    {day.isToday && (
                      <span className="text-[9px] font-bold px-1 rounded bg-amber-500 text-slate-950 leading-none py-0.5">
                        TODAY
                      </span>
                    )}

                    {/* Outside semester marker */}
                    {!day.isWithinSemester && (
                      <span
                        className="text-[8px] font-mono text-slate-500 px-1 rounded bg-slate-800/60"
                        title="Date outside official semester"
                      >
                        OFF
                      </span>
                    )}
                  </div>

                  {/* Middle row: Indicator / Attendance / Non-Working badge */}
                  <div className="mt-1 w-full">
                    {day.isNonWorkingDay ? (
                      <div className="bg-rose-500/20 border border-rose-500/30 px-1 py-0.5 rounded text-[9px] text-rose-300 font-medium truncate flex items-center gap-0.5">
                        <span className="text-[8px] text-rose-400">🔴</span>
                        <span className="truncate">
                          {day.isSunday ? "Sunday" : day.holidayReason || "Holiday"}
                        </span>
                      </div>
                    ) : day.status === "COMPLETED" ? (
                      <div className="flex items-center justify-between w-full bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.5 rounded text-[9px] text-emerald-300 font-mono font-semibold">
                        <span className="flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span>5/5</span>
                        </span>
                        <span className="text-[8px] text-emerald-400/90">
                          {day.presentCount}P
                        </span>
                      </div>
                    ) : day.status === "PARTIAL" ? (
                      <div className="bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded text-[9px] text-amber-300 font-mono font-semibold flex items-center justify-between">
                        <span>{day.records.length}/5</span>
                        <span className="text-[8px] text-amber-400/90">
                          {day.presentCount}P
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-600 block truncate">
                        {isPast ? "Empty" : isFuture ? "Scheduled" : "Pending"}
                      </span>
                    )}
                  </div>

                  {/* Bottom indicator strip */}
                  <div className="w-full flex items-center gap-1 mt-0.5">
                    {day.isNonWorkingDay ? (
                      <div className="h-0.5 w-full rounded-full bg-rose-500/60" />
                    ) : day.status === "COMPLETED" ? (
                      <div className="h-0.5 w-full rounded-full bg-emerald-500" />
                    ) : day.status === "PARTIAL" ? (
                      <div className="h-0.5 w-full rounded-full bg-amber-500" />
                    ) : (
                      <div className="h-0.5 w-full rounded-full bg-slate-800" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Info Bar */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Select any date. If it is a <strong>Non-Working Day</strong>, subjects and periods are blocked.
              </span>
            </span>

            <button
              onClick={() => setShowHolidayModal(!showHolidayModal)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Manage Holiday Status</span>
            </button>
          </div>

          {/* Optional Holiday Status Toggle Form */}
          {showHolidayModal && (
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configure Holiday Status for {selectedDateInfo.monthDayYearFormatted}</span>
                </span>
                <button
                  onClick={() => setShowHolidayModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Holiday Title / Name
                  </label>
                  <input
                    type="text"
                    value={customHolidayTitle}
                    onChange={(e) => setCustomHolidayTitle(e.target.value)}
                    placeholder="e.g. Government Holiday"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Reason
                  </label>
                  <select
                    value={customHolidayReason}
                    onChange={(e) => setCustomHolidayReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value="Government Holiday">Government Holiday</option>
                    <option value="College Holiday">College Holiday</option>
                    <option value="Local Declared Holiday">Local Declared Holiday</option>
                    <option value="Institutional Sports / Cultural Day">Institutional Observance</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleToggleHolidayForSelectedDate}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    selectedDateInfo.isNonWorkingDay
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-rose-600 hover:bg-rose-500 text-white"
                  }`}
                >
                  {selectedDateInfo.isNonWorkingDay
                    ? "Mark as Working Day"
                    : "Mark as Non-Working Day"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Date-Based Attendance Editor OR Holiday Screen (5 Cols on XL) */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          {/* CRITICAL CHECK: Before opening attendance entry, always check: Is this date a Non-Working Day? */}
          {selectedDateInfo.isNonWorkingDay ? (
            /* ========================================================================= */
            /* NON-WORKING DAY / HOLIDAY SCREEN                                         */
            /* Per specifications: Show ONLY:                                           */
            /* Date (e.g. September 15, 2026 / 14-09-2026 — Vinayaka Chavithi)          */
            /* 🔴 Non-Working Day                                                        */
            /* Reason: Government Holiday                                               */
            /* Message: "College is not working on this day. Attendance cannot be entered." */
            /* There should be NO subject list on this screen.                          */
            /* ========================================================================= */
            <div className="space-y-5" id="holiday-screen-container">
              {/* Selected Date Header */}
              <div className="text-center pb-4 border-b border-slate-800">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Academic Calendar Date
                </div>
                <h2
                  id="holiday-date-heading"
                  className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono"
                >
                  {selectedDateInfo.monthDayYearFormatted}
                </h2>
                <div className="text-xs font-mono text-amber-400 font-semibold mt-1">
                  {selectedDateInfo.ddMmYyyy} &mdash; {selectedDateInfo.dayName}
                </div>
              </div>

              {/* 🔴 Non-Working Day Status Pill */}
              <div className="flex justify-center">
                <div
                  id="holiday-status-badge"
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-extrabold text-sm shadow-sm"
                >
                  <span className="text-rose-400 text-base leading-none">🔴</span>
                  <span>Non-Working Day</span>
                </div>
              </div>

              {/* Occasion / Title & Reason Box */}
              <div
                id="holiday-reason-box"
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-left shadow-inner"
              >
                {selectedDateInfo.holidayTitle && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Occasion / Festival:
                    </div>
                    <div className="text-base font-bold text-white">
                      {selectedDateInfo.holidayTitle}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Reason:
                  </div>
                  <div
                    id="holiday-reason-text"
                    className="text-base font-bold text-amber-400"
                  >
                    {selectedDateInfo.holidayReason}
                  </div>
                </div>
              </div>

              {/* Message Box */}
              <div
                id="holiday-message-box"
                className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-4 text-center"
              >
                <div className="text-[11px] uppercase tracking-wider text-rose-400/80 font-bold mb-1">
                  Message:
                </div>
                <p
                  id="holiday-instruction-message"
                  className="text-rose-200 font-semibold text-sm sm:text-base leading-relaxed"
                >
                  &ldquo;College is not working on this day. Attendance cannot be entered.&rdquo;
                </p>
              </div>

              {/* Strict Non-Working Rule Guarantee Notice */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Institutional Attendance Rules:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1">
                  <li>DO NOT open the list of subjects.</li>
                  <li>DO NOT show timetable periods.</li>
                  <li>DO NOT show Present/Absent buttons.</li>
                  <li>DO NOT allow attendance entry.</li>
                  <li>DO NOT create attendance records.</li>
                  <li>Completely excluded from Total Conducted Classes and percentage.</li>
                </ul>
              </div>

              {/* Option to toggle back if admin declares special session */}
              <div className="pt-2 flex flex-col items-center gap-2">
                <button
                  onClick={handleToggleHolidayForSelectedDate}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                >
                  {selectedDateInfo.isSunday
                    ? "Administrator: Toggle Sunday as Working Day"
                    : `Administrator: Declare ${selectedDateInfo.monthDayYearFormatted} as Working Day`}
                </button>
                <button
                  onClick={() => setShowAdminHolidayModal(true)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                  <span>Manage 2026 Siddhartha Academy Holiday List</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* WORKING DAY BEHAVIOR                                                      */
            /* Only when the selected date is a Working Day, open the timetable and     */
            /* subject list: Java, DBMS, OS, CN, Math with manual Present / Absent entry */
            /* ========================================================================= */
            <div className="space-y-4" id="working-day-screen-container">
              {/* Selected Date Header */}
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Working Academic Date
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      selectedDateInfo.isToday
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : selectedDateInfo.isPast
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {selectedDateInfo.isToday
                      ? "TODAY"
                      : selectedDateInfo.isPast
                      ? "PREVIOUS DATE"
                      : "FUTURE DATE"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-1 font-mono">
                  {selectedDateInfo.monthDayYearFormatted}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <span className="font-mono text-amber-400 font-semibold">
                    {selectedDateInfo.dayName}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    Working Day
                  </span>
                  <span>•</span>
                  <span>
                    {selectedDateInfo.existingRecords.length > 0
                      ? `Saved: ${selectedDateInfo.existingRecords.filter((r) => r.status === "PRESENT").length} Present, ${selectedDateInfo.existingRecords.filter((r) => r.status === "ABSENT").length} Absent`
                      : "No attendance records saved yet"}
                  </span>
                </div>
              </div>

              {/* Success Banner */}
              {saveSuccessMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Outside Semester Warning Banner */}
              {!selectedDateInfo.isWithin && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold">Date is outside official semester duration</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80">
                    Official semester classes run from {SEMESTER_CONFIG.startDate} to {SEMESTER_CONFIG.endDate}.
                  </p>
                  <label className="flex items-center gap-2 text-[11px] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={allowOutsideSemester}
                      onChange={(e) => setAllowOutsideSemester(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                    />
                    <span>Administrator Override: Allow attendance entry for this recess date</span>
                  </label>
                </div>
              )}

              {/* Timetable Period Table for This Day */}
              {canEdit && (
                <div className="space-y-3">
                  {/* Quick helper controls */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      Select Attendance for {selectedDateInfo.scheduledSlots.length} Periods:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleMarkAllPresent}
                        className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        All Present
                      </button>
                      <button
                        onClick={handleMarkAllAbsent}
                        className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        All Absent
                      </button>
                    </div>
                  </div>

                  {/* Periods List: Java, DBMS, Operating Systems, Computer Networks, Mathematics */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {selectedDateInfo.scheduledSlots.map((slot) => {
                      const currentChoice = periodSelections[slot.period] || (selectedDateInfo.existingRecords.find((r) => r.period === slot.period)?.status);
                      const isPresent = currentChoice === "PRESENT";
                      const isAbsent = currentChoice === "ABSENT";

                      return (
                        <div
                          key={slot.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isPresent
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : isAbsent
                              ? "border-rose-500/30 bg-rose-500/5"
                              : "border-slate-800 bg-slate-950/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            {/* Period & Subject Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400 shrink-0">
                                P{slot.period}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white">
                                    {slot.subjectName}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {slot.time}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {slot.faculty} • {slot.room}
                                </span>
                              </div>
                            </div>

                            {/* Present / Absent Selector Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                id={`btn-p${slot.period}-present-${selectedDate}`}
                                onClick={() => handleTogglePeriod(slot.period, "PRESENT")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isPresent
                                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Present</span>
                              </button>

                              <button
                                type="button"
                                id={`btn-p${slot.period}-absent-${selectedDate}`}
                                onClick={() => handleTogglePeriod(slot.period, "ABSENT")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isAbsent
                                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-400"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tally Bar */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Day Summary:
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">
                        {currentEditorPresentCount} Present
                      </span>
                      <span className="text-slate-600">/</span>
                      <span className="text-rose-400 font-bold">
                        {currentEditorAbsentCount} Absent
                      </span>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-300 font-bold">
                        {totalSlotsCount} Total
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      id="btn-save-calendar-attendance"
                      onClick={handleSaveAttendance}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Attendance</span>
                    </button>

                    {selectedDateInfo.existingRecords.length > 0 && (
                      <button
                        onClick={handleClearSelectedDate}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                        title="Clear saved attendance for this date"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Explanation Footer */}
              <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 space-y-1">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Prevents duplicate records for <strong>Student + Date + Period</strong>. Updating changes existing rows in-place.</span>
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={handleToggleHolidayForSelectedDate}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline underline-offset-4 cursor-pointer"
                  >
                    Declare {selectedDateInfo.monthDayYearFormatted} as Holiday / Non-Working Day
                  </button>
                  <button
                    onClick={() => setShowAdminHolidayModal(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Manage All Holidays</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Administrator Holiday & Working Day Management Dialog */}
      {showAdminHolidayModal && (
        <div
          id="admin-holiday-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="admin-holiday-modal-content"
            className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>2026 Siddhartha Academy Holiday &amp; Working Day Schedule</span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      ADMIN
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official calendar for Siddhartha Academy of General &amp; Technical Education. Holidays and Sundays completely exclude timetable and attendance entry.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAdminHolidayModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-5 pt-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdminActiveTab("list")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-colors cursor-pointer ${
                    adminActiveTab === "list"
                      ? "border-amber-400 text-amber-300 bg-slate-800/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Official Holidays List ({effectiveHolidays.length})
                </button>

                <button
                  onClick={() => setAdminActiveTab("add")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-colors cursor-pointer ${
                    adminActiveTab === "add"
                      ? "border-amber-400 text-amber-300 bg-slate-800/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  + Declare New Holiday
                </button>

                <button
                  onClick={() => setAdminActiveTab("sundays")}
                  className={`px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-colors cursor-pointer ${
                    adminActiveTab === "sundays"
                      ? "border-amber-400 text-amber-300 bg-slate-800/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sunday Working Days ({effectiveWorkingSundays.length} active)
                </button>
              </div>

              {adminActiveTab === "list" && (
                <div className="pb-2 hidden sm:block">
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="Search holiday (e.g. Vinayaka, 14-09)..."
                    className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Tab 1: Holidays List */}
              {adminActiveTab === "list" && (
                <div className="space-y-3">
                  <div className="sm:hidden">
                    <input
                      type="text"
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      placeholder="Search holiday or date..."
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Date (DD-MM-YYYY)</th>
                          <th className="py-2.5 px-3">Occasion / Festival</th>
                          <th className="py-2.5 px-3 hidden md:table-cell">Reason / Classification</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono">
                        {filteredHolidays.map((holiday) => {
                          const dateObj = new Date(holiday.date);
                          const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                          const isCurrentSelected = holiday.date === selectedDate;

                          return (
                            <tr
                              key={holiday.date}
                              className={`hover:bg-slate-800/40 transition-colors ${
                                isCurrentSelected ? "bg-amber-500/10 font-bold" : ""
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-rose-400">🔴</span>
                                  <span className="font-bold text-white">
                                    {formatDateToDDMMYYYY(holiday.date)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-sans">
                                    ({dayName})
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-sans text-slate-200">
                                <span className="font-semibold">{holiday.title}</span>
                              </td>
                              <td className="py-2.5 px-3 font-sans text-slate-400 hidden md:table-cell">
                                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                                  {holiday.reason}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    const parts = holiday.date.split("-").map(Number);
                                    setCurrentYear(parts[0]);
                                    setCurrentMonth(parts[1] - 1);
                                    setSelectedDate(holiday.date);
                                    setShowAdminHolidayModal(false);
                                  }}
                                  className="text-[11px] text-amber-400 hover:text-amber-300 font-sans font-semibold underline underline-offset-2 cursor-pointer"
                                >
                                  View Date
                                </button>
                                <button
                                  onClick={() => handleAdminDeleteHoliday(holiday.date, holiday.title)}
                                  className="text-[11px] text-rose-400 hover:text-rose-300 font-sans font-semibold underline underline-offset-2 cursor-pointer"
                                  title="Mark this date as a Working Day"
                                >
                                  Mark Working
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Add New Holiday Form */}
              {adminActiveTab === "add" && (
                <form onSubmit={handleAdminAddNewHoliday} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 max-w-xl mx-auto">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-bold text-white">
                    <CalendarOff className="w-4 h-4 text-rose-400" />
                    <span>Declare Non-Working Day / Holiday</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Holiday Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      required
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Festival / Occasion Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vinayaka Chavithi, Institution Day"
                      value={newHolidayTitle}
                      onChange={(e) => setNewHolidayTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Reason Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Government Holiday"
                        value={newHolidayReason}
                        onChange={(e) => setNewHolidayReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Classification
                      </label>
                      <select
                        value={newHolidayType}
                        onChange={(e) => setNewHolidayType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      >
                        <option value="GOVERNMENT_HOLIDAY">Government Holiday</option>
                        <option value="COLLEGE_HOLIDAY">College Declared Holiday</option>
                        <option value="NATIONAL_HOLIDAY">National Holiday</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminActiveTab("list")}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CalendarOff className="w-3.5 h-3.5" />
                      <span>Save as Non-Working Day</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Sunday Working Day Overrides */}
              {adminActiveTab === "sundays" && (
                <div className="space-y-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
                    <p>
                      <strong>Rule:</strong> Sundays are treated as <strong>Non-Working Days by default</strong> across Siddhartha Academy, unless an administrator explicitly marks a Sunday as a <strong>Working Day</strong>.
                    </p>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Sunday Date</th>
                          <th className="py-2.5 px-3">Current Status</th>
                          <th className="py-2.5 px-3 text-right">Administrator Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono">
                        {semesterSundays.map((sun) => (
                          <tr key={sun.dateStr} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-white">
                                {sun.formattedDate}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              {sun.isWorking ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                                  🟢 Working Day
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold">
                                  🔴 Non-Working (Weekly Off)
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  if (onToggleWorkingSunday) {
                                    onToggleWorkingSunday(sun.dateStr);
                                  }
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  sun.isWorking
                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                }`}
                              >
                                {sun.isWorking ? "Revert to Non-Working" : "Mark as Working Day"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
              <button
                onClick={handleAdminResetToDefault}
                className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                title="Reset to 2026 Siddhartha Academy Official Holidays"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 2026 Siddhartha Academy Default Schedule</span>
              </button>

              <button
                onClick={() => setShowAdminHolidayModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
