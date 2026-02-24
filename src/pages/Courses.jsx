import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Clock, Users, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { motion } from "framer-motion";

const categories = [
  { value: "all", label: "All" },
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "data_science", label: "Data Science" },
  { value: "personal_development", label: "Personal Dev" },
];

const difficultyColors = {
  beginner: "bg-green-50 text-green-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

export default function Courses() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses-all"],
    queryFn: () => base44.entities.Course.filter({ status: "published" }),
  });

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || c.category === category;
    const matchDiff = difficulty === "all" || c.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Courses</h1>
        <p className="text-sm text-muted-foreground mb-6">Explore our learning catalog</p>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              category === cat.value
                ? "bg-foreground text-white"
                : "bg-white border border-border/60 text-muted-foreground hover:border-foreground/20"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No courses found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={createPageUrl("CourseDetail") + `?id=${course.id}`}
                className="block bg-white rounded-xl border border-border/50 overflow-hidden card-hover group"
              >
                <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="text-3xl font-bold text-muted-foreground/20">{course.title?.[0]}</span>
                    </div>
                  )}
                  {course.is_free && (
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold bg-foreground text-white px-2 py-0.5 rounded-full">FREE</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${difficultyColors[course.difficulty] || ""}`}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.estimated_hours || 0}h</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolled_count || 0}</span>
                    </div>
                    {!course.is_free && course.price > 0 && (
                      <span className="text-sm font-bold">${course.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}