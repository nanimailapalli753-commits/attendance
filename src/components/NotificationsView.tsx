import React from "react";
import {
  NotificationItem,
} from "../types";
import {
  Bell,
  AlertTriangle,
  Info,
} from "lucide-react";

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
}) => {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Bell className="w-4 h-4" />
              <span>COLLEGE NOTICE BOARD</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Notifications & Academic Circulars
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Official circulars from the Principal, Dean of Academics,
              and Head of Department.
            </p>
          </div>

          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="self-start sm:self-auto px-4 py-2 rounded-xl
                       bg-slate-800 hover:bg-slate-700
                       text-xs font-semibold text-slate-300
                       border border-slate-700
                       transition-colors cursor-pointer"
          >
            Mark All as Read
          </button>

        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3">

        {notifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />

            <h3 className="text-sm font-semibold text-white">
              No Notifications
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              You don't have any notifications at the moment.
            </p>
          </div>
        ) : (
          notifications.map((notification) => {

            const isAttendance =
              notification.type === "attendance";

            return (
              <div
                key={notification.id}
                className={`p-4 rounded-2xl border transition-all shadow-sm ${
                  notification.read
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-900 border-amber-500/30 ring-1 ring-amber-500/20"
                }`}
              >

                <div className="flex items-start justify-between gap-3">

                  {/* Left */}
                  <div className="flex items-start gap-3">

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isAttendance
                          ? "bg-amber-500/10 text-amber-400"
                          : notification.type === "academic"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {isAttendance ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <h4 className="text-sm font-bold text-white">
                          {notification.title}
                        </h4>

                        {!notification.read && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                            title="Unread"
                          />
                        )}

                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                    </div>

                  </div>

                  {/* Date */}
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {notification.date}
                  </span>

                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
};