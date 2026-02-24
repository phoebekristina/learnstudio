import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/EmptyState";
import CourseEditor from "@/components/cms/CourseEditor";
import ModuleLessonManager from "@/components/cms/ModuleLessonManager";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  review: "bg-yellow-50 text-yellow-700",
  published: "bg-green-50 text-green-700",
  archived: "bg-red-50 text-red-700",
};

export default function CMS() {
  const [user, setUser] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["cms-courses"],
    queryFn: () => base44.entities.Course.list("-created_date"),
    enabled: user?.role === "admin",
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-courses"] });
      toast.success("Course deleted");
    },
  });

  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-sm">Access restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Content Manager</h1>
          <p className="text-sm text-muted-foreground">Create and manage courses, modules, and lessons</p>
        </div>
        <Button onClick={() => { setEditingCourse(null); setShowEditor(true); }} className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Course
        </Button>
      </motion.div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Course list */}
        <div className="lg:w-1/2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[72px] rounded-xl" />)}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to get started" />
          ) : (
            <div className="space-y-2">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedCourseId(selectedCourseId === course.id ? null : course.id)}
                  className={`flex items-center gap-3 p-3.5 bg-white rounded-xl border cursor-pointer transition-all ${
                    selectedCourseId === course.id ? "border-foreground/30 shadow-sm" : "border-border/50 hover:border-border"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-lg font-bold">
                        {course.title?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-[9px] px-1.5 py-0 border-0 ${statusColors[course.status]}`}>{course.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{course.total_lessons || 0} lessons</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); setEditingCourse(course); setShowEditor(true); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(course.id); }}>
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Module/Lesson manager */}
        <div className="lg:w-1/2">
          {selectedCourseId ? (
            <ModuleLessonManager courseId={selectedCourseId} />
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-muted/30 rounded-xl border border-dashed border-border/50">
              <p className="text-sm text-muted-foreground">Select a course to manage its content</p>
            </div>
          )}
        </div>
      </div>

      {/* Course editor modal */}
      {showEditor && (
        <CourseEditor course={editingCourse} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}