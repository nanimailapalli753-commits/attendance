import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { NonWorkingDay } from "../types";
import {
  formatDateToDDMMYYYY,
  parseDDMMYYYYtoYYYYMMDD,
  checkIsNonWorkingDay,
  DEFAULT_ACADEMIC_HOLIDAYS,
} from "../data/mockData";

interface CalendarDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  academicHolidays?: NonWorkingDay[];
  workingSundays?: string[];
  todayDateStr?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028];

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  selectedDate,
  onSelectDate,
  academicHolidays = DEFAULT_ACADEMIC_HOLIDAYS,
  workingSundays = [],
  todayDateStr = "2026-09-13",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Popup internal navigation month & year
  const [navYear, setNavYear] = useState<number>(() => {
    const parts = selectedDate.split("-").map(Number);
    return parts[0] || 2026;
  });

  const [navMonth, setNavMonth] = useState<number>(() => {
    const parts = selectedDate.split("-").map(Number);
    return parts[1] ? parts[1] - 1 : 8; // 8 is September
  });

  // Direct manual text input in DD-MM-YYYY format
  const [directDateInput, setDirectDateInput] = useState<string>(() =>
    formatDateToDDMMYYYY(selectedDate)
  );
  const [inputError, setInputError] = useState<string | null>(null);

  // Synchronize when selectedDate prop changes from outside
  useEffect(() => {
    const parts = selectedDate.split("-").map(Number);
    if (parts.length === 3) {
      setNavYear(parts[0]);
      setNavMonth(parts[1] - 1);
      setDirectDateInput(formatDateToDDMMYYYY(selectedDate));
      setInputError(null);
    }
  }, [selectedDate]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close popup on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Day name for selected date
  const selectedDateDayName = useMemo(() => {
    try {
      const parts = selectedDate.split("-").map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString("en-US", { weekday: "short" });
    } catch {
      return "";
    }
  }, [selectedDate]);

  // Status for selected date
  const selectedDateStatus = useMemo(() => {
    return checkIsNonWorkingDay(selectedDate, academicHolidays, workingSundays);
  }, [selectedDate, academicHolidays, workingSundays]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear((prev) => prev - 1);
    } else {
      setNavMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear((prev) => prev + 1);
    } else {
      setNavMonth((prev) => prev + 1);
    }
  };

  // Direct date apply
  const handleApplyDirectInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseDDMMYYYYtoYYYYMMDD(directDateInput);
    if (parsed) {
      onSelectDate(parsed);
      setInputError(null);
      setIsOpen(false);
    } else {
      setInputError("Please enter valid date in DD-MM-YYYY format (e.g. 22-12-2026)");
    }
  };

  // Native date input open
  const handleOpenNativePicker = () => {
    if (nativeInputRef.current) {
      if ("showPicker" in nativeInputRef.current) {
        try {
          (nativeInputRef.current as any).showPicker();
        } catch {
          nativeInputRef.current.focus();
        }
      } else {
        nativeInputRef.current.focus();
      }
    }
  };

  // Build the calendar matrix for the popup
  const popupDays = useMemo(() => {
    const firstDayOfMonth = new Date(navYear, navMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(navYear, navMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isSunday: boolean;
      isToday: boolean;
      isSelected: boolean;
      isNonWorking: boolean;
      holidayTitle?: string;
    }[] = [];

    // Previous month padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const prevM = navMonth === 0 ? 11 : navMonth - 1;
      const prevY = navMonth === 0 ? navYear - 1 : navYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      const holidayInfo = checkIsNonWorkingDay(dateStr, academicHolidays, workingSundays);

      days.push({
        dateStr,
        dayNum: dNum,
        isCurrentMonth: false,
        isSunday: holidayInfo.isSunday,
        isToday: dateStr === todayDateStr,
        isSelected: dateStr === selectedDate,
        isNonWorking: holidayInfo.isNonWorkingDay,
        holidayTitle: holidayInfo.title,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${navYear}-${String(navMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const holidayInfo = checkIsNonWorkingDay(dateStr, academicHolidays, workingSundays);

      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: true,
        isSunday: holidayInfo.isSunday,
        isToday: dateStr === todayDateStr,
        isSelected: dateStr === selectedDate,
        isNonWorking: holidayInfo.isNonWorkingDay,
        holidayTitle: holidayInfo.title,
      });
    }

    // Next month padding to fill grid to full weeks (max 42 days)
    const remaining = 42 - days.length;
    for (let dayNum = 1; dayNum <= remaining && days.length < 42; dayNum++) {
      const nextM = navMonth === 11 ? 0 : navMonth + 1;
      const nextY = navMonth === 11 ? navYear + 1 : navYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const holidayInfo = checkIsNonWorkingDay(dateStr, academicHolidays, workingSundays);

      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isSunday: holidayInfo.isSunday,
        isToday: dateStr === todayDateStr,
        isSelected: dateStr === selectedDate,
        isNonWorking: holidayInfo.isNonWorkingDay,
        holidayTitle: holidayInfo.title,
      });
    }

    return days;
  }, [navYear, navMonth, selectedDate, todayDateStr, academicHolidays, workingSundays]);

  return (
    <div ref={containerRef} className="relative inline-block w-full sm:w-auto">
      {/* Date Picker Trigger Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs sm:text-sm">
          <span className="text-amber-400 text-base">📅</span>
          <span>Select Date:</span>
        </div>

        {/* Clickable Date Box */}
        <div
          id="btn-calendar-date-picker-trigger"
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
          className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-700 hover:border-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-3.5 py-1.5 sm:py-2 text-white shadow-sm cursor-pointer transition-all select-none group"
          title="Click to open calendar date picker popup"
        >
          <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />

          {/* DD-MM-YYYY format */}
          <span
            id="attendance-date-picker-display"
            className="font-mono font-bold text-amber-300 group-hover:text-amber-200 text-sm sm:text-base tracking-wider"
          >
            {formatDateToDDMMYYYY(selectedDate)}
          </span>

          <span className="text-[11px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded font-medium">
            {selectedDateDayName}
          </span>

          {selectedDateStatus.isNonWorkingDay ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <span>🔴</span>
              <span className="hidden md:inline">Non-Working</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span>🟢</span>
              <span className="hidden md:inline">Working Day</span>
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Hidden Native Date Input for OS Calendar Picker trigger */}
        <input
          ref={nativeInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) {
              onSelectDate(e.target.value);
              setIsOpen(false);
            }
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Floating Calendar Popup Modal / Popover */}
      {isOpen && (
        <div
          id="calendar-date-picker-popup"
          className="absolute z-50 mt-2 left-0 sm:left-auto right-auto sm:right-0 w-[330px] sm:w-[380px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 text-white animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Popup Header & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Calendar Date Picker
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close picker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Manual Input (DD-MM-YYYY) */}
          <form
            onSubmit={handleApplyDirectInput}
            className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>Enter date directly:</span>
              <button
                type="button"
                onClick={handleOpenNativePicker}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                title="Open device native calendar dialog"
              >
                <span>Device Picker 🗓️</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                id="direct-date-input-field"
                value={directDateInput}
                onChange={(e) => {
                  setDirectDateInput(e.target.value);
                  setInputError(null);
                }}
                placeholder="DD-MM-YYYY (e.g. 22-12-2026)"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg text-xs font-mono text-amber-300 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Jump
              </button>
            </div>
            {inputError && (
              <p className="text-[10px] text-rose-400 font-medium">{inputError}</p>
            )}
          </form>

          {/* Fast Month & Year Dropdowns (Eliminates repeated clicking of Previous Month) */}
          <div className="mt-3 flex items-center justify-between gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {/* Month Dropdown */}
              <select
                id="date-picker-month-select"
                value={navMonth}
                onChange={(e) => setNavMonth(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                id="date-picker-year-select"
                value={navYear}
                onChange={(e) => setNavYear(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
              <div
                key={day}
                className={`py-1 ${idx === 0 ? "text-rose-400/80 font-black" : ""}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Interactive Days Matrix */}
          <div className="grid grid-cols-7 gap-1 mt-1 text-center">
            {popupDays.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => {
                    onSelectDate(day.dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-8 rounded-lg text-xs font-mono flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400"
                      : day.isToday
                      ? "border border-amber-400/60 bg-slate-800/80 text-amber-300 font-bold"
                      : day.isNonWorking
                      ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                      : day.isCurrentMonth
                      ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 hover:bg-slate-800/40"
                  }`}
                  title={
                    day.isNonWorking
                      ? `${formatDateToDDMMYYYY(day.dateStr)}: 🔴 Non-Working Day (${day.holidayTitle || "Holiday"})`
                      : `${formatDateToDDMMYYYY(day.dateStr)}: 🟢 Working Day`
                  }
                >
                  <span>{day.dayNum}</span>

                  {/* Red indicator dot for holidays / non-working days */}
                  {day.isNonWorking && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-0.5" />
                  )}
                  {isSelected && (
                    <span className="w-1 h-1 rounded-full bg-slate-950 absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Preset Quick Shortcuts */}
          <div className="mt-3 pt-2.5 border-t border-slate-800">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick Date Shortcuts:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onSelectDate("2026-12-22");
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold cursor-pointer"
                title="Prompt example: 22-12-2026 (Working Day)"
              >
                22-12-2026 (Example)
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate(todayDateStr);
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono cursor-pointer"
                title="Jump to Today"
              >
                Today ({formatDateToDDMMYYYY(todayDateStr)})
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate("2026-09-14");
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-mono cursor-pointer"
                title="Vinayaka Chavithi (Government Holiday)"
              >
                14-09-2026 (Vinayaka)
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate("2026-12-25");
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-mono cursor-pointer"
                title="Christmas (Government Holiday)"
              >
                25-12-2026 (Christmas)
              </button>
            </div>
          </div>

          {/* Currently Selected Date Footer Note */}
          <div className="mt-3 p-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] flex items-center justify-between text-slate-300">
            <span className="font-mono font-bold text-amber-400">
              {formatDateToDDMMYYYY(selectedDate)}
            </span>
            <span>
              {selectedDateStatus.isNonWorkingDay ? (
                <span className="text-rose-400 font-semibold">
                  🔴 Non-Working Day
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">
                  🟢 Working Day
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
