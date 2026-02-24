import React, { useState } from "react";
import { Search } from "lucide-react";

export default function StudentActivityTable({ enrollments, courses }) {
  const [search, setSearch] = useState("");

  // Aggregate per user
  const userMap = {};
  enrollments.forEach(e => {
    if (!userMap[e.user_email]) {
      userMap[e.user_email] = { email: e.user_email, enrollments: 0, completed: 0, totalMinutes: 0, lastActive: null };
    }
    userMap[e.user_email].enrollments++;
    if (e.status === "completed") userMap[e.user_email].completed++;
    userMap[e.user_email].totalMinutes += e.total_time_minutes || 0;
    const last = e.last_accessed ? new Date(e.last_accessed) : null;
    if (last && (!userMap[e.user_email].lastActive || last > userMap[e.user_email].lastActive)) {
      userMap[e.user_email].lastActive = last;
    }
  });

  const rows = Object.values(userMap)
    .filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

  const formatDate = (d) => d ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d) : "—";
  const formatHours = (m) => m >= 60 ? `${Math.round(m / 60)}h` : `${m}m`;

  return (
    <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">Student Activity</h3>
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            className="pl-7 pr-3 py-1.5 text-[11px] border border-border/50 rounded-lg bg-muted/30 focus:outline-none focus:border-foreground/30 w-48"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[11px] text-muted-foreground border-b border-border/20">
              <th className="text-left font-medium px-5 py-3">Student</th>
              <th className="text-right font-medium px-5 py-3">Enrolled</th>
              <th className="text-right font-medium px-5 py-3">Completed</th>
              <th className="text-right font-medium px-5 py-3">Time</th>
              <th className="text-right font-medium px-5 py-3">Last Active</th>
              <th className="text-right font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const daysSince = row.lastActive ? Math.floor((new Date() - row.lastActive) / 86400000) : 999;
              const activityStatus = daysSince <= 2 ? "active" : daysSince <= 7 ? "recent" : "inactive";
              return (
                <tr key={row.email} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                        {row.email[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-[12px]">{row.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">{row.enrollments}</td>
                  <td className="px-5 py-3 text-right">{row.completed}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{formatHours(row.totalMinutes)}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{formatDate(row.lastActive)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      activityStatus === "active" ? "bg-green-50 text-green-700" :
                      activityStatus === "recent" ? "bg-blue-50 text-blue-700" :
                      "bg-gray-50 text-gray-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activityStatus === "active" ? "bg-green-500" :
                        activityStatus === "recent" ? "bg-blue-500" : "bg-gray-300"
                      }`} />
                      {activityStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}