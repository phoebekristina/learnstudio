import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "bg-white rounded-xl border border-border/60 p-5 transition-all hover:shadow-sm",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {trend && (
        <div className={cn(
          "text-xs font-medium mt-2",
          trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {trend > 0 ? "+" : ""}{trend}% from last month
        </div>
      )}
    </div>
  );
}