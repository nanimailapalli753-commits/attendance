export interface Student {
  id: string;
  collegeId: string; // e.g. 25501A05A1 (Starts with 2550, 10 chars, contains 1 capital letter)
  name: string;
  collegeName: string; // PVP Siddhartha Engineering College
  department: string;
  yearSemester: string;
  faceEnrolled: boolean;
  faceDescriptorPreview?: string; // base64 thumbnail of face
  enrolledAt?: string;
  dailyVerifiedDate?: string; // e.g. "2026-09-13" - face recognition used ONLY once per day
  verifiedDates?: string[]; // array of dates verified
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  attended: number;
  conducted: number;
  faculty: string;
  room: string;
}

export interface TimetableSlot {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  period: number;
  time: string;
  subjectId: string;
  subjectName: string;
  faculty: string;
  room: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  collegeId?: string;
  subjectId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  day?: string; // e.g. "Monday", "Tuesday"
  period: number;
  time: string;
  status: "PRESENT" | "ABSENT";
  recordedAt: string;
  updatedAt?: string;
}

export type OverallAttendanceStatus = "GOOD" | "WARNING" | "CRITICAL" | "NEW";

export interface AttendanceMetrics {
  totalAttended: number;
  totalConducted: number;
  totalAbsent: number;
  overallPercentage: number;
  requiredPercentage: number;
  status: OverallAttendanceStatus;
  statusMessage: string;
  canMissClasses: number;
  recoveryClassesNeeded: number;
  hasData: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "academic" | "attendance" | "general";
  read: boolean;
}

export type CMSNavTab =
  | "dashboard"
  | "profile"
  | "today"
  | "calendar"
  | "history"
  | "timetable"
  | "overall"
  | "prediction"
  | "notifications"
  | "settings";

export interface SemesterConfig {
  academicYear: string;
  semesterName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  collegeName: string;
}

export interface AIRecommendation {
  recommendation: string;
  actionPlan: string[];
  riskLevel: "Low" | "Medium" | "High";
  keyHighlight?: string;
  source: string;
}

export interface NonWorkingDay {
  date: string; // YYYY-MM-DD
  title: string;
  reason: string; // e.g. "Government Holiday", "Weekly Holiday", "College Holiday"
  type?: "GOVERNMENT_HOLIDAY" | "COLLEGE_HOLIDAY" | "WEEKLY_OFF" | "DECLARED_HOLIDAY";
  description?: string;
}

