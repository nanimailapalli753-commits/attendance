import React, { useState } from "react";
import { TimetableSlot, Subject } from "../types";
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  User,
  GraduationCap,
} from "lucide-react";

interface TimetableViewProps {
  timetable: TimetableSlot[];
  subjects: Subject[];
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const TimetableView: React.FC<TimetableViewProps> = ({ timetable, subjects }) => {
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  const currentSlots = timetable
    .filter((t) => t.day === selectedDay)
    .sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Calendar className="w-4 h-4" />
              <span>ACADEMIC SCHEDULE • III B.TECH II SEMESTER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Curriculum Timetable
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Department of Computer Science &amp; Engineering • PVP Siddhartha Engineering College
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">Class In-charge:</span>
            <span className="text-xs font-bold text-white">Dr. K. Srinivas Rao</span>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Schedule Cards for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSlots.map((slot) => (
          <div
            key={slot.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-xs">
                  Period {slot.period}
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{slot.time}</span>
                </span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight">
                {slot.subjectName}
              </h4>
              <p className="text-[11px] font-mono text-amber-400 mt-0.5">
                Core CSE Component
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-300 font-medium truncate">{slot.faculty}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-400 truncate">{slot.room}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* College Schedule Guidelines */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-200">Official Class Hours &amp; Break Schedule:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            Morning Sessions: 09:00 AM - 12:15 PM
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            Lunch Interval: 12:15 PM - 01:15 PM
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            Afternoon Sessions: 01:15 PM - 04:15 PM
          </div>
        </div>
      </div>
    </div>
  );
};
