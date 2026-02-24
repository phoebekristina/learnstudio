import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Plus, Trash2, GripVertical, ChevronDown, ChevronRight, 
  Video, FileText, Upload, X, Save 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function ModuleLessonManager({ courseId }) {
  const queryClient = useQueryClient();
  const [expandedModule, setExpandedModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showNewModule, setShowNewModule] = useState(false);

  const { data: modules = [] } = useQuery({
    queryKey: ["cms-modules", courseId],
    queryFn: () => base44.entities.Module.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["cms-lessons", courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const sortedModules = [...modules].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const createModuleMutation = useMutation({
    mutationFn: () => base44.entities.Module.create({
      title: newModuleTitle,
      course_id: courseId,
      sort_order: modules.length,
      status: "draft",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-modules", courseId] });
      setNewModuleTitle("");
      setShowNewModule(false);
      toast.success("Module created");
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id) => base44.entities.Module.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-modules", courseId] });
      toast.success("Module deleted");
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Modules & Lessons</h3>
        <Button size="sm" variant="outline" onClick={() => setShowNewModule(true)} className="text-xs h-8">
          <Plus className="w-3 h-3 mr-1" /> Module
        </Button>
      </div>

      {showNewModule && (
        <div className="flex gap-2 items-center p-3 bg-muted/50 rounded-lg">
          <Input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Module title"
            className="flex-1 h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && createModuleMutation.mutate()}
          />
          <Button size="sm" className="h-8 text-xs" onClick={() => createModuleMutation.mutate()} disabled={!newModuleTitle}>Add</Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowNewModule(false)}>Cancel</Button>
        </div>
      )}

      {sortedModules.map((mod) => {
        const modLessons = lessons.filter(l => l.module_id === mod.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const expanded = expandedModule === mod.id;

        return (
          <div key={mod.id} className="bg-white rounded-xl border border-border/50">
            <div className="flex items-center gap-2 p-3">
              <button onClick={() => setExpandedModule(expanded ? null : mod.id)}>
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <div className="flex-1">
                <span className="text-sm font-medium">{mod.title}</span>
                <span className="text-xs text-muted-foreground ml-2">{modLessons.length} lessons</span>
              </div>
              <Button
                variant="ghost" size="icon" className="w-6 h-6"
                onClick={() => deleteModuleMutation.mutate(mod.id)}
              >
                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
              </Button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border/30 overflow-hidden"
                >
                  <div className="p-3 space-y-1.5">
                    {modLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
                        onClick={() => setEditingLesson(lesson)}
                      >
                        {lesson.content_type === "video" ? (
                          <Video className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium flex-1">{lesson.title}</span>
                        <span className="text-[10px] text-muted-foreground">{lesson.duration_minutes}m</span>
                      </div>
                    ))}
                    <AddLessonInline courseId={courseId} moduleId={mod.id} sortOrder={modLessons.length} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Lesson editor modal */}
      {editingLesson && (
        <LessonEditorModal lesson={editingLesson} onClose={() => setEditingLesson(null)} courseId={courseId} />
      )}
    </div>
  );
}

function AddLessonInline({ courseId, moduleId, sortOrder }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Lesson.create({
      title,
      course_id: courseId,
      module_id: moduleId,
      sort_order: sortOrder,
      content_type: "mixed",
      status: "draft",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-lessons", courseId] });
      setTitle("");
      setShow(false);
      toast.success("Lesson created");
    },
  });

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <Plus className="w-3 h-3" /> Add lesson
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center px-2.5 py-1.5">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" className="flex-1 h-7 text-xs" onKeyDown={(e) => e.key === "Enter" && createMutation.mutate()} />
      <Button size="sm" className="h-7 text-[10px]" onClick={() => createMutation.mutate()} disabled={!title}>Add</Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setShow(false)}>Cancel</Button>
    </div>
  );
}

function LessonEditorModal({ lesson, onClose, courseId }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: lesson.title || "",
    description: lesson.description || "",
    content_type: lesson.content_type || "mixed",
    video_url: lesson.video_url || "",
    text_content: lesson.text_content || "",
    duration_minutes: lesson.duration_minutes || 0,
    status: lesson.status || "draft",
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Lesson.update(lesson.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-lessons", courseId] });
      toast.success("Lesson updated");
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Lesson.delete(lesson.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-lessons", courseId] });
      toast.success("Lesson deleted");
      onClose();
    },
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("video_url", file_url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-[5vh] overflow-y-auto pb-12">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 border border-border/50">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
          <h2 className="text-sm font-semibold">Edit Lesson</h2>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <Label className="text-xs mb-1 block">Title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Type</Label>
            <Select value={form.content_type} onValueChange={(v) => set("content_type", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(form.content_type === "video" || form.content_type === "mixed") && (
            <div>
              <Label className="text-xs mb-1 block">Video</Label>
              <div className="flex items-center gap-2">
                <Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="Video URL" className="flex-1 h-9 text-xs" />
                <label className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg cursor-pointer text-xs hover:bg-muted/80">
                  <Upload className="w-3 h-3" /> Upload
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}
          {(form.content_type === "text" || form.content_type === "mixed") && (
            <div>
              <Label className="text-xs mb-1 block">Content (Markdown)</Label>
              <Textarea value={form.text_content} onChange={(e) => set("text_content", e.target.value)} rows={6} className="text-xs font-mono" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Duration (min)</Label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => set("duration_minutes", Number(e.target.value))} className="h-9" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-between px-5 py-3 border-t border-border/30">
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 text-xs" onClick={() => deleteMutation.mutate()}>
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="text-xs">
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}