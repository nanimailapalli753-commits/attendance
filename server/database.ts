import crypto from "crypto";
import { supabase } from "./supabase";

export interface StudentRecord {
  id: string;
  collegeId: string;
  name: string;
  collegeName: string;
  department: string;
  yearSemester: string;
  faceEnrolled: boolean;
}

export interface AttendanceItem {
  id?: string;
  studentId: string;
  studentName: string;
  collegeId: string;
  date: string;
  day: string;
  period: number;
  time: string;
  subjectId: string;
  subjectName: string;
  status: "Present" | "Absent";
  recordedAt: string;
  updatedAt?: string;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");

  if (parts.length !== 2) {
    return false;
  }

  const [salt, originalHash] = parts;

  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(originalHash, "hex")
  );
}

function rowToStudent(row: any): StudentRecord {
  return {
    id: row.id,
    collegeId: row.college_id,
    name: row.name,
    collegeName: row.college_name || "PVP Siddhartha Engineering College",
    department: row.department,
    yearSemester: row.year_semester,
    faceEnrolled: row.face_enrolled ?? false,
  };
}

function rowToAttendance(row: any): AttendanceItem {
  const date = row.attendance_date;

  const day = new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "long" }
  );

  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name || "",
    collegeId: row.college_id || "",
    date,
    day,
    period: Number(row.period),
    time: row.time || "",
    subjectId: row.subject_id || "",
    subjectName: row.subject || "",
    status: row.status,
    recordedAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

export async function enrollStudent(
  student: Omit<StudentRecord, "id" | "faceEnrolled"> & {
    password: string;
  }
): Promise<StudentRecord> {
  const passwordHash = hashPassword(student.password);

  const { data, error } = await supabase
    .from("students")
    .insert({
      college_id: student.collegeId,
      name: student.name,
      college_name: student.collegeName,
      department: student.department,
      year_semester: student.yearSemester,
      password_hash: passwordHash,
      face_enrolled: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return rowToStudent(data);
}

export async function verifyLogin(
  collegeId: string,
  password: string
): Promise<StudentRecord | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("college_id", collegeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  if (!verifyPassword(password, data.password_hash)) {
    return null;
  }

  return rowToStudent(data);
}

export async function getAllStudents(): Promise<StudentRecord[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(rowToStudent);
}

export async function getStudent(
  collegeId: string
): Promise<StudentRecord | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("college_id", collegeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToStudent(data) : null;
}

export async function updateStudent(
  collegeId: string,
  updates: Partial<StudentRecord>
): Promise<StudentRecord | null> {
  const updateData: any = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }

  if (updates.department !== undefined) {
    updateData.department = updates.department;
  }

  if (updates.yearSemester !== undefined) {
    updateData.year_semester = updates.yearSemester;
  }

  if (updates.collegeName !== undefined) {
    updateData.college_name = updates.collegeName;
  }

  if (updates.faceEnrolled !== undefined) {
    updateData.face_enrolled = updates.faceEnrolled;
  }

  const { data, error } = await supabase
    .from("students")
    .update(updateData)
    .eq("college_id", collegeId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToStudent(data) : null;
}

export async function getAllAttendance(): Promise<AttendanceItem[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .order("attendance_date", { ascending: true })
    .order("period", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(rowToAttendance);
}

export async function getAttendanceForStudent(
  collegeId: string
): Promise<AttendanceItem[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("college_id", collegeId)
    .order("attendance_date", { ascending: true })
    .order("period", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(rowToAttendance);
}

export async function saveDateAttendance(
  collegeId: string,
  studentId: string,
  date: string,
  records: AttendanceItem[]
): Promise<AttendanceItem[]> {
  const { error: deleteError } = await supabase
    .from("attendance")
    .delete()
    .eq("college_id", collegeId)
    .eq("attendance_date", date);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (records.length === 0) {
    return [];
  }

  const rows = records.map((record) => ({
    student_id: studentId,
    student_name: record.studentName,
    college_id: collegeId,
    attendance_date: date,
    period: record.period,
    time: record.time,
    subject_id: record.subjectId,
    subject: record.subjectName,
    status: record.status,
  }));

  const { data, error } = await supabase
    .from("attendance")
    .insert(rows)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(rowToAttendance);
}

export async function deleteDateAttendance(
  collegeId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("college_id", collegeId)
    .eq("attendance_date", date);

  if (error) {
    throw new Error(error.message);
  }
}

export function sanitizeStudent(student: StudentRecord) {
  return {
    id: student.id,
    collegeId: student.collegeId,
    name: student.name,
    collegeName: student.collegeName,
    department: student.department,
    yearSemester: student.yearSemester,
    faceEnrolled: student.faceEnrolled,
  };
}

export const db = {
  enrollStudent,
  verifyLogin,
  getAllStudents,
  getStudent,
  updateStudent,
  getAllAttendance,
  getAttendanceForStudent,
  saveDateAttendance,
  deleteDateAttendance,
};