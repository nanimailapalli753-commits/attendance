import React, { useState } from "react";
import { Student } from "../types";
import { PVP_DEPARTMENTS, DEFAULT_COLLEGE_NAME } from "../data/mockData";
import {
  User,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  Calendar,
  Camera,
  RotateCcw,
  LogOut,
} from "lucide-react";

interface ProfileViewProps {
  student: Student;
  onUpdateDepartment: (dept: string) => void;
  onOpenDailyVerification: () => void;
  onResetAllData?: () => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  student,
  onUpdateDepartment,
  onOpenDailyVerification,
  onResetAllData,
  onLogout,
}) => {
  const [selectedDept, setSelectedDept] = useState(student.department);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isVerifiedToday =
    student.dailyVerifiedDate === new Date().toISOString().split("T")[0] ||
    student.dailyVerifiedDate === "2026-09-13";

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDepartment(selectedDept);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <User className="w-4 h-4" />
          <span>STUDENT REGISTRY</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
          My Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Official institutional identification and enrollment credentials for PVP Siddhartha Engineering College.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student ID Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-3xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              {student.name.charAt(0)}
            </div>
            {isVerifiedToday && (
              <span
                title="Daily verification completed"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{student.name}</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono font-bold text-xs mt-1">
              <span className="text-amber-500">ID:</span>
              <span>{student.collegeId}(student)</span>
            </div>
          </div>

          {/* Red Logout Button beside/under student profile */}
          {onLogout && (
            <button
              id="profile-logout-btn"
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-500 shadow-md shadow-red-950/40 hover:shadow-red-600/30"
            >
              <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Logout ({student.collegeId})</span>
            </button>
          )}

          {/* Daily Face Verification Badge */}
          <div className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Daily Face Verification:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  isVerifiedToday
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {isVerifiedToday ? "✓ COMPLETED" : "PENDING"}
              </span>
            </div>
            <button
              onClick={onOpenDailyVerification}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{isVerifiedToday ? "Re-verify Face" : "Verify Face for Today"}</span>
            </button>
          </div>

          {onResetAllData && (
            <button
              onClick={onResetAllData}
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 pt-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Official Defaults</span>
            </button>
          )}
        </div>

        {/* Right Column: Institutional Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Building className="w-4 h-4 text-amber-400" />
              <span>Academic &amp; Institutional Registry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  College Name
                </span>
                <p className="font-bold text-white text-sm">
                  {DEFAULT_COLLEGE_NAME}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Autonomous • Approved by AICTE • Affiliated to JNTUK
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  College ID (Prefix: 2550)
                </span>
                <p className="font-mono font-bold text-amber-400 text-base">
                  {student.collegeId}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Verified PVP Siddhartha Roll Format
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  Current Academic Standing
                </span>
                <p className="font-bold text-white text-sm">
                  {student.yearSemester || "III B.Tech - II Semester"}
                </p>
                <p className="text-slate-400 text-[11px]">Academic Year 2026 - 2027</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  Academic Counselor
                </span>
                <p className="font-bold text-white text-sm">
                  Dr. K. Srinivas Rao
                </p>
                <p className="text-slate-400 text-[11px]">Associate Professor, CSE Dept</p>
              </div>
            </div>

            {/* Department Selector (8 Approved Departments) */}
            <form onSubmit={handleSaveDept} className="space-y-3 pt-2">
              <label
                htmlFor="profile-dept-select"
                className="block text-xs font-semibold text-slate-300"
              >
                Assigned Department (8 Approved Engineering Programs):
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  id="profile-dept-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {PVP_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  Update Department
                </button>
              </div>

              {saveSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Department record updated successfully!</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
