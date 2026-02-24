import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Play, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/ProgressRing";
import { motion } from "framer-motion";

export default function ContinueLearning({ enrollments, courses }) {
  const activeEnrollments = enrollments
    .filter(e => e.status === "active" && e.progress_percent < 100)
    .sort((a, b) => new Date(b.last_accessed || b.created_date) - new Date(a.last_accessed || a.created_date))
    .slice(0, 3);

  if (activeEnrollments.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Continue Learning</h2>
        <Link to={createPageUrl("Progress")} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          View all <ArrowRight className="w-3 h-3 inline ml-0.5" />
        </Link>
      </div>
      <div className="space-y-2.5">
        {activeEnrollments.map((enrollment, i) => {
          const course = courses.find(c => c.id === enrollment.course_id);
          if (!course) return null;
          return (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={createPageUrl("CourseView") + `?id=${course.id}&lesson=${enrollment.last_lesson_id || ""}`}
                className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-border/50 card-hover group"
              >
                <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate group-hover:text-foreground/80 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.estimated_hours || 0}h
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {enrollment.completed_lessons?.length || 0}/{course.total_lessons || 0} lessons
                    </span>
                  </div>
                </div>
                <ProgressRing progress={enrollment.progress_percent || 0} size={42} strokeWidth={3} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}