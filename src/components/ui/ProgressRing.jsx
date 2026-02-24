import React from "react";
import { cn } from "@/lib/utils";

export default function ProgressRing({ 
  progress = 0, 
  size = 48, 
  strokeWidth = 3, 
  className,
  showLabel = true 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(240 4.8% 95.9%)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(240 5.9% 10%)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[10px] font-semibold tabular-nums">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}