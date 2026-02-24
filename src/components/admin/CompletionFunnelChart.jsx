import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const funnelData = [
  { stage: "Enrolled", count: 455, color: "#18181b" },
  { stage: "Started", count: 381, color: "#3f3f46" },
  { stage: "50% Done", count: 248, color: "#71717a" },
  { stage: "75% Done", count: 162, color: "#a1a1aa" },
  { stage: "Completed", count: 98, color: "#d4d4d8" },
];

export default function CompletionFunnelChart() {
  return (
    <div className="bg-white rounded-xl border border-border/50 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Completion Funnel</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Student progression through courses</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis dataKey="stage" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}