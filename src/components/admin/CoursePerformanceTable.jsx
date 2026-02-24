import React from "react";

export default function CoursePerformanceTable({ courses, enrollments, quizAttempts }) {
  const rows = courses.map(c => {
    const courseEnrollments = enrollments.filter(e => e.course_id === c.id);
    const completed = courseEnrollments.filter(e => e.status === "completed").length;
    const total = courseEnrollments.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const courseQuizzes = quizAttempts.filter(q => q.course_id === c.id);
    const avgScore = courseQuizzes.length > 0
      ? Math.round(courseQuizzes.reduce((s, q) => s + (q.percentage || 0), 0) / courseQuizzes.length)
      : null;

    return { ...c, total, completed, rate, avgScore };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Course Performance</h3>
        <span className="text-[10px] text-muted-foreground">{rows.length} courses</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[11px] text-muted-foreground border-b border-border/20">
              <th className="text-left font-medium px-5 py-3">Course</th>
              <th className="text-left font-medium px-5 py-3">Category</th>
              <th className="text-right font-medium px-5 py-3">Enrolled</th>
              <th className="text-right font-medium px-5 py-3">Completed</th>
              <th className="text-right font-medium px-5 py-3">Rate</th>
              <th className="text-right font-medium px-5 py-3">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium text-[12px]">{row.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{row.instructor_name}</div>
                </td>
                <td className="px-5 py-3 text-muted-foreground capitalize">{row.category?.replace("_", " ")}</td>
                <td className="px-5 py-3 text-right font-medium">{row.total}</td>
                <td className="px-5 py-3 text-right">{row.completed}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`font-semibold ${row.rate >= 70 ? "text-green-600" : row.rate >= 40 ? "text-yellow-600" : "text-red-500"}`}>
                    {row.rate}%
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {avgScore !== null ? (
                    <span className={row.avgScore >= 70 ? "text-green-600 font-semibold" : "text-muted-foreground"}>
                      {row.avgScore}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}