import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Simulated weekly enrollment trend data for demo
const trendData = [
  { week: "Jan W1", enrollments: 28 },
  { week: "Jan W2", enrollments: 42 },
  { week: "Jan W3", enrollments: 38 },
  { week: "Jan W4", enrollments: 55 },
  { week: "Feb W1", enrollments: 61 },
  { week: "Feb W2", enrollments: 74 },
  { week: "Feb W3", enrollments: 68 },
  { week: "Feb W4", enrollments: 89 },
];

export default function EnrollmentTrendChart() {
  return (
    <div className="bg-white rounded-xl border border-border/50 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Enrollment Trend</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">New enrollments per week</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18181b" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
            <Area type="monotone" dataKey="enrollments" stroke="#18181b" strokeWidth={2} fill="url(#enrollGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}