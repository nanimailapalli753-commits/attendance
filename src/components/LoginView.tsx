import React, { useState } from "react";
import { Student, AttendanceRecord } from "../types";
import {
  validateCollegeId,
  cleanCollegeIdSuffix,
  COLLEGE_ID_PREFIX,
  PVP_DEPARTMENTS,
  INITIAL_STUDENTS,
} from "../data/mockData";
import { apiLogin, apiEnrollStudent } from "../services/apiService";
import {
  GraduationCap,
  ShieldAlert,
  ArrowRight,
  Building2,
  Lock,
  RotateCcw,
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  KeyRound,
  User,
  CheckCircle2,
} from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (
    student: Student,
    attendance?: AttendanceRecord[]
  ) => void;

  allStudents: Student[];

  onRegisterStudent: (newStudent: Student) => void;

  onResetAllData?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  allStudents: _allStudents,
  onRegisterStudent,
  onResetAllData,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const [loginSuffix, setLoginSuffix] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ---------------------------------------------------------
  // REGISTRATION
  // ---------------------------------------------------------

  const [regName, setRegName] = useState("");
  const [regSuffix, setRegSuffix] = useState("");
  const [regDept, setRegDept] = useState<string>(
    PVP_DEPARTMENTS[0]
  );
  const [regYear, setRegYear] = useState(
    "III B.Tech - II Semester"
  );

  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] =
    useState("");

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] =
    useState(false);

  // ---------------------------------------------------------
  // LOGIN ID
  // ---------------------------------------------------------

  const handleLoginSuffixChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const cleaned = cleanCollegeIdSuffix(e.target.value);

    setLoginSuffix(cleaned);

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // ---------------------------------------------------------
  // REGISTRATION ID
  // ---------------------------------------------------------

  const handleRegSuffixChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const cleaned = cleanCollegeIdSuffix(e.target.value);

    setRegSuffix(cleaned);

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const completeId =
      `${COLLEGE_ID_PREFIX}${loginSuffix}`
        .trim()
        .toUpperCase();

    const validation = validateCollegeId(completeId);

    if (!validation.valid) {
      setErrorMessage(
        validation.error ||
          "Invalid College Roll No format."
      );
      return;
    }

    if (!loginPassword) {
      setErrorMessage(
        "Please enter your account password."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiLogin(
        completeId,
        loginPassword
      );

      if (res && res.student) {
        onLoginSuccess(
          res.student,
          res.attendance || []
        );
      } else {
        setErrorMessage(
          "Could not load student information from the database."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // REGISTER NEW STUDENT
  // ---------------------------------------------------------

  const handleRegisterSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // Name validation
    if (!regName.trim()) {
      setErrorMessage(
        "Please enter the student's full name."
      );
      return;
    }

    // Create complete college ID
    const completeId =
      `${COLLEGE_ID_PREFIX}${regSuffix}`
        .trim()
        .toUpperCase();

    // College ID validation
    const validation = validateCollegeId(completeId);

    if (!validation.valid) {
      setErrorMessage(
        validation.error ||
          "Invalid College Roll No format."
      );
      return;
    }

    // Password validation
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage(
        "Password must be at least 4 characters long."
      );
      return;
    }

    // Confirm password
    if (regPassword !== regConfirmPassword) {
      setErrorMessage(
        "Passwords do not match. Please verify your password."
      );
      return;
    }

    setIsLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * This sends the NEW student directly to:
       *
       * LoginView
       *      ↓
       * apiEnrollStudent()
       *      ↓
       * /api/auth/register
       *      ↓
       * server.ts
       *      ↓
       * database.ts
       *      ↓
       * Supabase students table
       */

      const res = await apiEnrollStudent({
        collegeId: completeId,

        password: regPassword,

        confirmPassword: regConfirmPassword,

        name: regName.trim(),

        department: regDept,

        yearSemester: regYear,
      });

      // Registration successful
      if (res && res.student) {
        /*
         * Add student to frontend state.
         * The database insertion has already happened
         * inside apiEnrollStudent().
         */
        onRegisterStudent(res.student);

        /*
         * New students ALWAYS start with zero attendance.
         */
        onLoginSuccess(
          res.student,
          []
        );

        setSuccessMessage(
          `Student ${completeId} registered successfully.`
        );

        /*
         * Clear registration form.
         */
        setRegName("");
        setRegSuffix("");
        setRegPassword("");
        setRegConfirmPassword("");

        return;
      }

      // Backend did not return a student
      setErrorMessage(
        "Registration failed. The student was not added to the database."
      );
    } catch (err: any) {
      console.error(
        "Student registration error:",
        err
      );

      const message =
        err?.message ||
        "Registration failed. Please try again.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // DEMO LOGIN
  // ---------------------------------------------------------

  const selectDemoAccount = async (
    demoFullId: string
  ) => {
    const suffix =
      cleanCollegeIdSuffix(demoFullId);

    setLoginSuffix(suffix);

    setLoginPassword("pvp@123");

    setErrorMessage("");
    setSuccessMessage("");

    setIsRegistering(false);

    setIsLoading(true);

    try {
      const res = await apiLogin(
        demoFullId,
        "pvp@123"
      );

      if (res && res.student) {
        onLoginSuccess(
          res.student,
          res.attendance || []
        );
      } else {
        setErrorMessage(
          "Demo account could not be loaded."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Demo login failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SWITCH EXISTING ID TO LOGIN
  // ---------------------------------------------------------

  const switchToLoginWithExistingId = () => {
    setLoginSuffix(regSuffix);

    setLoginPassword("");

    setErrorMessage("");

    setSuccessMessage("");

    setIsRegistering(false);
  };

  // ---------------------------------------------------------
  // ID PREVIEW
  // ---------------------------------------------------------

  const fullLoginIdPreview =
    `${COLLEGE_ID_PREFIX}${loginSuffix}`;

  const fullRegIdPreview =
    `${COLLEGE_ID_PREFIX}${regSuffix}`;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* College Header */}
      <div className="text-center max-w-lg mb-6 relative z-10">

        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20 mb-3 ring-4 ring-amber-400/20">
          <GraduationCap className="w-8 h-8 text-slate-950" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Prasad V. Potluri Siddhartha
        </h1>

        <p className="text-sm sm:text-base font-semibold text-amber-400 mt-0.5">
          Engineering College (Autonomous)
        </p>

        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          AI Attendance Agent • College Management System
          (CMS) Portal
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative z-10">

        {/* Login / Registration tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800 text-xs font-semibold">

          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegistering
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Existing Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isRegistering
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">

            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />

            <div className="flex-1">

              <span className="font-bold block text-rose-200">
                Notice
              </span>

              <span>
                {errorMessage}
              </span>

              {errorMessage.includes(
                "already exists"
              ) && (
                <div className="mt-2">

                  <button
                    type="button"
                    onClick={
                      switchToLoginWithExistingId
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    <span>
                      Login with{" "}
                      {COLLEGE_ID_PREFIX}
                      {regSuffix}
                    </span>

                    <ArrowRight className="w-3 h-3" />
                  </button>

                </div>
              )}

            </div>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs">

            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />

            <div className="flex-1">
              {successMessage}
            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* LOGIN FORM */}
        {/* ================================================= */}

        {!isRegistering ? (
          <form
            onSubmit={handleLoginSubmit}
            className="space-y-4"
          >

            {/* College ID */}
            <div>

              <div className="flex items-center justify-between mb-1.5">

                <label className="block text-xs font-semibold text-slate-300">
                  College Roll No
                </label>

                <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Prefix 2550 fixed
                </span>

              </div>

              <div className="flex items-stretch rounded-xl border border-slate-700 bg-slate-950 overflow-hidden focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">

                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 border-r border-slate-800 text-amber-400 font-mono font-bold text-sm">
                  <span>2550</span>
                  <span className="text-slate-600">|</span>
                </div>

                <input
                  type="text"
                  value={loginSuffix}
                  onChange={
                    handleLoginSuffixChange
                  }
                  placeholder="1A05A1"
                  maxLength={6}
                  className="flex-1 px-3 py-2.5 bg-transparent text-white font-mono text-sm tracking-wider uppercase placeholder:text-slate-600 focus:outline-none"
                  required
                  autoFocus
                />

              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">

                <span>
                  Complete Roll No:{" "}
                  <strong className="font-mono text-amber-300">
                    {fullLoginIdPreview}

                    {loginSuffix.length < 6 && (
                      <span className="text-slate-600">
                        {"_".repeat(
                          6 - loginSuffix.length
                        )}
                      </span>
                    )}
                  </strong>
                </span>

                <span className="font-mono text-[10px] text-slate-500">
                  {fullLoginIdPreview.length}/10
                </span>

              </div>

            </div>

            {/* Password */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Password
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  type={
                    showLoginPassword
                      ? "text"
                      : "password"
                  }
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(
                      e.target.value
                    );

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="Enter your student password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowLoginPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer"
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                Demo password:{" "}
                <code className="text-amber-400 font-mono">
                  pvp@123
                </code>
              </p>

            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Verifying Credentials...
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>
                    Login to Attendance Portal
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </form>
        ) : (

          /* ================================================= */
          /* REGISTRATION FORM */
          /* ================================================= */

          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-3.5"
          >

            {/* College ID */}
            <div>

              <div className="flex items-center justify-between mb-1">

                <label className="block text-xs font-semibold text-slate-300">
                  College Roll No
                </label>

                <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Prefix 2550 fixed
                </span>

              </div>

              <div className="flex items-stretch rounded-xl border border-slate-700 bg-slate-950 overflow-hidden">

                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-r border-slate-800 text-amber-400 font-mono font-bold text-xs">
                  <span>2550</span>
                  <span className="text-slate-600">|</span>
                </div>

                <input
                  type="text"
                  value={regSuffix}
                  onChange={
                    handleRegSuffixChange
                  }
                  placeholder="1A05B2"
                  maxLength={6}
                  className="flex-1 px-3 py-2 bg-transparent text-white font-mono text-xs uppercase placeholder:text-slate-600 focus:outline-none"
                  required
                  autoFocus
                />

              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">

                <span>
                  Resulting Roll No:{" "}
                  <strong className="font-mono text-amber-300">
                    {fullRegIdPreview}

                    {regSuffix.length < 6 && (
                      <span className="text-slate-600">
                        {"_".repeat(
                          6 - regSuffix.length
                        )}
                      </span>
                    )}
                  </strong>
                </span>

                <span className="font-mono text-[10px] text-slate-500">
                  {fullRegIdPreview.length}/10
                </span>

              </div>

            </div>

            {/* Name */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Full Name
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-3.5 h-3.5" />
                </div>

                <input
                  type="text"
                  value={regName}
                  onChange={(e) =>
                    setRegName(e.target.value)
                  }
                  placeholder="Enter full name"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  required
                />

              </div>

            </div>

            {/* Department */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Branch / Department
              </label>

              <select
                value={regDept}
                onChange={(e) =>
                  setRegDept(e.target.value)
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {PVP_DEPARTMENTS.map(
                  (dept) => (
                    <option
                      key={dept}
                      value={dept}
                    >
                      {dept}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* Password */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>

                <input
                  type={
                    showRegPassword
                      ? "text"
                      : "password"
                  }
                  value={regPassword}
                  onChange={(e) =>
                    setRegPassword(
                      e.target.value
                    )
                  }
                  placeholder="Minimum 4 characters"
                  className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowRegPassword(
                      (p) => !p
                    )
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer"
                >
                  {showRegPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>

              </div>

            </div>

            {/* Confirm Password */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>

                <input
                  type={
                    showRegConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    regConfirmPassword
                  }
                  onChange={(e) =>
                    setRegConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowRegConfirmPassword(
                      (p) => !p
                    )
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer"
                >
                  {showRegConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>

              </div>

            </div>

            {/* Zero Attendance Notice */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">

              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />

              <span>
                New enrollment starts at{" "}
                <strong>0% attendance</strong>.
                Password is securely hashed in
                the database.
              </span>

            </div>

            {/* Register */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Saving to Database...
                  </span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    Create Account & Enter Portal
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

            </button>

          </form>
        )}

        {/* Demo Accounts */}
        <div className="mt-5 pt-4 border-t border-slate-800">

          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            PVP Siddhartha Demo Accounts
          </p>

          <div className="grid grid-cols-1 gap-2">

            {INITIAL_STUDENTS.map((student) => {

              const suffix =
                cleanCollegeIdSuffix(
                  student.collegeId
                );

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() =>
                    selectDemoAccount(
                      student.collegeId
                    )
                  }
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-left cursor-pointer group"
                >

                  <div className="flex items-center gap-2.5">

                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                      {student.name.charAt(0)}
                    </div>

                    <div>

                      <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                        {student.name}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono">

                        <span className="text-amber-300/90 font-bold">
                          2550 | {suffix}
                        </span>

                        <span className="mx-1">
                          •
                        </span>

                        <span>
                          {student.department}
                        </span>

                      </div>

                    </div>

                  </div>

                  <span className="text-[10px] font-semibold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Demo
                  </span>

                </button>
              );
            })}

          </div>

          {onResetAllData && (
            <div className="mt-3 text-center">

              <button
                type="button"
                onClick={
                  onResetAllData
                }
                className="text-[11px] text-slate-500 hover:text-amber-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1"
              >
                <RotateCcw className="w-3 h-3" />

                <span>
                  Reset All Custom Information
                </span>

              </button>

            </div>
          )}

        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-500 max-w-sm space-y-1">

        <p className="flex items-center justify-center gap-1.5 font-medium text-slate-400">

          <Building2 className="w-3.5 h-3.5 text-amber-400/90" />

          <span>
            Kanuru, Vijayawada, Andhra Pradesh 520007
          </span>

        </p>

        <p className="text-[10px] text-slate-600">
          Fixed Prefix 2550 Enforced • PBKDF2 Password
          Hashing • College-Only Access
        </p>

      </div>

    </div>
  );
};