import crypto from "crypto";
import { supabase } from "./supabase";

export interface StudentRecord {
  collegeId: string;
  name: string;
  department: string;
  yearSemester: string;
  createdAt?: string;
}

export interface AttendanceItem {
  date: string;
  period: number;
  subject: string;
  status: "Present" | "Absent";
}

interface StoredStudent {
  college_id: string;
  password_hash: string;
  name: string;
  department: string;
  year_semester: string;
  created_at?: string;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, originalHash] = stored.split(":");

    if (!salt || !originalHash) return false;

    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");

    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(originalHash, "hex")
    );
  } catch {
    return false;
  }
}

function toStudent(row: StoredStudent): StudentRecord {
  return {
    collegeId: row.college_id,
    name: row.name,
    department: row.department,
    yearSemester: row.year_semester,
    createdAt: row.created_at,
  };
}

export function sanitizeStudent(student: StudentRecord): StudentRecord {
  return {
    collegeId: student.collegeId,
    name: student.name,
    department: student.department,
    yearSemester: student.yearSemester,
    createdAt: student.createdAt,
  };
}

export const db = {

  async enrollStudent(input: {
    collegeId: string;
    password: string;
    name: string;
    department: string;
    yearSemester: string;
  }) {
    try {
      const { data: existing, error: checkError } = await supabase
        .from("students")
        .select("college_id")
        .eq("college_id", input.collegeId)
        .maybeSingle();

      if (checkError) {
        console.error("Supabase student check error:", checkError);

        return {
          success: false,
          error: checkError.message,
        };
      }

      if (existing) {
        return {
          success: false,
          error: "This student account already exists. Please login.",
        };
      }

      const passwordHash = hashPassword(input.password);

      const { data, error } = await supabase
        .from("students")
        .insert({
          college_id: input.collegeId,
          password_hash: passwordHash,
          name: input.name,
          department: input.department,
          year_semester: input.yearSemester,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase student insert error:", error);

        if (error.code === "23505") {
          return {
            success: false,
            error: "This student account already exists. Please login.",
          };
        }

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        student: toStudent(data),
      };

    } catch (error: any) {
      console.error("enrollStudent error:", error);

      return {
        success: false,
        error: error?.message || "Failed to create student.",
      };
    }
  },

  async verifyLogin(collegeId: string, password: string) {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("college_id", collegeId)
        .maybeSingle();

      if (error) {
        console.error("Supabase login error:", error);

        return {
          success: false,
          error: error.message,
        };
      }

      if (!data) {
        return {
          success: false,
          error: "Invalid College ID or password.",
        };
      }

      const validPassword = verifyPassword(
        password,
        data.password_hash
      );

      if (!validPassword) {
        return {
          success: false,
          error: "Invalid College ID or password.",
        };
      }

      return {
        success: true,
        student: toStudent(data),
      };

    } catch (error: any) {
      console.error("verifyLogin error:", error);

      return {
        success: false,
        error: "Login failed.",
      };
    }
  },

  async getAllStudents(): Promise<StudentRecord[]> {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Get students error:", error);
        return [];
      }

      return (data || []).map(toStudent);

    } catch {
      return [];
    }
  },

  async getStudent(collegeId: string): Promise<StudentRecord | null> {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("college_id", collegeId)
        .maybeSingle();

      if (error || !data) return null;

      return toStudent(data);

    } catch {
      return null;
    }
  },

  async updateStudent(
    collegeId: string,
    updates: {
      name?: string;
      department?: string;
      yearSemester?: string;
    }
  ) {
    try {
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

      const { data, error } = await supabase
        .from("students")
        .update(updateData)
        .eq("college_id", collegeId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        student: toStudent(data),
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Profile update failed.",
      };
    }
  },

  async getAllAttendance(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .order("attendance_date", { ascending: false });

      if (error) {
        console.error("Get attendance error:", error);
        return [];
      }

      return data || [];

    } catch {
      return [];
    }
  },

  async getAttendanceForStudent(collegeId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", collegeId)
        .order("attendance_date", { ascending: false })
        .order("period", { ascending: true });

      if (error) {
        console.error("Get student attendance error:", error);
        return [];
      }

      return data || [];

    } catch {
      return [];
    }
  },

  async saveDateAttendance(
    collegeId: string,
    date: string,
    records: AttendanceItem[]
  ) {
    try {
      /*
       * Delete only the student's attendance
       * for this particular date.
       *
       * Then insert the latest records.
       * This allows UPDATE from the website
       * without creating duplicates.
       */

      const { error: deleteError } = await supabase
        .from("attendance")
        .delete()
        .eq("student_id", collegeId)
        .eq("attendance_date", date);

      if (deleteError) {
        console.error("Attendance delete error:", deleteError);

        return {
          success: false,
          error: deleteError.message,
        };
      }

      if (!records || records.length === 0) {
        return {
          success: true,
          records: [],
        };
      }

      const rows = records.map((record) => ({
        student_id: collegeId,
        attendance_date: date,
        period: Number(record.period),
        subject: record.subject,
        status: record.status,
      }));

      const { data, error } = await supabase
        .from("attendance")
        .insert(rows)
        .select();

      if (error) {
        console.error("Attendance insert error:", error);

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        records: data || [],
      };

    } catch (error: any) {
      console.error("saveDateAttendance error:", error);

      return {
        success: false,
        error: error?.message || "Attendance save failed.",
      };
    }
  },

  async deleteDateAttendance(
    collegeId: string,
    date: string
  ) {
    try {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("student_id", collegeId)
        .eq("attendance_date", date);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to delete attendance.",
      };
    }
  },
};
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};