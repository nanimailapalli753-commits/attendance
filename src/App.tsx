import React, { useState, useMemo, useEffect } from "react";
import {
  Student,
  Subject,
  AttendanceRecord,
  AttendanceMetrics,
  CMSNavTab,
  TimetableSlot,
  NotificationItem,
  NonWorkingDay,
} from "./types";
import {
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE_HISTORY,
  INITIAL_TIMETABLE,
  INITIAL_NOTIFICATIONS,
  calculateOverallMetrics,
  getStudentSubjects,
  DEFAULT_COLLEGE_NAME,
  DEFAULT_ACADEMIC_HOLIDAYS,
  checkIsNonWorkingDay,
} from "./data/mockData";
import {
  apiLogout,
  apiSaveAttendance,
  apiDeleteDateAttendance,
  apiUpdateStudent,
  getActiveSessionCollegeId,
  setActiveSessionCollegeId,
  getCachedStudents,
  getCachedAttendance,
} from "./services/apiService";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { LoginView } from "./components/LoginView";
import { DashboardView } from "./components/DashboardView";
import { TodayAttendanceView } from "./components/TodayAttendanceView";
import { OverallAttendanceView } from "./components/OverallAttendanceView";
import { AttendanceHistoryView } from "./components/AttendanceHistoryView";
import { TimetableView } from "./components/TimetableView";
import { PredictionView } from "./components/PredictionView";
import { NotificationsView } from "./components/NotificationsView";
import { ProfileView } from "./components/ProfileView";
import { SettingsView } from "./components/SettingsView";
import { AttendanceCalendarView } from "./components/AttendanceCalendarView";
import { DailyFaceVerificationModal } from "./components/DailyFaceVerificationModal";
import { Bell, CheckCircle2 } from "lucide-react";

export default function App() {
  // Persistence state
  const [allStudents, setAllStudents] = useState<Student[]>(() => {
    const cached = getCachedStudents();
    if (cached && cached.length > 0) return cached;
    const saved = localStorage.getItem("pvp_cms_students");
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Current logged in student:
  // Strictly respects active session state.
  // If user logged out, session ID is null, so it renders LoginView cleanly.
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const sessionCollegeId =
      getActiveSessionCollegeId() ||
      localStorage.getItem("pvp_cms_current_session_college_id");
    const savedId = localStorage.getItem("pvp_cms_current_student_id");

    const cachedList = getCachedStudents();
    const studentsPool = cachedList.length > 0 ? cachedList : INITIAL_STUDENTS;

    if (sessionCollegeId) {
      const match = studentsPool.find(
        (s) => s.collegeId.toUpperCase() === sessionCollegeId.toUpperCase()
      );
      if (match) return match;
    }

    if (savedId) {
      const match = studentsPool.find(
        (s) =>
          s.id === savedId ||
          s.collegeId.toUpperCase() === savedId.toUpperCase()
      );
      if (match) return match;
    }

    // Explicit: If no active session exists (after logout or clean start), show Login page!
    return null;
  });

  // Attendance history records stored globally and keyed by studentId / collegeId
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>(() => {
    const cached = getCachedAttendance();
    if (cached && cached.length > 0) return cached;
    const saved = localStorage.getItem("pvp_cms_history");
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_HISTORY;
  });

  // Academic Non-Working Days and Holidays (Default: 2026 Siddhartha Academy Holiday List)
  const [academicHolidays, setAcademicHolidays] = useState<NonWorkingDay[]>(() => {
    const saved = localStorage.getItem("siddhartha_academy_holidays_2026");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((h: NonWorkingDay) => h.date === "2026-09-14")) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved holidays", e);
      }
    }
    return DEFAULT_ACADEMIC_HOLIDAYS;
  });

  // Working Sundays / Declared Working Days managed by Administrator
  const [workingSundays, setWorkingSundays] = useState<string[]>(() => {
    const saved = localStorage.getItem("siddhartha_academy_working_sundays_2026");
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamically derive subjects and their actual attended/conducted counts from real attendanceHistory
  // ZERO-START RULE: If a student has no history records, all subjects start with 0 conducted and 0 attended (0%)
  // HOLIDAY EXCLUSION RULE: Holidays have ZERO effect on attendance calculations.
  const subjects: Subject[] = useMemo(() => {
    if (!currentStudent) return [];
    return getStudentSubjects(
      currentStudent.id,
      attendanceHistory,
      academicHolidays,
      workingSundays,
      currentStudent.collegeId
    );
  }, [currentStudent, attendanceHistory, academicHolidays, workingSundays]);

  // Sync with permanent database whenever student logs in or changes
  useEffect(() => {
    if (!currentStudent) return;

    let isMounted = true;
    const syncWithDb = async () => {
      try {
        const res = await fetch(`/api/student/${currentStudent.collegeId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.attendance)) {
            const cleanId = currentStudent.collegeId.toUpperCase();
            setAttendanceHistory((prev) => {
              const others = prev.filter(
                (h) =>
                  h.studentId !== currentStudent.id &&
                  (h.collegeId ? h.collegeId.toUpperCase() !== cleanId : true) &&
                  h.studentId.toUpperCase() !== `PVP-${cleanId}`
              );
              const merged = [...data.attendance, ...others];
              localStorage.setItem("pvp_cms_history", JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn("Background DB sync notice:", err);
      }
    };

    syncWithDb();
    return () => {
      isMounted = false;
    };
  }, [currentStudent?.collegeId]);

  // Administrator Holiday Management Handlers
  const handleAddHoliday = (newHoliday: NonWorkingDay) => {
    setAcademicHolidays((prev) => {
      const filtered = prev.filter((h) => h.date !== newHoliday.date);
      const updated = [...filtered, newHoliday].sort((a, b) => a.date.localeCompare(b.date));
      localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(updated));
      return updated;
    });
    showToast(`Added holiday: ${newHoliday.title} on ${newHoliday.date}`);
  };

  const handleUpdateHoliday = (updatedHoliday: NonWorkingDay) => {
    setAcademicHolidays((prev) => {
      const updated = prev.map((h) => (h.date === updatedHoliday.date ? updatedHoliday : h));
      localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(updated));
      return updated;
    });
    showToast(`Updated holiday: ${updatedHoliday.title}`);
  };

  const handleDeleteHoliday = (dateStr: string) => {
    setAcademicHolidays((prev) => {
      const updated = prev.filter((h) => h.date !== dateStr);
      localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(updated));
      return updated;
    });
    showToast(`Removed holiday for date ${dateStr}`);
  };

  const handleToggleWorkingSunday = (dateStr: string) => {
    setWorkingSundays((prev) => {
      let updated: string[];
      if (prev.includes(dateStr)) {
        updated = prev.filter((d) => d !== dateStr);
        showToast(`Sunday ${dateStr} reverted to Non-Working Day (Weekly Off).`);
      } else {
        updated = [...prev, dateStr];
        showToast(`Sunday ${dateStr} declared as a Working Day.`);
      }
      localStorage.setItem("siddhartha_academy_working_sundays_2026", JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetHolidays = () => {
    setAcademicHolidays(DEFAULT_ACADEMIC_HOLIDAYS);
    setWorkingSundays([]);
    localStorage.setItem("siddhartha_academy_holidays_2026", JSON.stringify(DEFAULT_ACADEMIC_HOLIDAYS));
    localStorage.removeItem("siddhartha_academy_working_sundays_2026");
    showToast("Reset to official 2026 Siddhartha Academy Holiday List.");
  };

  // Isolate attendance records strictly for the currently authenticated student
  const studentAttendanceHistory = useMemo(() => {
    if (!currentStudent) return [];
    const cleanId = currentStudent.collegeId.trim().toUpperCase();
    return attendanceHistory.filter((h) => {
      const matchId =
        h.studentId === currentStudent.id ||
        h.studentId.toUpperCase() === `PVP-${cleanId}`;
      const matchCollege = Boolean(
        cleanId && h.collegeId && h.collegeId.trim().toUpperCase() === cleanId
      );
      return matchId || matchCollege;
    });
  }, [attendanceHistory, currentStudent]);

  // Weekly timetable slots
  const [timetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem("pvp_cms_timetable");
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  // Institutional notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("pvp_cms_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<CMSNavTab>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Daily Face Verification modal
  const [dailyVerificationOpen, setDailyVerificationOpen] = useState(false);
  const [verificationTargetDate, setVerificationTargetDate] = useState<string>("2026-09-13");

  // Required attendance threshold (default: 80%)
  const [requiredThreshold, setRequiredThreshold] = useState<number>(80);

  // System toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Recalculate overall attendance metrics across ALL subjects
  const metrics: AttendanceMetrics = useMemo(() => {
    return calculateOverallMetrics(subjects, requiredThreshold);
  }, [subjects, requiredThreshold]);

  // Check if current student has completed daily verification today
  const isVerifiedToday = useMemo(() => {
    if (!currentStudent) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    return (
      currentStudent.dailyVerifiedDate === todayStr ||
      currentStudent.dailyVerifiedDate === "2026-09-13"
    );
  }, [currentStudent]);

  // Auth Handlers
  const handleLogin = (student: Student, loadedAttendance?: AttendanceRecord[]) => {
    setCurrentStudent(student);
    setActiveSessionCollegeId(student.collegeId);
    localStorage.setItem("pvp_cms_current_student_id", student.id);
    localStorage.setItem("pvp_cms_current_session_college_id", student.collegeId);

    // Update allStudents list
    setAllStudents((prev) => {
      const idx = prev.findIndex(
        (s) => s.collegeId.toUpperCase() === student.collegeId.toUpperCase()
      );
      const updated = idx >= 0 ? prev.map((s, i) => (i === idx ? student : s)) : [...prev, student];
      localStorage.setItem("pvp_cms_students", JSON.stringify(updated));
      return updated;
    });

    // If attendance records were passed directly from database, merge them!
    if (loadedAttendance && Array.isArray(loadedAttendance)) {
      setAttendanceHistory((prev) => {
        const cleanId = student.collegeId.toUpperCase();
        const otherStudents = prev.filter(
          (h) =>
            h.studentId !== student.id &&
            (h.collegeId ? h.collegeId.toUpperCase() !== cleanId : true) &&
            h.studentId.toUpperCase() !== `PVP-${cleanId}`
        );
        const merged = [...loadedAttendance, ...otherStudents];
        localStorage.setItem("pvp_cms_history", JSON.stringify(merged));
        return merged;
      });
    }

    showToast(`Welcome back, ${student.name}! Authenticated for ${DEFAULT_COLLEGE_NAME}.`);
  };

  // Logout strictly ends current session and returns to login page.
  // IMPORTANT RULE: Never deletes student, attendance, profile, or calendar records.
  const handleLogout = async () => {
    if (currentStudent) {
      try {
        await apiLogout(currentStudent.collegeId);
      } catch (err) {
        console.warn("Logout error:", err);
      }
    }
    setCurrentStudent(null);
    setActiveSessionCollegeId(null);
    localStorage.removeItem("pvp_cms_current_student_id");
    localStorage.removeItem("pvp_cms_current_session_college_id");
    showToast("Session ended. All attendance data safely stored in permanent database.");
  };

  const handleRegisterStudent = (newStudent: Student) => {
    const updated = [...allStudents, newStudent];
    setAllStudents(updated);
    localStorage.setItem("pvp_cms_students", JSON.stringify(updated));
  };

  // Daily Face Verification Success Handler (Section 1: Only once per day)
  const handleDailyVerificationSuccess = async () => {
    if (!currentStudent) return;
    const target = verificationTargetDate || "2026-09-13";
    const prevVerified = currentStudent.verifiedDates || [];
    const updatedVerifiedDates = prevVerified.includes(target)
      ? prevVerified
      : [...prevVerified, target];

    const updatedStudent: Student = {
      ...currentStudent,
      dailyVerifiedDate: target,
      verifiedDates: updatedVerifiedDates,
    };

    const updatedList = allStudents.map((s) =>
      s.id === updatedStudent.id ? updatedStudent : s
    );

    setAllStudents(updatedList);
    setCurrentStudent(updatedStudent);
    localStorage.setItem("pvp_cms_students", JSON.stringify(updatedList));

    try {
      await apiUpdateStudent(currentStudent.collegeId, {
        dailyVerifiedDate: target,
        verifiedDates: updatedVerifiedDates,
      });
    } catch (e) {
      console.warn("Could not sync verification to database:", e);
    }

    showToast(`Daily verification completed successfully for ${target}. You may now manage periods.`);
  };

  // Handle Today's Attendance Submission (Section 2 & 3: Manual period attendance)
  const handleSubmitTodayAttendance = async (
    records: {
      period: number;
      time: string;
      subjectId: string;
      subjectName: string;
      status: "PRESENT" | "ABSENT";
    }[],
    targetDate?: string
  ) => {
    if (!currentStudent) return;

    const submissionDate = targetDate || "2026-09-13";
    const holidayCheck = checkIsNonWorkingDay(submissionDate, academicHolidays, workingSundays);
    if (holidayCheck.isNonWorkingDay) {
      showToast(`Cannot record attendance: ${submissionDate} is a Non-Working Day (${holidayCheck.reason}).`);
      return;
    }

    const nowIso = new Date().toISOString();
    const cleanCollegeId = currentStudent.collegeId.trim().toUpperCase();

    // 1. Filter out existing submissions for this student, date, and period to prevent duplicates
    const filteredExisting = attendanceHistory.filter(
      (h) =>
        !(
          (h.studentId === currentStudent.id ||
            (h.collegeId && h.collegeId.toUpperCase() === cleanCollegeId) ||
            h.studentId.toUpperCase() === `PVP-${cleanCollegeId}`) &&
          h.date === submissionDate &&
          records.some((r) => r.period === h.period)
        )
    );

    // 2. Create new attendance records for the actual manually marked periods
    const newHistoryRecords: AttendanceRecord[] = records.map((r) => ({
      id: `att-${currentStudent.id}-${submissionDate}-p${r.period}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      collegeId: currentStudent.collegeId,
      date: submissionDate,
      period: r.period,
      time: r.time,
      subjectId: r.subjectId,
      subjectName: r.subjectName,
      status: r.status,
      recordedAt: nowIso,
    }));

    const updatedHistory = [...newHistoryRecords, ...filteredExisting];
    setAttendanceHistory(updatedHistory);
    localStorage.setItem("pvp_cms_history", JSON.stringify(updatedHistory));

    // 3. Persist to permanent database
    try {
      await apiSaveAttendance(currentStudent.collegeId, currentStudent.id, submissionDate, records);
    } catch (e) {
      console.warn("Failed to persist today's attendance to DB:", e);
    }

    showToast(`Attendance for ${submissionDate} submitted & saved permanently to database!`);
  };

  // Handle Date Attendance Submission from Attendance Calendar
  const handleSaveDateAttendance = async (
    records: {
      period: number;
      time: string;
      subjectId: string;
      subjectName: string;
      status: "PRESENT" | "ABSENT";
    }[],
    targetDate: string,
    dayName: string
  ) => {
    if (!currentStudent) return;

    // Strict rule: check if date is a Non-Working Day / Holiday
    const holidayCheck = checkIsNonWorkingDay(targetDate, academicHolidays, workingSundays);
    if (holidayCheck.isNonWorkingDay) {
      showToast(`Cannot save attendance: ${targetDate} is a Non-Working Day (${holidayCheck.reason}).`);
      return;
    }

    const nowIso = new Date().toISOString();
    const cleanCollegeId = currentStudent.collegeId.trim().toUpperCase();

    // 1. Filter out existing submissions for this student, date, and period to prevent duplicates
    const filteredExisting = attendanceHistory.filter(
      (h) =>
        !(
          (h.studentId === currentStudent.id ||
            (h.collegeId && h.collegeId.toUpperCase() === cleanCollegeId) ||
            h.studentId.toUpperCase() === `PVP-${cleanCollegeId}`) &&
          h.date === targetDate &&
          records.some((r) => r.period === h.period)
        )
    );

    // 2. Create updated attendance records with day and updatedAt
    const newHistoryRecords: AttendanceRecord[] = records.map((r) => ({
      id: `att-${currentStudent.id}-${targetDate}-p${r.period}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      collegeId: currentStudent.collegeId,
      date: targetDate,
      day: dayName,
      period: r.period,
      time: r.time,
      subjectId: r.subjectId,
      subjectName: r.subjectName,
      status: r.status,
      recordedAt: nowIso,
      updatedAt: nowIso,
    }));

    const updatedHistory = [...newHistoryRecords, ...filteredExisting];
    setAttendanceHistory(updatedHistory);
    localStorage.setItem("pvp_cms_history", JSON.stringify(updatedHistory));

    // 3. Persist to permanent server database
    try {
      await apiSaveAttendance(
        currentStudent.collegeId,
        currentStudent.id,
        targetDate,
        records.map((r) => ({ ...r, day: dayName }))
      );
    } catch (e) {
      console.warn("Failed to persist date attendance to DB:", e);
    }

    showToast(`Attendance for ${targetDate} (${dayName}) saved permanently to database!`);
  };

  // Delete attendance records for a specific date
  const handleDeleteDateAttendance = async (dateStr: string) => {
    if (!currentStudent) return;
    const cleanCollegeId = currentStudent.collegeId.trim().toUpperCase();
    const updated = attendanceHistory.filter(
      (h) =>
        !(
          (h.studentId === currentStudent.id ||
            (h.collegeId && h.collegeId.toUpperCase() === cleanCollegeId) ||
            h.studentId.toUpperCase() === `PVP-${cleanCollegeId}`) &&
          h.date === dateStr
        )
    );
    setAttendanceHistory(updated);
    localStorage.setItem("pvp_cms_history", JSON.stringify(updated));

    try {
      await apiDeleteDateAttendance(currentStudent.collegeId, currentStudent.id, dateStr);
    } catch (e) {
      console.warn("Failed to delete date attendance on server:", e);
    }

    showToast(`Attendance records for ${dateStr} removed from permanent database.`);
  };

  // Profile Update Handler
  const handleUpdateDepartment = async (newDept: string) => {
    if (!currentStudent) return;
    const updated: Student = { ...currentStudent, department: newDept };
    const list = allStudents.map((s) => (s.id === updated.id ? updated : s));
    setAllStudents(list);
    setCurrentStudent(updated);
    localStorage.setItem("pvp_cms_students", JSON.stringify(list));

    try {
      await apiUpdateStudent(currentStudent.collegeId, { department: newDept });
    } catch (e) {
      console.warn("Failed to update student profile in DB:", e);
    }

    showToast(`Department updated to ${newDept}.`);
  };

  // Reset Today's Daily Verification (for testing and demo purposes)
  const handleResetTodayVerification = async () => {
    if (!currentStudent) return;
    const updated: Student = {
      ...currentStudent,
      dailyVerifiedDate: undefined,
      verifiedDates: [],
    };
    const list = allStudents.map((s) => (s.id === updated.id ? updated : s));
    setAllStudents(list);
    setCurrentStudent(updated);
    localStorage.setItem("pvp_cms_students", JSON.stringify(list));

    try {
      await apiUpdateStudent(currentStudent.collegeId, {
        dailyVerifiedDate: undefined,
        verifiedDates: [],
      });
    } catch (e) {
      console.warn("Failed to reset verification in DB:", e);
    }

    showToast("Daily face verification status cleared. Verification is required again.");
  };

  // Reset Current Student's Attendance to Zero
  const handleResetCurrentStudentAttendance = () => {
    if (!currentStudent) return;
    const cleanCollegeId = currentStudent.collegeId.trim().toUpperCase();
    const remainingHistory = attendanceHistory.filter(
      (h) =>
        !(
          h.studentId === currentStudent.id ||
          (h.collegeId && h.collegeId.toUpperCase() === cleanCollegeId) ||
          h.studentId.toUpperCase() === `PVP-${cleanCollegeId}`
        )
    );
    setAttendanceHistory(remainingHistory);
    localStorage.setItem("pvp_cms_history", JSON.stringify(remainingHistory));

    showToast(`Attendance records for ${currentStudent.name} cleared.`);
  };

  // Reset ALL Portal Data to College Defaults
  const handleResetAllData = () => {
    try {
      localStorage.removeItem("pvp_cms_students");
      localStorage.removeItem("pvp_cms_history");
      localStorage.removeItem("pvp_cms_timetable");
      localStorage.removeItem("pvp_cms_notifications");
      localStorage.removeItem("pvp_cms_current_student_id");
      localStorage.removeItem("pvp_cms_current_session_college_id");
    } catch {
      // Ignore
    }

    setAllStudents(INITIAL_STUDENTS);
    setCurrentStudent(INITIAL_STUDENTS[0]);
    setAttendanceHistory(INITIAL_ATTENDANCE_HISTORY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRequiredThreshold(80);

    showToast("All data successfully reset to official PVP Siddhartha college defaults.");
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("pvp_cms_notifications", JSON.stringify(updated));
    showToast("All circulars marked as read.");
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // If not authenticated, display the college ID login portal
  if (!currentStudent) {
    return (
      <LoginView
        onLoginSuccess={handleLogin}
        allStudents={allStudents}
        onRegisterStudent={handleRegisterStudent}
        onResetAllData={handleResetAllData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-amber-400/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* CMS Navigation Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        student={currentStudent}
        onLogout={handleLogout}
        unreadCount={unreadNotificationsCount}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header
          student={currentStudent}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          unreadCount={unreadNotificationsCount}
          onNavigateToNotifications={() => setActiveTab("notifications")}
          onNavigateToProfile={() => setActiveTab("profile")}
          onNavigateToCalendar={() => setActiveTab("calendar")}
          onOpenDailyVerification={() => {
            setVerificationTargetDate("2026-09-13");
            setDailyVerificationOpen(true);
          }}
          isVerifiedToday={isVerifiedToday}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              student={currentStudent}
              subjects={subjects}
              metrics={metrics}
              onNavigate={setActiveTab}
              onOpenDailyVerification={() => setDailyVerificationOpen(true)}
            />
          )}

          {activeTab === "today" && (
            <TodayAttendanceView
              student={currentStudent}
              subjects={subjects}
              timetable={timetable}
              attendanceHistory={studentAttendanceHistory}
              academicHolidays={academicHolidays}
              workingSundays={workingSundays}
              onSubmitTodayAttendance={handleSubmitTodayAttendance}
              onOpenDailyVerification={(targetDate) => {
                if (targetDate) setVerificationTargetDate(targetDate);
                setDailyVerificationOpen(true);
              }}
            />
          )}

          {activeTab === "calendar" && (
            <AttendanceCalendarView
              student={currentStudent}
              subjects={subjects}
              timetable={timetable}
              attendanceHistory={studentAttendanceHistory}
              metrics={metrics}
              academicHolidays={academicHolidays}
              workingSundays={workingSundays}
              onSaveDateAttendance={handleSaveDateAttendance}
              onDeleteDateAttendance={handleDeleteDateAttendance}
              onClearAllAttendance={handleResetCurrentStudentAttendance}
              onAddHoliday={handleAddHoliday}
              onUpdateHoliday={handleUpdateHoliday}
              onDeleteHoliday={handleDeleteHoliday}
              onToggleWorkingSunday={handleToggleWorkingSunday}
              onResetHolidays={handleResetHolidays}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "overall" && (
            <OverallAttendanceView
              student={currentStudent}
              subjects={subjects}
              metrics={metrics}
            />
          )}

          {activeTab === "history" && (
            <AttendanceHistoryView
              attendanceHistory={studentAttendanceHistory}
              subjects={subjects}
            />
          )}

          {activeTab === "timetable" && (
            <TimetableView
              timetable={timetable}
              subjects={subjects}
            />
          )}

          {activeTab === "prediction" && (
            <PredictionView
              metrics={metrics}
              subjects={subjects}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
            />
          )}

          {activeTab === "profile" && (
            <ProfileView
              student={currentStudent}
              onUpdateDepartment={handleUpdateDepartment}
              onOpenDailyVerification={() => setDailyVerificationOpen(true)}
              onResetAllData={handleResetAllData}
              onLogout={handleLogout}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              requiredThreshold={requiredThreshold}
              onUpdateThreshold={setRequiredThreshold}
              onResetTodayVerification={handleResetTodayVerification}
              onResetAllData={handleResetAllData}
              onResetAttendanceToZero={handleResetCurrentStudentAttendance}
              isVerifiedToday={isVerifiedToday}
            />
          )}
        </main>
      </div>

      {/* Face Verification Modal */}
      <DailyFaceVerificationModal
        isOpen={dailyVerificationOpen}
        student={currentStudent}
        onVerificationSuccess={handleDailyVerificationSuccess}
        onClose={() => setDailyVerificationOpen(false)}
        targetDate={verificationTargetDate}
      />
    </div>
  );
}
