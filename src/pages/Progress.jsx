import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trophy, Clock, BookOpen, Play, CheckCircle2 } from "lucide-react";
import ProgressRing from "@/components/ui/ProgressRing";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Progress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["my-enrollments", user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses-progress"],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["quiz-attempts", user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const totalHours = Math.round(enrollments.reduce((s, e) => s + (e.total_time_minutes || 0), 0) / 60);
  const avgScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / quizAttempts.length)
    : 0;
  const completedCount = enrollments.filter(e => e.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">My Progress</h1>
        <p className="text-sm text-muted-foreground mb-6">Track your learning journey</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Enrolled" value={enrollments.length} icon={BookOpen} />
        <StatCard label="Completed" value={completedCount} icon={Trophy} />
        <StatCard label="Hours" value={`${totalHours}h`} icon={Clock} />
        <StatCard label="Avg Score" value={`${avgScore}%`} icon={CheckCircle2} />
      </div>

      {/* Course list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[80px] rounded-xl" />)}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Explore and enroll in a course to start learning"
          action={
            <Link to={createPageUrl("Courses")}>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="bg-foreground text-white text-sm font-medium px-5 py-2.5 rounded-lg"
              >
                Browse Courses
              </motion.button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {enrollments.map((enrollment, i) => {
            const course = courses.find(c => c.id === enrollment.course_id);
            if (!course) return null;
            const isComplete = enrollment.status === "completed";
            return (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={createPageUrl(isComplete ? "CourseDetail" : "CourseView") + `?id=${course.id}${enrollment.last_lesson_id ? `&lesson=${enrollment.last_lesson_id}` : ""}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border/50 card-hover group"
                >
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold truncate">{course.title}</h3>
                      {isComplete && <Badge className="bg-green-50 text-green-700 text-[10px] border-0">Completed</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{enrollment.completed_lessons?.length || 0}/{course.total_lessons || 0} lessons</span>
                      <span>{Math.round((enrollment.total_time_minutes || 0) / 60)}h spent</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div
                        className={cn("h-1.5 rounded-full transition-all duration-500", isComplete ? "bg-green-500" : "bg-foreground")}
                        style={{ width: `${enrollment.progress_percent || 0}%` }}
                      />
                    </div>
                  </div>
                  <ProgressRing progress={enrollment.progress_percent || 0} size={44} strokeWidth={3} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}