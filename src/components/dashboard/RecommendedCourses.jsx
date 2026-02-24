import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Users, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const difficultyColors = {
  beginner: "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-red-50 text-red-700 border-red-200",
};

export default function RecommendedCourses({ courses, enrolledCourseIds }) {
  const available = courses
    .filter(c => c.status === "published" && !enrolledCourseIds.includes(c.id))
    .slice(0, 4);

  if (available.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Explore Courses</h2>
        <Link to={createPageUrl("Courses")} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          Browse all <ArrowRight className="w-3 h-3 inline ml-0.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {available.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={createPageUrl("CourseDetail") + `?id=${course.id}`}
              className="block bg-white rounded-xl border border-border/50 overflow-hidden card-hover group"
            >
              <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                    <span className="text-2xl font-bold text-muted-foreground/30">{course.title?.[0]}</span>
                  </div>
                )}
                {course.is_free && (
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold bg-foreground text-white px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${difficultyColors[course.difficulty] || ""}`}>
                    {course.difficulty}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground capitalize">{course.category?.replace("_", " ")}</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-2">{course.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.estimated_hours || 0}h</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolled_count || 0}</span>
                </div>
                {!course.is_free && course.price > 0 && (
                  <div className="mt-3 text-sm font-bold">${course.price}</div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}