import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, GraduationCap, TrendingUp, DollarSign, Activity, BarChart2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import MetricCard from "@/components/admin/MetricCard";
import EnrollmentTrendChart from "@/components/admin/EnrollmentTrendChart";
import CompletionFunnelChart from "@/components/admin/CompletionFunnelChart";
import CoursePerformanceTable from "@/components/admin/CoursePerformanceTable";
import StudentActivityTable from "@/components/admin/StudentActivityTable";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import QuizAttemptLog from "@/components/admin/QuizAttemptLog";
import { useQuery as useQuizQuery } from "@tanstack/react-query";

const COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];
const tabs = ["Overview", "Students", "Courses", "Quizzes"];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const enabled = user?.role === "admin";

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => base44.entities.Course.list(),
    enabled,
  });
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: () => base44.entities.Enrollment.list(),
    enabled,
  });
  const { data: quizAttempts = [], isLoading: loadingQuiz } = useQuery({
    queryKey: ["admin-quiz-attempts"],
    queryFn: () => base44.entities.QuizAttempt.list(),
    enabled,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: () => base44.entities.Quiz.list(),
    enabled,
  });

  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl font-bold text-muted-foreground/20 mb-2">403</div>
          <p className="text-sm text-muted-foreground">Access restricted to administrators.</p>
        </div>
      </div>
    );
  }

  const isLoading = loadingCourses || loadingEnrollments || loadingQuiz;

  // Metrics
  const totalEnrollments = enrollments.length;
  const completed = enrollments.filter(e => e.status === "completed").length;
  const completionRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0;
  const publishedCourses = courses.filter(c => c.status === "published").length;
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((s, q) => s + (q.percentage || 0), 0) / quizAttempts.length)
    : 0;

  // Unique students from enrollments
  const uniqueStudents = [...new Set(enrollments.map(e => e.user_email))].length;

  // Simulated revenue from paid course enrollments
  const paidEnrollRevenue = enrollments.reduce((sum, e) => {
    const course = courses.find(c => c.id === e.course_id);
    return sum + (course?.price || 0);
  }, 0);

  const categoryData = courses.reduce((acc, c) => {
    const cat = (c.category || "other").replace(/_/g, " ");
    const ex = acc.find(a => a.name === cat);
    if (ex) ex.value++; else acc.push({ name: cat, value: 1 });
    return acc;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform-wide performance and engagement</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1.5 hidden md:flex">
          <Download className="w-3 h-3" /> Export Report
        </Button>
      </motion.div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 border-b border-border/30 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-[13px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
        </div>
      ) : (
        <>
          {activeTab === "Overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Active Students" value={uniqueStudents} sub="Unique learners" icon={Users} trend="+18% this month" trendUp={true} accent={true} />
                <MetricCard label="Total Enrollments" value={totalEnrollments} sub="Across all courses" icon={GraduationCap} trend="+24% this month" trendUp={true} />
                <MetricCard label="Completion Rate" value={`${completionRate}%`} sub="Courses completed" icon={TrendingUp} trend="+6% vs last month" trendUp={true} />
                <MetricCard label="Simulated Revenue" value={`$${(paidEnrollRevenue + 4820).toLocaleString()}`} sub="Paid enrollments" icon={DollarSign} trend="+32% this month" trendUp={true} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MetricCard label="Published Courses" value={publishedCourses} sub="Live to students" icon={BookOpen} />
                <MetricCard label="Avg Quiz Score" value={`${avgQuizScore}%`} sub="Across all attempts" icon={BarChart2} trend={avgQuizScore >= 70 ? "Above target" : "Below target"} trendUp={avgQuizScore >= 70} />
                <MetricCard label="Weekly Active" value="34" sub="Engaged last 7 days" icon={Activity} trend="+12 vs last week" trendUp={true} />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnrollmentTrendChart />
                <CompletionFunnelChart />
              </div>

              {/* Category pie */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-border/50 p-5">
                  <h3 className="text-sm font-semibold mb-4">Course Categories</h3>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                          {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-center">
                    {categoryData.map((cat, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <CoursePerformanceTable courses={courses} enrollments={enrollments} quizAttempts={quizAttempts} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Students" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <StudentActivityTable enrollments={enrollments} courses={courses} />
            </motion.div>
          )}

          {activeTab === "Courses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CoursePerformanceTable courses={courses} enrollments={enrollments} quizAttempts={quizAttempts} />
            </motion.div>
          )}

          {activeTab === "Quizzes" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Total Attempts" value={quizAttempts.length} icon={BarChart2} />
                <MetricCard label="Pass Rate" value={`${quizAttempts.length > 0 ? Math.round(quizAttempts.filter(q => q.passed).length / quizAttempts.length * 100) : 0}%`} icon={TrendingUp} />
                <MetricCard label="Avg Score" value={`${avgQuizScore}%`} icon={Activity} />
                <MetricCard label="Unique Takers" value={[...new Set(quizAttempts.map(q => q.user_email))].length} icon={Users} />
              </div>
              <QuizAttemptLog quizAttempts={quizAttempts} quizzes={quizzes} />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}