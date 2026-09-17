import { Student, AttendanceRecord } from "../types";

export interface LoginResponse {
  success: boolean;
  isNew: boolean;
  student: Student;
  attendance: AttendanceRecord[];
  message?: string;
}

// Local cache keys
const CACHE_KEY_STUDENTS = "pvp_cms_db_students";
const CACHE_KEY_ATTENDANCE = "pvp_cms_db_attendance";
const CACHE_KEY_SESSION = "pvp_cms_current_session_college_id";

// ===============================
// LOCAL CACHE HELPERS
// ===============================

export function getCachedStudents(): Student[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_STUDENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCachedStudents(students: Student[]): void {
  try {
    localStorage.setItem(
      CACHE_KEY_STUDENTS,
      JSON.stringify(students)
    );
  } catch (error) {
    console.warn("Could not save students to local cache", error);
  }
}

export function getCachedAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_ATTENDANCE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCachedAttendance(
  attendance: AttendanceRecord[]
): void {
  try {
    localStorage.setItem(
      CACHE_KEY_ATTENDANCE,
      JSON.stringify(attendance)
    );
  } catch (error) {
    console.warn("Could not save attendance to local cache", error);
  }
}

export function getActiveSessionCollegeId(): string | null {
  try {
    return localStorage.getItem(CACHE_KEY_SESSION);
  } catch {
    return null;
  }
}

export function setActiveSessionCollegeId(
  collegeId: string | null
): void {
  try {
    if (collegeId) {
      localStorage.setItem(CACHE_KEY_SESSION, collegeId);
    } else {
      localStorage.removeItem(CACHE_KEY_SESSION);
    }
  } catch (error) {
    console.warn("Could not update session cache", error);
  }
}

// ===============================
// REGISTER / ENROLL STUDENT
// ===============================

export async function apiEnrollStudent(params: {
  collegeId: string;
  password: string;
  confirmPassword?: string;
  name: string;
  department: string;
  yearSemester?: string;
}): Promise<LoginResponse> {
  const cleanId = params.collegeId.trim().toUpperCase();

  if (!cleanId.startsWith("2550")) {
    throw new Error(
      "Invalid College ID. College ID must start with 2550."
    );
  }

  if (!params.password) {
    throw new Error("Password is required.");
  }

  if (
    params.confirmPassword !== undefined &&
    params.password !== params.confirmPassword
  ) {
    throw new Error("Passwords do not match.");
  }

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collegeId: cleanId,
      password: params.password,
      confirmPassword: params.confirmPassword,
      name: params.name.trim(),
      department: params.department,
      yearSemester: params.yearSemester || "",
    }),
  });

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Server returned an invalid response. Please check that the backend is running."
    );
  }

  // IMPORTANT:
  // Registration failure MUST NOT create a local-only student.
  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        data.message ||
        "Student registration failed. Data was not saved."
    );
  }

  if (!data.student) {
    throw new Error(
      "Registration succeeded on the server, but no student data was returned."
    );
  }

  // Update local cache ONLY after successful backend registration.
  const currentStudents = getCachedStudents();

  const existingIndex = currentStudents.findIndex(
    (student) =>
      student.collegeId.toUpperCase() === cleanId
  );

  if (existingIndex >= 0) {
    currentStudents[existingIndex] = data.student;
  } else {
    currentStudents.push(data.student);
  }

  saveCachedStudents(currentStudents);

  // New student starts with no attendance.
  const currentAttendance = getCachedAttendance().filter(
    (record) =>
      !(
        record.collegeId &&
        record.collegeId.toUpperCase() === cleanId
      )
  );

  saveCachedAttendance(currentAttendance);

  setActiveSessionCollegeId(cleanId);

  return {
    success: true,
    isNew: true,
    student: data.student,
    attendance: Array.isArray(data.attendance)
      ? data.attendance
      : [],
    message:
      data.message ||
      "Student registered successfully and permanently stored in the database.",
  };
}

// ===============================
// LOGIN
// ===============================

export async function apiLogin(
  collegeId: string,
  password: string
): Promise<LoginResponse> {
  const cleanId = collegeId.trim().toUpperCase();

  if (!cleanId.startsWith("2550")) {
    throw new Error(
      "Invalid College ID. College ID must start with 2550."
    );
  }

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collegeId: cleanId,
      password,
    }),
  });

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Server returned an invalid response."
    );
  }

  // IMPORTANT:
  // Login failure does NOT create a local account.
  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        data.message ||
        "Login failed. Please check your College ID and password."
    );
  }

  if (!data.student) {
    throw new Error(
      "Login succeeded but student information was not returned."
    );
  }

  const currentStudents = getCachedStudents();

  const existingIndex = currentStudents.findIndex(
    (student) =>
      student.collegeId.toUpperCase() === cleanId
  );

  if (existingIndex >= 0) {
    currentStudents[existingIndex] = data.student;
  } else {
    currentStudents.push(data.student);
  }

  saveCachedStudents(currentStudents);

  // Replace only this student's cached attendance.
  const currentAttendance = getCachedAttendance().filter(
    (record) =>
      !(
        record.collegeId &&
        record.collegeId.toUpperCase() === cleanId
      )
  );

  const serverAttendance: AttendanceRecord[] =
    Array.isArray(data.attendance)
      ? data.attendance
      : [];

  saveCachedAttendance([
    ...currentAttendance,
    ...serverAttendance,
  ]);

  setActiveSessionCollegeId(cleanId);

  return {
    success: true,
    isNew: false,
    student: data.student,
    attendance: serverAttendance,
    message: data.message,
  };
}

// ===============================
// LOGOUT
// ===============================

export async function apiLogout(
  collegeId?: string
): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collegeId,
      }),
    });
  } catch {
    // Logout should still work locally.
  } finally {
    // Only clear session.
    // DO NOT delete database data.
    setActiveSessionCollegeId(null);
  }
}

// ===============================
// SAVE ATTENDANCE
// ===============================

export async function apiSaveAttendance(
  collegeId: string,
  studentId: string,
  date: string,
  records: Array<{
    period: number;
    time?: string;
    subjectId: string;
    subjectName: string;
    status: "PRESENT" | "ABSENT";
    day?: string;
  }>
): Promise<AttendanceRecord[]> {
  const cleanId = collegeId.trim().toUpperCase();

  const response = await fetch("/api/attendance/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collegeId: cleanId,
      studentId,
      date,
      records,
    }),
  });

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Attendance server returned an invalid response."
    );
  }

  // IMPORTANT:
  // Do NOT silently save attendance locally if Supabase failed.
  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        data.message ||
        "Attendance was not saved to the database."
    );
  }

  const serverAttendance: AttendanceRecord[] =
    Array.isArray(data.attendance)
      ? data.attendance
      : [];

  // Update local cache only after successful database save.
  const allAttendance = getCachedAttendance().filter(
    (record) =>
      !(
        record.collegeId &&
        record.collegeId.toUpperCase() === cleanId &&
        record.date === date
      )
  );

  saveCachedAttendance([
    ...allAttendance,
    ...serverAttendance,
  ]);

  return serverAttendance;
}

// ===============================
// DELETE ATTENDANCE FOR DATE
// ===============================

export async function apiDeleteDateAttendance(
  collegeId: string,
  studentId: string,
  date: string
): Promise<void> {
  const cleanId = collegeId.trim().toUpperCase();

  const response = await fetch("/api/attendance/date", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collegeId: cleanId,
      studentId,
      date,
    }),
  });

  let data: any = {};

  try {
    data = await response.json();
  } catch {
    // Some DELETE endpoints may return no JSON.
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.error ||
        data.message ||
        "Attendance could not be deleted from the database."
    );
  }

  // Remove from local cache only after server deletion succeeds.
  const remaining = getCachedAttendance().filter(
    (record) =>
      !(
        record.collegeId &&
        record.collegeId.toUpperCase() === cleanId &&
        record.date === date
      )
  );

  saveCachedAttendance(remaining);
}

// ===============================
// UPDATE STUDENT PROFILE
// ===============================

export async function apiUpdateStudent(
  collegeId: string,
  updates: Partial<Student>
): Promise<Student> {
  const cleanId = collegeId.trim().toUpperCase();

  const response = await fetch(
    `/api/student/${encodeURIComponent(cleanId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Profile server returned an invalid response."
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        data.message ||
        "Profile update failed."
    );
  }

  if (!data.student) {
    throw new Error(
      "Profile update succeeded but no student data was returned."
    );
  }

  // Update local cache only after successful database update.
  const students = getCachedStudents();

  const index = students.findIndex(
    (student) =>
      student.collegeId.toUpperCase() === cleanId
  );

  if (index >= 0) {
    students[index] = data.student;
  } else {
    students.push(data.student);
  }

  saveCachedStudents(students);

  return data.student;
}