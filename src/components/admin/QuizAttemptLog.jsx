import React, { useState } from "react";
import { Search } from "lucide-react";

export default function QuizAttemptLog({ quizAttempts, quizzes }) {
  const [search, setSearch] = useState("");

  const getQuizName = (quizId) => {
    const quiz = quizzes?.find(q => q.id === quizId);
    return quiz?.title || "Quiz";
  };

  const filtered = quizAttempts.filter(q =>
    !search || q.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Quiz Attempt Log</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{quizAttempts.length} total attempts</p>
        </div>
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student…"
            className="pl-7 pr-3 py-1.5 text-[11px] border border-border/50 rounded-lg bg-muted/30 focus:outline-none focus:border-foreground/30 w-44"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[11px] text-muted-foreground border-b border-border/20 bg-muted/20">
              <th className="text-left font-medium px-5 py-3">Student</th>
              <th className="text-left font-medium px-5 py-3">Quiz</th>
              <th className="text-right font-medium px-5 py-3">Score</th>
              <th className="text-right font-medium px-5 py-3">Attempt</th>
              <th className="text-right font-medium px-5 py-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-xs">
                  No quiz attempts found
                </td>
              </tr>
            ) : (
              filtered.map((q, i) => (
                <tr key={q.id || i} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                        {q.user_email?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-[11px] max-w-[160px] truncate">{q.user_email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-w-[140px] truncate">{getQuizName(q.quiz_id)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-semibold ${(q.percentage || 0) >= 70 ? "text-foreground" : "text-muted-foreground"}`}>
                      {q.percentage || 0}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-muted-foreground">#{q.attempt_number || 1}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      q.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    }`}>
                      {q.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}