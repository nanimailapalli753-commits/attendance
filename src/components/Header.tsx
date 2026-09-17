import React from "react";
import { Student } from "../types";
import {
  Menu,
  CheckCircle2,
  Bell,
  Camera,
  CalendarDays,
  LogOut,
} from "lucide-react";

interface HeaderProps {
  student: Student;
  onOpenMobileMenu?: () => void;
  onOpenMobileSidebar?: () => void;
  onOpenDailyVerification: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToCalendar?: () => void;
  unreadCount?: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  onOpenMobileMenu,
  onOpenMobileSidebar,
  onOpenDailyVerification,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToCalendar,
  unreadCount = 0,
  onLogout,
}) => {
  const handleOpenMobile = onOpenMobileMenu || onOpenMobileSidebar || (() => {});
  const isVerifiedToday =
    student.dailyVerifiedDate === new Date().toISOString().split("T")[0] ||
    student.dailyVerifiedDate === "2026-09-13";

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile hamburger & College Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            id="btn-open-sidebar"
            onClick={handleOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                Autonomous
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Kanuru, Vijayawada - 520007
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight truncate">
              PVP Siddhartha Engineering College
            </h1>
          </div>
        </div>

        {/* Right: Student Information & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Calendar Navigation Link */}
          {onNavigateToCalendar && (
            <button
              id="header-calendar-btn"
              onClick={onNavigateToCalendar}
              title="Open Attendance Calendar"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium hidden sm:inline">Calendar</span>
            </button>
          )}

          {/* Daily Face Verification Status Button */}
          <button
            id="header-daily-verification-btn"
            onClick={onOpenDailyVerification}
            title={
              isVerifiedToday
                ? "Daily face verification completed for today"
                : "Complete one-time daily face verification"
            }
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isVerifiedToday
                ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40"
                : "bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/50 animate-pulse"
            }`}
          >
            {isVerifiedToday ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Verified ✓</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Verify Face</span>
              </>
            )}
          </button>

          {/* Notifications Icon */}
          <button
            id="header-notif-btn"
            onClick={onNavigateToNotifications}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
            )}
          </button>

          {/* Student Profile Pill with ID like 25501A4260(student) */}
          <button
            id="header-profile-btn"
            onClick={onNavigateToProfile}
            title={`View profile for ${student.name} (${student.collegeId})`}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center text-xs shadow shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-none hidden lg:inline truncate max-w-[120px]">
                  {student.name}
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-400/15 px-1.5 py-0.5 rounded border border-amber-400/30 whitespace-nowrap">
                  {student.collegeId}(student)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[140px] leading-tight mt-0.5 hidden xl:block">
                {student.department}
              </p>
            </div>
          </button>

          {/* Logout Option Beside Profile Icon in Red Colour */}
          {onLogout && (
            <button
              id="header-logout-btn"
              onClick={onLogout}
              title={`Logout from CMS (${student.collegeId})`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 border border-red-500 shadow-md shadow-red-950/50 hover:shadow-red-600/30 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="font-bold">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
