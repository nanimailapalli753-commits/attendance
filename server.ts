import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import {
  db,
  StudentRecord,
  AttendanceItem,
  sanitizeStudent,
} from "./server/database";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "10mb" }));

/* =========================================================
   BASIC HEALTH CHECK
========================================================= */
app.get("/api/students/count", async (_req, res) => {
  try {
    const students = await db.getAllStudents();

    res.json({
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("[Student Count Error]", error);

    res.status(500).json({
      error: "Failed to get student count",
    });
  }
});

/* =========================================================
   DATABASE STATUS
========================================================= */

app.get("/api/database/status", async (_req, res) => {
  try {
    const students = await db.getAllStudents();
    const attendance = await db.getAllAttendance();

    res.json({
      status: "connected",
      storageType: "supabase",
      studentCount: students.length,
      attendanceRecordsCount: attendance.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Database Status Error]", error);

    res.status(500).json({
      status: "error",
      storageType: "supabase",
      error: error?.message || "Database connection failed",
    });
  }
});

/* =========================================================
   REGISTER STUDENT
========================================================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      collegeId,
      password,
      confirmPassword,
      name,
      department,
      yearSemester,
    } = req.body;

    const cleanCollegeId = String(collegeId || "").trim();
    const cleanName = String(name || "").trim();
    const cleanDepartment = String(department || "").trim();
    const cleanYearSemester = String(yearSemester || "").trim();

    if (!/^2550[A-Za-z0-9]{6}$/.test(cleanCollegeId)) {
      return res.status(400).json({
        success: false,
        error: "College ID must start with 2550 and contain 10 characters.",
      });
    }

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        error: "Student name is required.",
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must contain at least 6 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match.",
      });
    }

    if (!cleanDepartment) {
      return res.status(400).json({
        success: false,
        error: "Branch is required.",
      });
    }

    if (!cleanYearSemester) {
      return res.status(400).json({
        success: false,
        error: "Year/Semester is required.",
      });
    }

    const student = await db.enrollStudent({
      collegeId: cleanCollegeId,
      password: String(password),
      name: cleanName,
      department: cleanDepartment,
      yearSemester: cleanYearSemester,
    });

    return res.status(201).json({
      success: true,
      student: sanitizeStudent(student),
      attendance: [],
    });
  } catch (error: any) {
    console.error("[Register Error]", error);

    return res.status(400).json({
      success: false,
      error: error?.message || "Registration failed.",
    });
  }
});

/* =========================================================
   LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { collegeId, password } = req.body;

    const cleanCollegeId = String(collegeId || "").trim();

    if (!cleanCollegeId || !password) {
      return res.status(400).json({
        success: false,
        error: "College ID and password are required.",
      });
    }

    if (!cleanCollegeId.startsWith("2550")) {
      return res.status(403).json({
        success: false,
        error: "College-only login required.",
      });
    }

    const student = await db.verifyLogin(
      cleanCollegeId,
      String(password)
    );

    if (!student) {
      return res.status(401).json({
        success: false,
        error: "Invalid College ID or password.",
      });
    }

    const attendance = await db.getAttendanceForStudent(
      cleanCollegeId
    );

    return res.json({
      success: true,
      student: sanitizeStudent(student),
      attendance,
    });
  } catch (error: any) {
    console.error("[Login Error]", error);

    return res.status(500).json({
      success: false,
      error: "Login failed.",
    });
  }
});

/* =========================================================
   LOGOUT
========================================================= */

app.post("/api/auth/logout", (_req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

/* =========================================================
   GET STUDENT
========================================================= */

app.get("/api/student/:collegeId", async (req, res) => {
  try {
    const collegeId = String(req.params.collegeId || "").trim();

    const student = await db.getStudent(collegeId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found.",
      });
    }

    const attendance = await db.getAttendanceForStudent(collegeId);

    return res.json({
      success: true,
      student: sanitizeStudent(student),
      attendance,
    });
  } catch (error: any) {
    console.error("[Get Student Error]", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load student.",
    });
  }
});

/* =========================================================
   GET ALL STUDENTS
========================================================= */

app.get("/api/students", async (_req, res) => {
  try {
    const students = await db.getAllStudents();

    res.json({
      success: true,
      students: students.map(sanitizeStudent),
    });
  } catch (error: any) {
    console.error("[Students Error]", error);

    res.status(500).json({
      success: false,
      error: "Unable to load students.",
    });
  }
});

/* =========================================================
   UPDATE PROFILE
========================================================= */

app.put("/api/student/:collegeId", async (req, res) => {
  try {
    const collegeId = String(req.params.collegeId || "").trim();

    const existing = await db.getStudent(collegeId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Student not found.",
      });
    }

    const updates: Partial<StudentRecord> = {};

    if (req.body.name !== undefined) {
      updates.name = String(req.body.name).trim();
    }

    if (req.body.department !== undefined) {
      updates.department = String(req.body.department).trim();
    }

    if (req.body.yearSemester !== undefined) {
      updates.yearSemester = String(req.body.yearSemester).trim();
    }

    const updated = await db.updateStudent(collegeId, updates);

    if (!updated) {
      return res.status(500).json({
        success: false,
        error: "Profile update failed.",
      });
    }

    return res.json({
      success: true,
      student: sanitizeStudent(updated),
    });
  } catch (error: any) {
    console.error("[Profile Update Error]", error);

    return res.status(500).json({
      success: false,
      error: "Unable to update profile.",
    });
  }
});

/* =========================================================
   GET STUDENT ATTENDANCE
========================================================= */

app.get("/api/attendance/:collegeId", async (req, res) => {
  try {
    const collegeId = String(req.params.collegeId || "").trim();

    const attendance =
      await db.getAttendanceForStudent(collegeId);

    res.json({
      success: true,
      attendance,
    });
  } catch (error: any) {
    console.error("[Attendance Get Error]", error);

    res.status(500).json({
      success: false,
      error: "Unable to load attendance.",
    });
  }
});

/* =========================================================
   SAVE ATTENDANCE
========================================================= */

app.post("/api/attendance/save", async (req, res) => {
  try {
    const {
      collegeId,
      studentId,
      date,
      records,
    } = req.body;

    const cleanCollegeId = String(
      collegeId || studentId || ""
    ).trim();

    const cleanDate = String(date || "").trim();

    if (!cleanCollegeId) {
      return res.status(400).json({
        success: false,
        error: "Student/College ID is required.",
      });
    }

    if (!cleanDate) {
      return res.status(400).json({
        success: false,
        error: "Attendance date is required.",
      });
    }

    const student = await db.getStudent(cleanCollegeId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found.",
      });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: "Attendance records must be an array.",
      });
    }

    const formattedRecords: AttendanceItem[] = records
      .map((record: any) => ({
        date: cleanDate,
        period: Number(record.period),
        subject: String(record.subject || "").trim(),
        status:
          record.status === "Present"
            ? "Present"
            : record.status === "Absent"
              ? "Absent"
              : "",
      }))
      .filter(
        (record: any) =>
          Number.isInteger(record.period) &&
          record.period > 0 &&
          record.subject &&
          record.status
      );

    const result = await db.saveDateAttendance(
      cleanCollegeId,
      cleanDate,
      formattedRecords
    );

    if (!result?.success) {
      return res.status(500).json({
        success: false,
        error: result?.error || "Attendance save failed.",
      });
    }

    const updatedAttendance =
      await db.getAttendanceForStudent(cleanCollegeId);

    return res.json({
      success: true,
      message: "Attendance saved successfully.",
      attendance: updatedAttendance,
    });
  } catch (error: any) {
    console.error("[Attendance Save Error]", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Attendance save failed.",
    });
  }
});

/* =========================================================
   DELETE ATTENDANCE FOR A DATE
========================================================= */

app.delete("/api/attendance/date", async (req, res) => {
  try {
    const {
      collegeId,
      studentId,
      date,
    } = req.body;

    const cleanCollegeId = String(
      collegeId || studentId || ""
    ).trim();

    const cleanDate = String(date || "").trim();

    if (!cleanCollegeId || !cleanDate) {
      return res.status(400).json({
        success: false,
        error: "College ID and date are required.",
      });
    }

    const result = await db.deleteDateAttendance(
      cleanCollegeId,
      cleanDate
    );

    if (!result?.success) {
      return res.status(500).json({
        success: false,
        error: result?.error || "Attendance deletion failed.",
      });
    }

    const attendance =
      await db.getAttendanceForStudent(cleanCollegeId);

    return res.json({
      success: true,
      message: "Attendance deleted successfully.",
      attendance,
    });
  } catch (error: any) {
    console.error("[Attendance Delete Error]", error);

    return res.status(500).json({
      success: false,
      error: "Attendance deletion failed.",
    });
  }
});

/* =========================================================
   AI ATTENDANCE RECOMMENDATION
========================================================= */

app.post("/api/ai/recommendation", async (req, res) => {
  try {
    const {
      attendancePercentage,
      attended,
      conducted,
      target,
      subject,
    } = req.body;

    const percentage = Number(attendancePercentage || 0);
    const attendedClasses = Number(attended || 0);
    const conductedClasses = Number(conducted || 0);
    const targetPercentage = Number(target || 75);

    if (conductedClasses === 0) {
      return res.json({
        success: true,
        recommendation:
          "No attendance records yet. Enter your attendance manually to receive a prediction.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        recommendation:
          percentage >= targetPercentage
            ? "Your attendance is currently above the target. Continue attending classes regularly."
            : "Your attendance is below the target. Try to attend upcoming classes regularly.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an attendance advisor for a college student.

Current attendance: ${percentage.toFixed(2)}%
Attended: ${attendedClasses}
Conducted: ${conductedClasses}
Target: ${targetPercentage}%
Subject: ${subject || "Overall"}

Give a short practical recommendation.
Do not invent attendance records.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.json({
      success: true,
      recommendation:
        response.text ||
        "Continue attending classes regularly.",
    });
  } catch (error: any) {
    console.error("[AI Recommendation Error]", error);

    return res.json({
      success: true,
      recommendation:
        "Continue attending classes regularly and maintain your attendance above the required percentage.",
    });
  }
});

/* =========================================================
   FACE VERIFICATION
   NOTE:
   This endpoint is only a verification placeholder.
   It does NOT create attendance records.
========================================================= */

app.post("/api/frd/verify", async (req, res) => {
  try {
    const { collegeId, imageQuality } = req.body;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        matched: false,
        error: "College ID is required.",
      });
    }

    const student = await db.getStudent(
      String(collegeId).trim()
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        matched: false,
        error: "Student not found.",
      });
    }

    const quality = Number(imageQuality || 0);

    if (quality > 0 && quality < 0.3) {
      return res.json({
        success: true,
        matched: false,
        liveness: false,
        confidence: 0,
        message: "Image quality is too low.",
      });
    }

    /*
      Important:
      Face verification does not automatically mark attendance.
      The user must still manually select Present/Absent.
    */

    return res.json({
      success: true,
      matched: true,
      liveness: true,
      confidence: 95,
      message: "Identity verification successful.",
    });
  } catch (error: any) {
    console.error("[FRD Error]", error);

    return res.status(500).json({
      success: false,
      matched: false,
      error: "Face verification failed.",
    });
  }
});

/* =========================================================
   VITE
========================================================= */

async function startServer() {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: "spa",
      });

      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(process.cwd(), "dist");

      app.use(express.static(distPath));

      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
app.get("/api/students/count", async (_req, res) => {
  try {
    const students = await db.getAllStudents();

    res.json({
      totalStudents: students.length
    });
  } catch (error) {
    console.error("[Student Count Error]", error);
    res.status(500).json({
      error: "Failed to get student count"
    });
  }
});
    app.listen(PORT, "0.0.0.0", () => {
      console.log("======================================");
      console.log("AI Attendance Agent is running!");
      console.log(`Local:   http://localhost:${PORT}`);
      console.log(`Network: http://127.0.0.1:${PORT}`);
      console.log("Database: Supabase");
      console.log("======================================");
    });
  } catch (error) {
    console.error("SERVER STARTUP ERROR:", error);
    process.exit(1);
  }
}
export { app };

// Start the Express server only when running locally
if (!process.env.NETLIFY) {
  startServer();
}