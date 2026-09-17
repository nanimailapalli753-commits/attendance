import React from "react";
import { CMSNavTab, Student } from "../types";
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarDays,
  History,
  Calendar,
  PieChart,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface SidebarProps {
  currentTab: CMSNavTab;
  onSelectTab: (tab: CMSNavTab) => void;
  student: Student;
  onLogout: () => void;
  unreadCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  student,
  onLogout,
  unreadCount = 0,
  isOpenMobile,
  onCloseMobile,
}) => {
  const isVerifiedToday =
    student.dailyVerifiedDate === new Date().toISOString().split("T")[0] ||
    student.dailyVerifiedDate === "2026-09-13";

  const navItems: {
    id: CMSNavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "today", label: "Today's Attendance", icon: CalendarCheck, badge: isVerifiedToday ? "Verified" : "Check-in", badgeColor: isVerifiedToday ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400" },
    { id: "calendar", label: "Attendance Calendar", icon: CalendarDays },
    { id: "history", label: "Attendance History", icon: History },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "overall", label: "Overall Attendance", icon: PieChart },
    { id: "prediction", label: "Attendance Prediction", icon: TrendingUp },
    { id: "profile", label: "My Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, badgeColor: "bg-rose-500 text-white" },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* College Crest & Portal Title */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 leading-tight">
                PVP Siddhartha
              </h2>
              <p className="text-[11px] font-semibold text-white truncate">
                Engineering College
              </p>
              <span className="text-[9px] text-slate-400 font-mono block">
                CMS Attendance Portal
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Verification Badge in Sidebar */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isVerifiedToday ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="text-[11px] text-slate-300 font-medium">Daily Verification</span>
            </div>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isVerifiedToday
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {isVerifiedToday ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                  <span>Required</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-slate-950"
                        : "text-slate-400 group-hover:text-amber-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{student.name}</p>
              <p className="text-[10px] text-amber-300 font-mono truncate">{student.collegeId}(student)</p>
            </div>
            <button
              onClick={onLogout}
              id="sidebar-logout-btn"
              title="Logout from CMS"
              className="px-2 py-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 active:bg-red-800 border border-red-500/80 shadow transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
