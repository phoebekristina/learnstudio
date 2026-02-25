import React, { useState } from "react";
import { X, Info } from "lucide-react";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-zinc-900 text-white text-xs py-2.5 px-4 flex items-center justify-center gap-3 relative flex-shrink-0">
      <Info className="w-3 h-3 text-zinc-400 flex-shrink-0 hidden sm:block" />
      <span className="text-zinc-300">
        <span className="font-semibold text-white">Live Demo</span>
        <span className="text-zinc-500 mx-2">·</span>
        <span className="text-zinc-400">Student:</span>{" "}
        <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono">demo.student@learnstudio.com</code>
        <span className="text-zinc-500 mx-2">·</span>
        <span className="text-zinc-400">Admin:</span>{" "}
        <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono">demo.admin@learnstudio.com</code>
        <span className="text-zinc-500 mx-2">·</span>
        <span className="text-zinc-400">Password:</span>{" "}
        <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono">DemoAccess123</code>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3 text-zinc-400" />
      </button>
    </div>
  );
}