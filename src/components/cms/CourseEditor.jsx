import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save, Upload } from "lucide-react";
import { toast } from "sonner";

const categories = ["development", "design", "business", "marketing", "data_science", "personal_development"];
const difficulties = ["beginner", "intermediate", "advanced"];
const statuses = ["draft", "review", "published", "archived"];

export default function CourseEditor({ course, onClose }) {
  const queryClient = useQueryClient();
  const isNew = !course;
  const [form, setForm] = useState({
    title: course?.title || "",
    description: course?.description || "",
    long_description: course?.long_description || "",
    category: course?.category || "development",
    difficulty: course?.difficulty || "beginner",
    status: course?.status || "draft",
    price: course?.price || 0,
    is_free: course?.is_free ?? true,
    estimated_hours: course?.estimated_hours || 0,
    instructor_name: course?.instructor_name || "",
    thumbnail_url: course?.thumbnail_url || "",
    tags: course?.tags || [],
  });
  const [tagInput, setTagInput] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isNew) {
        return base44.entities.Course.create(form);
      } else {
        return base44.entities.Course.update(course.id, form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-courses"] });
      toast.success(isNew ? "Course created" : "Course updated");
      onClose();
    },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("thumbnail_url", file_url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-[5vh] overflow-y-auto pb-12">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 border border-border/50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <h2 className="text-base font-semibold">{isNew ? "New Course" : "Edit Course"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Course title" />
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Short Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief overview" rows={2} />
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Full Description</Label>
            <Textarea value={form.long_description} onChange={(e) => set("long_description", e.target.value)} placeholder="Detailed course info" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => set("difficulty", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Estimated Hours</Label>
              <Input type="number" value={form.estimated_hours} onChange={(e) => set("estimated_hours", Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_free} onCheckedChange={(v) => set("is_free", v)} />
              <Label className="text-xs">Free course</Label>
            </div>
            {!form.is_free && (
              <div className="flex-1">
                <Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} placeholder="Price" />
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Instructor Name</Label>
            <Input value={form.instructor_name} onChange={(e) => set("instructor_name", e.target.value)} />
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Thumbnail</Label>
            <div className="flex items-center gap-3">
              {form.thumbnail_url && (
                <img src={form.thumbnail_url} alt="" className="w-16 h-10 rounded-md object-cover" />
              )}
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg cursor-pointer text-xs font-medium hover:bg-muted/80">
                <Upload className="w-3 h-3" /> Upload
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Tags</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {form.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                  {tag}
                  <button onClick={() => set("tags", form.tags.filter((_, j) => j !== i))}><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="flex-1" />
              <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border/30">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}