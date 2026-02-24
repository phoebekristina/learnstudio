import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ label, value, sub, trend, trendUp, icon: Icon, accent = false }) {
  return (
    <div className={cn(
      "rounded-xl border p-5 flex flex-col gap-3",
      accent ? "bg-foreground text-white border-foreground" : "bg-white border-border/50"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("text-xs font-medium", accent ? "text-white/60" : "text-muted-foreground")}>{label}</div>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accent ? "bg-white/10" : "bg-muted")}>
            <Icon className={cn("w-4 h-4", accent ? "text-white" : "text-muted-foreground")} />
          </div>
        )}
      </div>
      <div>
        <div className={cn("text-2xl font-bold tracking-tight", accent && "text-white")}>{value}</div>
        {sub && <div className={cn("text-xs mt-0.5", accent ? "text-white/50" : "text-muted-foreground")}>{sub}</div>}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          {trendUp
            ? <TrendingUp className="w-3 h-3 text-green-500" />
            : <TrendingDown className="w-3 h-3 text-red-400" />}
          <span className={cn("text-[11px] font-medium", trendUp ? "text-green-600" : "text-red-500")}>{trend}</span>
        </div>
      )}
    </div>
  );
}