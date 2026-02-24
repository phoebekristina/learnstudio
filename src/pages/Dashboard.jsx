import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Trophy, Clock, Flame } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import RecommendedCourses from "@/components/dashboard/RecommendedCourses";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => base44.entities.Course.filter({ status: "published" }),
  });

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["enrollments", user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const isLoading = loadingCourses || loadingEnrollments;

  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter(e => e.status === "completed").length,
    totalHours: Math.round(enrollments.reduce((sum, e) => sum + (e.total_time_minutes || 0), 0) / 60),
    streak: enrollments.filter(e => {
      const last = new Date(e.last_accessed);
      const now = new Date();
      return (now - last) / (1000 * 60 * 60 * 24) < 7;
    }).length,
  };

  const enrolledCourseIds = enrollments.map(e => e.course_id);
  const greeting = getGreeting();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's your learning overview
        </p>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          <StatCard label="Enrolled" value={stats.enrolled} icon={BookOpen} />
          <StatCard label="Completed" value={stats.completed} icon={Trophy} />
          <StatCard label="Hours Spent" value={`${stats.totalHours}h`} icon={Clock} />
          <StatCard label="Active Courses" value={stats.streak} icon={Flame} />
        </motion.div>
      )}

      {/* Main content */}
      <div className="space-y-8">
        {!isLoading && (
          <>
            <ContinueLearning enrollments={enrollments} courses={courses} />
            <RecommendedCourses courses={courses} enrolledCourseIds={enrolledCourseIds} />
          </>
        )}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-[100px] rounded-xl" />
            <Skeleton className="h-[100px] rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}