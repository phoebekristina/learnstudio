import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Play, Clock, Users, BookOpen, CheckCircle2, Lock, 
  ArrowLeft, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function CourseDetail() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }).then(r => r[0]),
    enabled: !!courseId,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: () => base44.entities.Module.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, user_email: user.email }).then(r => r[0]),
    enabled: !!courseId && !!user?.email,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const newEnrollment = await base44.entities.Enrollment.create({
        user_email: user.email,
        course_id: courseId,
        status: "active",
        progress_percent: 0,
        completed_lessons: [],
        bookmarked_lessons: [],
      });
      // Update enrolled count
      await base44.entities.Course.update(courseId, {
        enrolled_count: (course.enrolled_count || 0) + 1,
      });
      return newEnrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });

  const sortedModules = [...modules].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 text-center">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const completedLessons = enrollment?.completed_lessons || [];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Back */}
      <Link
        to={createPageUrl("Courses")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to courses
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-2/5">
            <div className="aspect-[16/10] rounded-xl bg-muted overflow-hidden">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <BookOpen className="w-12 h-12 text-muted-foreground/20" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px]">{course.difficulty}</Badge>
              <span className="text-xs text-muted-foreground capitalize">{course.category?.replace("_", " ")}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">{course.title}</h1>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.estimated_hours || 0} hours</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.total_lessons || 0} lessons</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolled_count || 0} students</span>
            </div>
            {course.instructor_name && (
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                  {course.instructor_name[0]}
                </div>
                <span className="text-sm font-medium">{course.instructor_name}</span>
              </div>
            )}
            {isEnrolled ? (
              <Link to={createPageUrl("CourseView") + `?id=${courseId}&lesson=${enrollment.last_lesson_id || ""}`}>
                <Button className="bg-foreground hover:bg-foreground/90 text-white rounded-lg h-10 px-6 text-sm">
                  <Play className="w-4 h-4 mr-2" /> Continue Learning
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                className="bg-foreground hover:bg-foreground/90 text-white rounded-lg h-10 px-6 text-sm"
              >
                {course.is_free || !course.price ? "Enroll for Free" : `Enroll — $${course.price}`}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Curriculum */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Curriculum</h2>
        <div className="space-y-2">
          {sortedModules.map((mod) => {
            const moduleLessons = lessons
              .filter(l => l.module_id === mod.id)
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            const expanded = expandedModules[mod.id];

            return (
              <div key={mod.id} className="bg-white rounded-xl border border-border/50 overflow-hidden">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{moduleLessons.length} lessons</p>
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/30"
                    >
                      {moduleLessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        return (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : isEnrolled ? (
                              <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              {isEnrolled ? (
                                <Link
                                  to={createPageUrl("CourseView") + `?id=${courseId}&lesson=${lesson.id}`}
                                  className="text-sm font-medium hover:underline"
                                >
                                  {lesson.title}
                                </Link>
                              ) : (
                                <span className="text-sm font-medium text-muted-foreground">{lesson.title}</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{lesson.duration_minutes || 0}m</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Long description */}
      {course.long_description && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">About this course</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{course.long_description}</p>
        </div>
      )}
    </div>
  );
}