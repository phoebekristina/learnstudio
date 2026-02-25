import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Play, BookOpen, Trophy, Users, ArrowRight, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">LearnStudio</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            >
              Sign in
            </Button>
            <Button
              size="sm"
              className="text-xs bg-foreground hover:bg-foreground/90"
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground mb-6">
            <Zap className="w-3 h-3" /> Enterprise Learning Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Upskill your
            <br />
            <span className="text-muted-foreground">entire team.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            LearnStudio delivers expert-crafted courses, quizzes, and progress analytics in a beautiful, modern platform built for serious organisations.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-foreground hover:bg-foreground/90 text-sm h-11 px-7 rounded-xl"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              >
                Start Learning <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Link to={createPageUrl("Courses")}>
                <Button variant="outline" size="lg" className="text-sm h-11 px-7 rounded-xl">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/30 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Learners", value: "2,400+" },
            { label: "Courses", value: "50+" },
            { label: "Completion Rate", value: "94%" },
            { label: "Avg Rating", value: "4.9★" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Everything you need to succeed</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">A thoughtfully designed platform that puts learning first.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Structured Courses", desc: "Organized into programs, modules, and lessons with video, text, and interactive content." },
              { icon: Trophy, title: "Smart Assessments", desc: "Multiple choice, multi-select, and timed quizzes with instant feedback and grading." },
              { icon: Play, title: "Resume Anywhere", desc: "Pick up exactly where you left off with automatic progress tracking and bookmarks." },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security with role-based access control and encrypted data." },
              { icon: Users, title: "Community", desc: "Learn alongside peers with cohort tracking and engagement analytics." },
              { icon: Star, title: "Certificates", desc: "Earn recognition for completing courses and passing assessments." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-border/40 hover:border-border/80 transition-all hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-foreground text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Ready to transform your team?</h2>
          <p className="text-sm text-white/60 mb-8">Join forward-thinking organisations already using LearnStudio.</p>
          <Button
            size="lg"
            className="bg-white text-foreground hover:bg-white/90 text-sm h-11 px-8 rounded-xl"
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
          >
            Get Started Free <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium">LearnStudio</span>
          </div>
          <span className="text-[10px] text-muted-foreground">© 2026 LearnStudio. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}