import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, GraduationCap, TrendingUp, Activity } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list(),
    enabled: user?.role === "admin",
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => base44.entities.Course.list(),
    enabled: user?.role === "admin",
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: () => base44.entities.Enrollment.list(),
    enabled: user?.role === "admin",
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["admin-quiz-attempts"],
    queryFn: () => base44.entities.QuizAttempt.list(),
    enabled: user?.role === "admin",
  });

  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-sm">Access restricted to administrators.</p>
      </div>
    );
  }

  const totalStudents = allUsers.filter(u => u.role !== "admin").length;
  const publishedCourses = courses.filter(c => c.status === "published").length;
  const totalEnrollments = enrollments.length;
  const completionRate = enrollments.length > 0
    ? Math.round((enrollments.filter(e => e.status === "completed").length / enrollments.length) * 100)
    : 0;

  // Category distribution
  const categoryData = courses.reduce((acc, c) => {
    const cat = c.category || "other";
    const existing = acc.find(a => a.name === cat);
    if (existing) existing.value++;
    else acc.push({ name: cat.replace("_", " "), value: 1 });
    return acc;
  }, []);

  // Enrollment by course
  const enrollmentByCourseSrc = courses
    .map(c => ({
      name: c.title?.slice(0, 20) || "Untitled",
      count: enrollments.filter(e => e.course_id === c.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const isLoading = loadingUsers;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Platform overview and analytics</p>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[100px] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="Students" value={totalStudents} icon={Users} />
          <StatCard label="Courses" value={publishedCourses} icon={BookOpen} />
          <StatCard label="Enrollments" value={totalEnrollments} icon={GraduationCap} />
          <StatCard label="Completion" value={`${completionRate}%`} icon={TrendingUp} />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Enrollments by Course</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentByCourseSrc} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border/50 p-5">
          <h3 className="text-sm font-semibold mb-4">Course Categories</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {categoryData.map((cat, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent enrollments table */}
      <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30">
          <h3 className="text-sm font-semibold">Recent Enrollments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border/30">
                <th className="text-left font-medium px-5 py-3">Student</th>
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Progress</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.slice(0, 10).map(enrollment => {
                const course = courses.find(c => c.id === enrollment.course_id);
                return (
                  <tr key={enrollment.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium">{enrollment.user_email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{course?.title || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div className="bg-foreground h-1.5 rounded-full" style={{ width: `${enrollment.progress_percent || 0}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{enrollment.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        enrollment.status === "completed" ? "bg-green-50 text-green-700" :
                        enrollment.status === "active" ? "bg-blue-50 text-blue-700" :
                        "bg-gray-50 text-gray-700"
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {enrollments.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-xs">No enrollments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}