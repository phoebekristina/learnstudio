import React, { useState } from "react";
import { Zap, X } from "lucide-react";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-foreground text-white text-xs py-2 px-4 flex items-center justify-center gap-3 relative">
      <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
      <span className="font-medium">Demo Mode</span>
      <span className="text-white/60">•</span>
      <span className="text-white/70">
        You are viewing a live demo environment.{" "}
        <span className="text-white font-medium">Student:</span>{" "}
        <code className="bg-white/10 px-1 rounded text-[10px]">demo.student@learnstudio.com</code>
        {" "}
        <span className="text-white font-medium ml-2">Admin:</span>{" "}
        <code className="bg-white/10 px-1 rounded text-[10px]">demo.admin@learnstudio.com</code>
        {" "}
        <span className="text-white/50 ml-1">· Password: DemoAccess123</span>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}