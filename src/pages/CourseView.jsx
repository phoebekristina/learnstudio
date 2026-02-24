import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, ChevronRight, CheckCircle2, Play, BookOpen, 
  Bookmark, BookmarkCheck, Clock, List, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function CourseView() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  const lessonParam = params.get("lesson");
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(lessonParam || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: course } = useQuery({
    queryKey: ["course-view", courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }).then(r => r[0]),
    enabled: !!courseId,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules-view", courseId],
    queryFn: () => base44.entities.Module.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons-view", courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment-view", courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, user_email: user.email }).then(r => r[0]),
    enabled: !!courseId && !!user?.email,
  });

  const sortedModules = useMemo(() => 
    [...modules].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), [modules]);
  
  const sortedLessons = useMemo(() => 
    [...lessons].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), [lessons]);

  // Auto-select first lesson if none selected
  useEffect(() => {
    if (!currentLessonId && sortedLessons.length > 0) {
      setCurrentLessonId(enrollment?.last_lesson_id || sortedLessons[0].id);
    }
  }, [sortedLessons, enrollment, currentLessonId]);

  const currentLesson = sortedLessons.find(l => l.id === currentLessonId);
  const completedLessons = enrollment?.completed_lessons || [];
  const bookmarkedLessons = enrollment?.bookmarked_lessons || [];
  const isCompleted = completedLessons.includes(currentLessonId);
  const isBookmarked = bookmarkedLessons.includes(currentLessonId);

  const currentIndex = sortedLessons.findIndex(l => l.id === currentLessonId);
  const nextLesson = sortedLessons[currentIndex + 1];
  const prevLesson = sortedLessons[currentIndex - 1];

  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      const newCompleted = [...new Set([...completedLessons, currentLessonId])];
      const progress = Math.round((newCompleted.length / sortedLessons.length) * 100);
      await base44.entities.Enrollment.update(enrollment.id, {
        completed_lessons: newCompleted,
        progress_percent: progress,
        last_lesson_id: currentLessonId,
        last_accessed: new Date().toISOString(),
        status: progress >= 100 ? "completed" : "active",
        completed_date: progress >= 100 ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment-view"] });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const newBookmarks = isBookmarked
        ? bookmarkedLessons.filter(id => id !== currentLessonId)
        : [...bookmarkedLessons, currentLessonId];
      await base44.entities.Enrollment.update(enrollment.id, {
        bookmarked_lessons: newBookmarks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment-view"] });
    },
  });

  const navigateToLesson = (lessonId) => {
    setCurrentLessonId(lessonId);
    setSidebarOpen(false);
    // Update last lesson
    if (enrollment) {
      base44.entities.Enrollment.update(enrollment.id, {
        last_lesson_id: lessonId,
        last_accessed: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[280px] border-r border-border/40 bg-white overflow-y-auto">
        <div className="p-4 border-b border-border/30">
          <Link
            to={createPageUrl("CourseDetail") + `?id=${courseId}`}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <h2 className="text-sm font-semibold truncate">{course?.title}</h2>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div
              className="bg-foreground h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${enrollment?.progress_percent || 0}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{enrollment?.progress_percent || 0}% complete</p>
        </div>
        <nav className="flex-1 py-2">
          {sortedModules.map(mod => {
            const modLessons = sortedLessons.filter(l => l.module_id === mod.id);
            return (
              <div key={mod.id}>
                <div className="px-4 py-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{mod.title}</span>
                </div>
                {modLessons.map(lesson => {
                  const active = lesson.id === currentLessonId;
                  const done = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateToLesson(lesson.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-4 py-2 text-left text-[13px] transition-all",
                        active ? "bg-muted/70 font-medium" : "hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Play className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{lesson.duration_minutes}m</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-30 w-10 h-10 bg-foreground text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <List className="w-4 h-4" />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-[280px] h-full bg-white overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-sm font-semibold">{course?.title}</h2>
                <button onClick={() => setSidebarOpen(false)}><X className="w-4 h-4" /></button>
              </div>
              <nav className="py-2">
                {sortedModules.map(mod => {
                  const modLessons = sortedLessons.filter(l => l.module_id === mod.id);
                  return (
                    <div key={mod.id}>
                      <div className="px-4 py-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{mod.title}</span>
                      </div>
                      {modLessons.map(lesson => {
                        const active = lesson.id === currentLessonId;
                        const done = completedLessons.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigateToLesson(lesson.id)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm",
                              active ? "bg-muted/70 font-medium" : "hover:bg-muted/40 text-muted-foreground"
                            )}
                          >
                            {done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Play className="w-3.5 h-3.5" />}
                            <span className="truncate">{lesson.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {currentLesson ? (
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
            {/* Video */}
            {currentLesson.video_url && (
              <div className="aspect-video rounded-xl bg-black overflow-hidden mb-6">
                <video
                  key={currentLesson.video_url}
                  src={currentLesson.video_url}
                  controls
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Lesson header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">{currentLesson.title}</h1>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{currentLesson.duration_minutes} min</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {enrollment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBookmarkMutation.mutate()}
                    className="w-8 h-8"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-foreground" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Lesson content */}
            {currentLesson.text_content && (
              <div className="prose prose-sm prose-slate max-w-none mb-8">
                <ReactMarkdown>{currentLesson.text_content}</ReactMarkdown>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border/30">
              {prevLesson ? (
                <Button variant="ghost" size="sm" onClick={() => navigateToLesson(prevLesson.id)} className="text-xs">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Previous
                </Button>
              ) : <div />}

              <div className="flex items-center gap-2">
                {!isCompleted && enrollment && (
                  <Button
                    onClick={() => completeLessonMutation.mutate()}
                    disabled={completeLessonMutation.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                  </Button>
                )}
                {isCompleted && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
                {nextLesson && (
                  <Button size="sm" onClick={() => navigateToLesson(nextLesson.id)} className="text-xs">
                    Next <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a lesson to begin
          </div>
        )}
      </main>
    </div>
  );
}