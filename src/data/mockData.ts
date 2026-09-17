import {
  Student,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  AttendanceMetrics,
  OverallAttendanceStatus,
  NotificationItem,
  NonWorkingDay,
} from "../types";

export const DEFAULT_COLLEGE_NAME = "PVP Siddhartha Engineering College";
export const COLLEGE_ID_PREFIX = "2550";

export const PVP_DEPARTMENTS = [
  "Computer Science and Engineering (CSE)",
  "Computer Science and Machine Learning (CSM)",
  "Computer Science and Data Science (CSD)",
  "Electrical and Electronics Engineering (EEE)",
  "Electronics and Communication Engineering (ECE)",
  "Information Technology (IT)",
  "Civil Engineering (Civil)",
  "Mechanical Engineering (Mech)",
] as const;

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "pvp-25501A05A1",
    collegeId: "25501A05A1",
    name: "Vamshi Krishna Mailapalli",
    collegeName: DEFAULT_COLLEGE_NAME,
    department: "Computer Science and Engineering (CSE)",
    yearSemester: "III B.Tech - II Semester",
    faceEnrolled: true,
    faceDescriptorPreview:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    enrolledAt: "2026-08-10",
    dailyVerifiedDate: "2026-09-13", // Verified for today
  },
  {
    id: "pvp-25501A0412",
    collegeId: "25501A0412",
    name: "Sai Charan Teja",
    collegeName: DEFAULT_COLLEGE_NAME,
    department: "Electronics and Communication Engineering (ECE)",
    yearSemester: "III B.Tech - II Semester",
    faceEnrolled: true,
    faceDescriptorPreview:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    enrolledAt: "2026-08-12",
    dailyVerifiedDate: undefined, // Needs today's 1-time verification
  },
  {
    id: "pvp-25501A1215",
    collegeId: "25501A1215",
    name: "Ananya Rao",
    collegeName: DEFAULT_COLLEGE_NAME,
    department: "Information Technology (IT)",
    yearSemester: "III B.Tech - II Semester",
    faceEnrolled: false,
    faceDescriptorPreview: undefined,
    dailyVerifiedDate: undefined,
  },
  {
    id: "pvp-25501A4260",
    collegeId: "25501A4260",
    name: "Student (25501A4260)",
    collegeName: DEFAULT_COLLEGE_NAME,
    department: "Computer Science and Machine Learning (CSM)",
    yearSemester: "III B.Tech - II Semester",
    faceEnrolled: false,
    faceDescriptorPreview: undefined,
    enrolledAt: "2026-08-15",
    dailyVerifiedDate: "2026-09-13",
  },
];

export const BASE_CURRICULUM_SUBJECTS = [
  {
    id: "sub-java",
    code: "CS501",
    name: "Java",
    faculty: "Dr. K. Srinivas Rao",
    room: "Room 301 (Dept of CSE)",
  },
  {
    id: "sub-dbms",
    code: "CS502",
    name: "DBMS",
    faculty: "Dr. A. Sudhir Kumar",
    room: "Database Systems Lab 1",
  },
  {
    id: "sub-os",
    code: "CS503",
    name: "Operating Systems",
    faculty: "Prof. N. V. Narendra",
    room: "Room 303",
  },
  {
    id: "sub-cn",
    code: "CS504",
    name: "Computer Networks",
    faculty: "Dr. T. Haritha",
    room: "Networking Lab 2",
  },
  {
    id: "sub-math",
    code: "MA501",
    name: "Mathematics",
    faculty: "Prof. M. V. Ratnam",
    room: "Room 302 (Dept of BS&H)",
  },
  {
    id: "sub-python",
    code: "CS505",
    name: "Python",
    faculty: "Dr. P. Venkata Lakshmi",
    room: "Lab 2 (Software Systems Lab)",
  },
  {
    id: "sub-ds",
    code: "CS506",
    name: "Data Structures",
    faculty: "Dr. B. Janardhana Rao",
    room: "Room 304",
  },
  {
    id: "sub-ai",
    code: "CS507",
    name: "AI",
    faculty: "Dr. S. Madhavi",
    room: "AI Research Centre, Room 405",
  },
  {
    id: "sub-english",
    code: "HS501",
    name: "English",
    faculty: "Dr. G. Shanthi",
    room: "Language Lab 1",
  },
] as const;

/**
 * Official PVP Siddhartha Academic Semester Configuration
 */
export const SEMESTER_CONFIG: {
  academicYear: string;
  semesterName: string;
  startDate: string;
  endDate: string;
  collegeName: string;
} = {
  academicYear: "2026-2027",
  semesterName: "Odd Semester (III B.Tech - I / II Sem)",
  startDate: "2026-08-17", // Semester start: Aug 17, 2026
  endDate: "2026-12-31",   // Semester end: Dec 31, 2026 (includes December term)
  collegeName: DEFAULT_COLLEGE_NAME,
};

export function isDateWithinSemester(dateStr: string): boolean {
  return dateStr >= SEMESTER_CONFIG.startDate && dateStr <= SEMESTER_CONFIG.endDate;
}

/**
 * 2026 Siddhartha Academy Holiday List (Official Academic Non-Working Days & Festivals Schedule)
 * Explicit rule: Holidays have ZERO effect on attendance calculations.
 * When a holiday is selected:
 * - Shows: 🔴 Non-Working Day, Holiday Title (e.g. Vinayaka Chavithi), and "College is not working on this day. Attendance cannot be entered."
 * - Do NOT load subjects or timetable periods
 * - Do NOT show Present/Absent options
 * - Do NOT allow attendance entry or record creation
 * - Excluded from Total Conducted Classes and percentage calculations
 */
export const DEFAULT_ACADEMIC_HOLIDAYS: NonWorkingDay[] = [
  // January 2026
  {
    date: "2026-01-14",
    title: "Bhogi",
    reason: "Sankranti Festival Vacation",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-01-15",
    title: "Makara Sankranti",
    reason: "Sankranti Festival / Uttarayana Punyakala",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-01-16",
    title: "Kanuma",
    reason: "Sankranti Festival Vacation",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-01-26",
    title: "Republic Day",
    reason: "National Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // February 2026
  {
    date: "2026-02-15",
    title: "Maha Shivaratri",
    reason: "Festival Holiday / Weekly Off",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // March 2026
  {
    date: "2026-03-19",
    title: "Ugadi",
    reason: "Telugu New Year",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-03-20",
    title: "Sri Rama Navami",
    reason: "Festival Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-03-21",
    title: "Khutub-E-Ramzan",
    reason: "Eid-ul-Fitr",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-03-31",
    title: "Mahaveera Jayanthi",
    reason: "Government Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // April 2026
  {
    date: "2026-04-03",
    title: "Good Friday",
    reason: "Government Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-04-05",
    title: "Babu Jagjivan Ram Jayanthi",
    reason: "Government Holiday / Weekly Off",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-04-14",
    title: "Dr. B.R. Ambedkar Jayanthi",
    reason: "National Commemoration Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-04-20",
    title: "Basava Jayanthi / Akshaya Tritiya",
    reason: "Government Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // May 2026
  {
    date: "2026-05-01",
    title: "May Day",
    reason: "International Workers' Day",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-05-28",
    title: "Bakrid",
    reason: "Eid-ul-Zuha",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // June 2026
  {
    date: "2026-06-26",
    title: "Last Day of Moharam",
    reason: "Moharram Gazetted Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // August 2026
  {
    date: "2026-08-15",
    title: "Independence Day",
    reason: "National Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-08-26",
    title: "Eid-Milad",
    reason: "Milad-un-Nabi",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // September 2026
  {
    date: "2026-09-14",
    title: "Vinayaka Chavithi",
    reason: "Varasiddhi Vinayaka Vrata",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // October 2026
  {
    date: "2026-10-02",
    title: "Mahatma Gandhi Jayanthi",
    reason: "National Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-10-10",
    title: "Mahalaya Amavasye",
    reason: "Festival Observance",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-10-19",
    title: "Durgashtami / Dasara Vacation",
    reason: "Dasara Vacation",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-10-20",
    title: "Mahanavami / Ayudhapooja",
    reason: "Dasara Vacation",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-10-21",
    title: "Vijayadasami",
    reason: "Dasara Vacation",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-10-25",
    title: "Maharshi Valmiki Jayanthi",
    reason: "Government Holiday / Weekly Off",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // November 2026
  {
    date: "2026-11-01",
    title: "Andhra Pradesh Formation Day",
    reason: "AP State Day / Weekly Off",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-11-08",
    title: "Naraka Chaturdashi",
    reason: "Deepavali Festival / Weekly Off",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-11-10",
    title: "Deepavali / Balipadyami",
    reason: "Deepavali Festival Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  {
    date: "2026-11-23",
    title: "Guru Nanak Jayanthi",
    reason: "Government Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
  // December 2026
  {
    date: "2026-12-25",
    title: "Christmas",
    reason: "State Gazetted Festival Holiday",
    type: "GOVERNMENT_HOLIDAY",
    description: "College is not working on this day. Attendance cannot be entered.",
  },
];

/**
 * Checks whether a given date is a Non-Working Day / Holiday.
 * Applies to previous dates, today, and future dates.
 * All Sundays and designated holidays are Non-Working Days by default,
 * unless marked as a working day by an administrator.
 */
export function checkIsNonWorkingDay(
  dateStr: string,
  holidaysList: NonWorkingDay[] = DEFAULT_ACADEMIC_HOLIDAYS,
  workingSundaysList: string[] = []
): {
  isNonWorkingDay: boolean;
  reason: string;
  title: string;
  description: string;
  isSunday: boolean;
  isCustomWorkingDay?: boolean;
} {
  const parts = dateStr.split("-").map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const isSunday = dateObj.getDay() === 0;

  // 1. Administrator override: check if explicitly declared as a working day
  if (workingSundaysList.includes(dateStr)) {
    return {
      isNonWorkingDay: false,
      reason: "",
      title: "Working Day (Declared Working Day)",
      description: "College is working on this day by Administrator notification.",
      isSunday,
      isCustomWorkingDay: true,
    };
  }

  // 2. Check exact calendar date in Siddhartha Academy holidays list (e.g., 2026-09-14 Vinayaka Chavithi)
  const matchedHoliday = holidaysList.find((h) => h.date === dateStr);
  if (matchedHoliday) {
    return {
      isNonWorkingDay: true,
      reason: matchedHoliday.reason || matchedHoliday.title || "Government Holiday",
      title: matchedHoliday.title || "Non-Working Day",
      description: matchedHoliday.description || "College is not working on this day. Attendance cannot be entered.",
      isSunday,
    };
  }

  // 3. Check Sunday (Weekly Holiday) by default, unless marked as a working day
  if (isSunday) {
    return {
      isNonWorkingDay: true,
      reason: "Weekly Holiday",
      title: "Sunday - Weekly Off",
      description: "College is not working on this day. Attendance cannot be entered.",
      isSunday: true,
    };
  }

  return {
    isNonWorkingDay: false,
    reason: "",
    title: "Working Day",
    description: "",
    isSunday: false,
  };
}

/**
 * Formats a YYYY-MM-DD date string to DD-MM-YYYY (e.g. "14-09-2026")
 */
export function formatDateToDDMMYYYY(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Parses a DD-MM-YYYY string into YYYY-MM-DD.
 * Returns null if invalid.
 */
export function parseDDMMYYYYtoYYYYMMDD(str: string): string | null {
  if (!str) return null;
  const clean = str.trim().replace(/\//g, "-").replace(/\./g, "-");
  const parts = clean.split("-");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  return null;
}

/**
 * Derives dynamic subject-wise attended & conducted counts strictly from actual attendance records.
 * If student has NO attendance history rows, attended=0, conducted=0 (0% attendance).
 * Explicit rule: Holidays have ZERO effect on attendance calculations. Any record on a holiday is excluded.
 */
export function getStudentSubjects(
  studentId: string,
  history: AttendanceRecord[],
  holidaysList: NonWorkingDay[] = DEFAULT_ACADEMIC_HOLIDAYS,
  workingSundaysList: string[] = [],
  studentCollegeId?: string
): Subject[] {
  const cleanCollegeId = studentCollegeId ? studentCollegeId.trim().toUpperCase() : "";
  const studentRecords = history.filter((r) => {
    const matchesId = r.studentId === studentId || (cleanCollegeId && r.studentId.toUpperCase() === `PVP-${cleanCollegeId}`);
    const matchesCollege = cleanCollegeId && r.collegeId && r.collegeId.trim().toUpperCase() === cleanCollegeId;
    if (!matchesId && !matchesCollege) return false;
    // Exclude any non-working days / holidays so they have zero impact on metrics
    const holidayStatus = checkIsNonWorkingDay(r.date, holidaysList, workingSundaysList);
    return !holidayStatus.isNonWorkingDay;
  });

  return BASE_CURRICULUM_SUBJECTS.map((base) => {
    const subjectRecords = studentRecords.filter(
      (r) =>
        r.subjectId === base.id ||
        r.subjectName.trim().toLowerCase() === base.name.trim().toLowerCase()
    );
    const attended = subjectRecords.filter((r) => r.status === "PRESENT").length;
    const conducted = subjectRecords.length;
    return {
      ...base,
      attended,
      conducted,
    };
  });
}

export const WEEKLY_TIMETABLE: TimetableSlot[] = [
  // Monday (5 periods)
  { id: "tt-mon-1", day: "Monday", period: 1, time: "09:00 - 10:00", subjectId: "sub-java", subjectName: "Java", faculty: "Dr. K. Srinivas Rao", room: "Room 301" },
  { id: "tt-mon-2", day: "Monday", period: 2, time: "10:00 - 11:00", subjectId: "sub-math", subjectName: "Mathematics", faculty: "Prof. M. V. Ratnam", room: "Room 302" },
  { id: "tt-mon-3", day: "Monday", period: 3, time: "11:15 - 12:15", subjectId: "sub-python", subjectName: "Python", faculty: "Dr. P. Venkata Lakshmi", room: "Lab 2" },
  { id: "tt-mon-4", day: "Monday", period: 4, time: "01:15 - 02:15", subjectId: "sub-ds", subjectName: "Data Structures", faculty: "Dr. B. Janardhana Rao", room: "Room 304" },
  { id: "tt-mon-5", day: "Monday", period: 5, time: "02:15 - 03:15", subjectId: "sub-ai", subjectName: "AI", faculty: "Dr. S. Madhavi", room: "Room 405" },

  // Tuesday (5 periods: 1. Java, 2. DBMS, 3. Operating Systems, 4. Computer Networks, 5. Mathematics)
  { id: "tt-tue-1", day: "Tuesday", period: 1, time: "09:00 - 10:00", subjectId: "sub-java", subjectName: "Java", faculty: "Dr. K. Srinivas Rao", room: "Room 301" },
  { id: "tt-tue-2", day: "Tuesday", period: 2, time: "10:00 - 11:00", subjectId: "sub-dbms", subjectName: "DBMS", faculty: "Dr. A. Sudhir Kumar", room: "Database Lab 1" },
  { id: "tt-tue-3", day: "Tuesday", period: 3, time: "11:15 - 12:15", subjectId: "sub-os", subjectName: "Operating Systems", faculty: "Prof. N. V. Narendra", room: "Room 303" },
  { id: "tt-tue-4", day: "Tuesday", period: 4, time: "01:15 - 02:15", subjectId: "sub-cn", subjectName: "Computer Networks", faculty: "Dr. T. Haritha", room: "Networking Lab 2" },
  { id: "tt-tue-5", day: "Tuesday", period: 5, time: "02:15 - 03:15", subjectId: "sub-math", subjectName: "Mathematics", faculty: "Prof. M. V. Ratnam", room: "Room 302" },

  // Wednesday (5 periods)
  { id: "tt-wed-1", day: "Wednesday", period: 1, time: "09:00 - 10:00", subjectId: "sub-dbms", subjectName: "DBMS", faculty: "Dr. A. Sudhir Kumar", room: "Database Lab 1" },
  { id: "tt-wed-2", day: "Wednesday", period: 2, time: "10:00 - 11:00", subjectId: "sub-os", subjectName: "Operating Systems", faculty: "Prof. N. V. Narendra", room: "Room 303" },
  { id: "tt-wed-3", day: "Wednesday", period: 3, time: "11:15 - 12:15", subjectId: "sub-cn", subjectName: "Computer Networks", faculty: "Dr. T. Haritha", room: "Networking Lab 2" },
  { id: "tt-wed-4", day: "Wednesday", period: 4, time: "01:15 - 02:15", subjectId: "sub-python", subjectName: "Python", faculty: "Dr. P. Venkata Lakshmi", room: "Lab 2" },
  { id: "tt-wed-5", day: "Wednesday", period: 5, time: "02:15 - 03:15", subjectId: "sub-java", subjectName: "Java", faculty: "Dr. K. Srinivas Rao", room: "Room 301" },

  // Thursday (5 periods)
  { id: "tt-thu-1", day: "Thursday", period: 1, time: "09:00 - 10:00", subjectId: "sub-math", subjectName: "Mathematics", faculty: "Prof. M. V. Ratnam", room: "Room 302" },
  { id: "tt-thu-2", day: "Thursday", period: 2, time: "10:00 - 11:00", subjectId: "sub-dbms", subjectName: "DBMS", faculty: "Dr. A. Sudhir Kumar", room: "Database Lab 1" },
  { id: "tt-thu-3", day: "Thursday", period: 3, time: "11:15 - 12:15", subjectId: "sub-os", subjectName: "Operating Systems", faculty: "Prof. N. V. Narendra", room: "Room 303" },
  { id: "tt-thu-4", day: "Thursday", period: 4, time: "01:15 - 02:15", subjectId: "sub-cn", subjectName: "Computer Networks", faculty: "Dr. T. Haritha", room: "Networking Lab 2" },
  { id: "tt-thu-5", day: "Thursday", period: 5, time: "02:15 - 03:15", subjectId: "sub-english", subjectName: "English", faculty: "Dr. G. Shanthi", room: "Lang Lab 1" },

  // Friday (5 periods)
  { id: "tt-fri-1", day: "Friday", period: 1, time: "09:00 - 10:00", subjectId: "sub-ds", subjectName: "Data Structures", faculty: "Dr. B. Janardhana Rao", room: "Room 304" },
  { id: "tt-fri-2", day: "Friday", period: 2, time: "10:00 - 11:00", subjectId: "sub-java", subjectName: "Java", faculty: "Dr. K. Srinivas Rao", room: "Room 301" },
  { id: "tt-fri-3", day: "Friday", period: 3, time: "11:15 - 12:15", subjectId: "sub-os", subjectName: "Operating Systems", faculty: "Prof. N. V. Narendra", room: "Room 303" },
  { id: "tt-fri-4", day: "Friday", period: 4, time: "01:15 - 02:15", subjectId: "sub-cn", subjectName: "Computer Networks", faculty: "Dr. T. Haritha", room: "Networking Lab 2" },
  { id: "tt-fri-5", day: "Friday", period: 5, time: "02:15 - 03:15", subjectId: "sub-ai", subjectName: "AI", faculty: "Dr. S. Madhavi", room: "Room 405" },

  // Saturday (5 periods)
  { id: "tt-sat-1", day: "Saturday", period: 1, time: "09:00 - 10:00", subjectId: "sub-java", subjectName: "Java", faculty: "Dr. K. Srinivas Rao", room: "Room 301" },
  { id: "tt-sat-2", day: "Saturday", period: 2, time: "10:00 - 11:00", subjectId: "sub-dbms", subjectName: "DBMS", faculty: "Dr. A. Sudhir Kumar", room: "Database Lab 1" },
  { id: "tt-sat-3", day: "Saturday", period: 3, time: "11:15 - 12:15", subjectId: "sub-math", subjectName: "Mathematics", faculty: "Prof. M. V. Ratnam", room: "Room 302" },
  { id: "tt-sat-4", day: "Saturday", period: 4, time: "01:15 - 02:15", subjectId: "sub-ai", subjectName: "AI", faculty: "Dr. S. Madhavi", room: "Room 405" },
  { id: "tt-sat-5", day: "Saturday", period: 5, time: "02:15 - 03:15", subjectId: "sub-english", subjectName: "English", faculty: "Dr. G. Shanthi", room: "Lang Lab 1" },
];

/**
 * Maps any date string (YYYY-MM-DD) to its day name and timetable periods
 */
export function getTimetableForDate(dateStr: string, timetable: TimetableSlot[] = WEEKLY_TIMETABLE): {
  dayName: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  isSunday: boolean;
  slots: TimetableSlot[];
} {
  const parts = dateStr.split("-").map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
  const dayName = days[dateObj.getDay()];
  const isSunday = dayName === "Sunday";

  const matchingSlots = timetable
    .filter((s) => s.day === dayName)
    .sort((a, b) => a.period - b.period);

  return {
    dayName,
    isSunday,
    slots: matchingSlots,
  };
}

/**
 * Strict Zero-Start Rule:
 * Initial Attendance History starts completely EMPTY ([]).
 * Attendance is recorded solely when the student manually submits periods via the Attendance Calendar or Daily View.
 * NO fake, random, or default attendance records are generated.
 */
export const INITIAL_ATTENDANCE_HISTORY: AttendanceRecord[] = [];

/**
 * Initial subjects derived dynamically from the attendance records
 */
export const INITIAL_SUBJECTS: Subject[] = getStudentSubjects(
  "pvp-25501A05A1",
  INITIAL_ATTENDANCE_HISTORY
);

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Semester Attendance Audit Notification",
    message: "Dean of Academics has announced that students with overall attendance above 75% are directly eligible for semester-end examinations.",
    date: "2026-09-13",
    type: "attendance",
    read: false,
  },
  {
    id: "notif-2",
    title: "Daily Face Verification System Active",
    message: "Please complete your one-time daily face verification when entering the portal before submitting period attendance.",
    date: "2026-09-13",
    type: "general",
    read: false,
  },
  {
    id: "notif-3",
    title: "Internal Assessment - II Schedule Published",
    message: "Detailed timetable for CSE department mid-examinations has been uploaded on the college portal notice board.",
    date: "2026-09-10",
    type: "academic",
    read: true,
  },
];

/**
 * Cleans and sanitizes the user-entered suffix for the College ID:
 * - Automatically strips any typed or pasted '2550' prefix to prevent duplicate prefixes
 * - Removes non-alphanumeric characters and converts to uppercase
 * - Limits to maximum 6 characters
 */
export function cleanCollegeIdSuffix(raw: string): string {
  let cleaned = (raw || "").toUpperCase().trim();
  if (cleaned.startsWith(COLLEGE_ID_PREFIX)) {
    cleaned = cleaned.slice(COLLEGE_ID_PREFIX.length);
  }
  // Strip non-alphanumeric
  cleaned = cleaned.replace(/[^0-9A-Z]/g, "").slice(0, 6);
  return cleaned;
}

/**
 * Validates the complete official PVP Siddhartha Engineering College ID:
 * - Must start with '2550'
 * - Exactly 10 characters long (2550 + 6 characters)
 * - Alphanumeric format (e.g. 25501A05A1 or 2550123456)
 */
export function validateCollegeId(id: string): { valid: boolean; error?: string } {
  const trimmed = id.trim().toUpperCase();
  if (!trimmed || trimmed === COLLEGE_ID_PREFIX) {
    return { valid: false, error: "Please enter the 6 remaining characters of your College ID." };
  }

  if (!trimmed.startsWith(COLLEGE_ID_PREFIX)) {
    return {
      valid: false,
      error: `Access restricted: College ID must start with ${COLLEGE_ID_PREFIX} for PVP Siddhartha Engineering College.`,
    };
  }

  if (trimmed.length !== 10) {
    const remainingNeeded = 10 - trimmed.length;
    return {
      valid: false,
      error: `Complete College ID must be exactly 10 characters (enter ${remainingNeeded > 0 ? `${remainingNeeded} more characters` : "only 6 characters after 2550"}).`,
    };
  }

  if (!/^[0-9A-Z]+$/.test(trimmed)) {
    return {
      valid: false,
      error: "College ID must contain only alphanumeric characters (digits and uppercase letters).",
    };
  }

  return { valid: true };
}

/**
 * Core Institutional Attendance Engine:
 * Strictly computes OVERALL ATTENDANCE across all subjects as the PRIMARY metric.
 * Uses exact rules from user specification:
 * - Good: comfortably above required %
 *   "Your overall attendance is good. Keep maintaining your attendance."
 * - Warning: close to required % (within 5% above threshold)
 *   "Warning: Your overall attendance is getting close to the minimum requirement."
 * - Critical: below required %
 *   "Critical: Your overall attendance is below the required percentage. Attend upcoming classes regularly."
 */
export function calculateAttendanceMetrics(
  subjects: Subject[],
  requiredPercentage: number = 80
): AttendanceMetrics {
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  const totalAbsent = totalConducted - totalAttended;

  // Zero attendance state for new students with NO submitted records yet
  if (totalConducted === 0) {
    return {
      totalAttended: 0,
      totalConducted: 0,
      totalAbsent: 0,
      overallPercentage: 0,
      requiredPercentage,
      status: "NEW",
      statusMessage: "No attendance records submitted yet. Overall attendance is 0% until you submit your first period entries.",
      canMissClasses: 0,
      recoveryClassesNeeded: 0,
      hasData: false,
    };
  }

  // Exact Institutional Formula:
  // Overall Attendance = (Total Attended Classes / Total Conducted Classes) * 100
  const overallPercentage = Number(((totalAttended / totalConducted) * 100).toFixed(1));

  const targetRatio = requiredPercentage / 100;

  let canMissClasses = 0;
  if (targetRatio > 0 && totalAttended >= targetRatio * totalConducted) {
    canMissClasses = Math.floor((totalAttended - targetRatio * totalConducted) / targetRatio);
  }

  let recoveryClassesNeeded = 0;
  if (overallPercentage < requiredPercentage && targetRatio < 1) {
    const deficit = targetRatio * totalConducted - totalAttended;
    recoveryClassesNeeded = Math.max(0, Math.ceil(deficit / (1 - targetRatio)));
  }

  let status: OverallAttendanceStatus = "GOOD";
  let statusMessage = "Your overall attendance is good. Keep maintaining your attendance.";

  if (overallPercentage < requiredPercentage) {
    status = "CRITICAL";
    statusMessage = "Critical: Your overall attendance is below the required percentage. Attend upcoming classes regularly.";
  } else if (overallPercentage <= requiredPercentage + 5) {
    status = "WARNING";
    statusMessage = "Warning: Your overall attendance is getting close to the minimum requirement.";
  } else {
    status = "GOOD";
    statusMessage = "Your overall attendance is good. Keep maintaining your attendance.";
  }

  return {
    totalAttended,
    totalConducted,
    totalAbsent,
    overallPercentage,
    requiredPercentage,
    status,
    statusMessage,
    canMissClasses,
    recoveryClassesNeeded,
    hasData: true,
  };
}

/**
 * Predicts Semester Overall Attendance:
 * Formula: ((Current Attended + Expected Future Attended) / (Current Conducted + Total Future Classes)) * 100
 * When currentConducted === 0 (new student), returns null so UI renders "Not enough data"
 */
export function predictSemesterAttendance(
  currentAttended: number,
  currentConducted: number,
  futureClasses: number,
  expectedFutureAttendanceRate: number // 0 to 100%
): number | null {
  if (currentConducted === 0) {
    return null; // Not enough data
  }
  const futureAttended = (futureClasses * expectedFutureAttendanceRate) / 100;
  const projectedAttended = currentAttended + futureAttended;
  const projectedConducted = currentConducted + futureClasses;

  if (projectedConducted === 0) return 0;
  return Number(((projectedAttended / projectedConducted) * 100).toFixed(1));
}

// Aliases for compatibility across CMS views
export const INITIAL_TIMETABLE = WEEKLY_TIMETABLE;
export const calculateOverallMetrics = calculateAttendanceMetrics;
export const calculatePredictedAttendance = predictSemesterAttendance;
