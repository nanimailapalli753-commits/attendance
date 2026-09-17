import React, { useState, useMemo } from "react";
import { AttendanceRecord, Subject } from "../types";
import {
  History,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
  BookOpen,
} from "lucide-react";

interface AttendanceHistoryViewProps {
  attendanceHistory: AttendanceRecord[];
  subjects: Subject[];
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  attendanceHistory,
  subjects,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredRecords = useMemo(() => {
    return attendanceHistory.filter((rec) => {
      const matchesSearch =
        rec.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.date.includes(searchQuery) ||
        rec.period.toString().includes(searchQuery);

      const matchesSubject =
        selectedSubject === "ALL" || rec.subjectId === selectedSubject || rec.subjectName === selectedSubject;

      const matchesStatus =
        selectedStatus === "ALL" || rec.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [attendanceHistory, searchQuery, selectedSubject, selectedStatus]);

  const presentTotal = filteredRecords.filter((r) => r.status === "PRESENT").length;
  const absentTotal = filteredRecords.filter((r) => r.status === "ABSENT").length;

  const handleExportCSV = () => {
    const header = "Date,Period,Time,Subject,Status,RecordedAt\n";
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.date}",${r.period},"${r.time}","${r.subjectName}","${r.status}","${r.recordedAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pvp_attendance_history_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <History className="w-4 h-4" />
              <span>OFFICIAL ATTENDANCE LOG</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Attendance History
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Complete chronological audit trail of all period attendances recorded at PVP Siddhartha Engineering College.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Total Logged
            </span>
            <p className="text-xl font-black font-mono text-white mt-0.5">
              {filteredRecords.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Periods Present
            </span>
            <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
              {presentTotal}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Periods Absent
            </span>
            <p className="text-xl font-black font-mono text-rose-400 mt-0.5">
              {absentTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by date, subject, period..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present Only</option>
            <option value="ABSENT">Absent Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4 sm:px-6">Subject</th>
                <th className="py-3.5 px-4 sm:px-6">Period</th>
                <th className="py-3.5 px-4 sm:px-6">Time</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">No attendance records found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your search or date filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isPresent = record.status === "PRESENT";
                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-slate-300">
                        {record.date}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-white">
                        {record.subjectName}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="w-6 h-6 rounded bg-slate-800 text-amber-400 font-mono font-bold inline-flex items-center justify-center">
                          {record.period}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-400">
                        {record.time || "Regular Slot"}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPresent
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>Absent</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-[11px] text-slate-400">
                        {new Date(record.recordedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
