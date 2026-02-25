import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Play, BookOpen, Trophy, Users, ArrowRight, Zap, Shield, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  { icon: BookOpen, title: "Structured Curriculum", desc: "Courses organised into programs, modules, and lessons with video, text, and interactive content." },
  { icon: Trophy, title: "Smart Assessments", desc: "Timed quizzes with instant feedback, pass/fail tracking, and score analytics for every learner." },
  { icon: Play, title: "Resume Anywhere", desc: "Progress auto-saves so learners pick up exactly where they left off, on any device." },
  { icon: Shield, title: "Admin Controls", desc: "Role-based access, draft/review/publish workflows, and a full content management system." },
  { icon: Users, title: "Team Analytics", desc: "Cohort dashboards, completion funnels, engagement trends, and per-student activity reports." },
  { icon: Star, title: "Completion Certificates", desc: "Automatically award certificates when learners finish a course and pass all assessments." },
];

const testimonials = [
  { name: "Rachel Nguyen", role: "L&D Director, Meridian Group", quote: "We onboarded 400 employees in 3 weeks. The completion rates speak for themselves — 91% finish rate vs 34% on our old platform." },
  { name: "Tom Ellis", role: "CTO, Stackwell", quote: "The CMS is genuinely powerful. We went from concept to published course in under an hour. Our engineers actually enjoy using it." },
  { name: "Priya Sharma", role: "Head of People, Northvale", quote: "Learner feedback has been overwhelmingly positive. The interface is so clean that nobody needed training to get started." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">LearnStudio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
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
              className="text-xs bg-foreground hover:bg-foreground/90 rounded-lg"
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            >
              Get a demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600 mb-6">
              <Zap className="w-3 h-3 text-zinc-500" /> Enterprise Learning Platform
            </span>
            <h1 className="text-5xl md:text-[64px] font-bold tracking-tight leading-[1.05] mb-6 text-zinc-900">
              Upskill your
              <br />
              <span className="text-zinc-400">entire team.</span>
            </h1>
            <p className="text-base md:text-lg text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
              LearnStudio delivers expert-crafted courses, quizzes, and progress analytics in a beautifully designed platform built for serious organisations.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-zinc-900 hover:bg-zinc-800 text-sm h-11 px-8 rounded-xl"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              >
                Start free trial <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Link to={createPageUrl("Courses")}>
                <Button variant="outline" size="lg" className="text-sm h-11 px-7 rounded-xl border-zinc-200">
                  Browse courses
                </Button>
              </Link>
            </div>
            <p className="text-xs text-zinc-400 mt-4">No credit card required · Setup in minutes</p>
          </motion.div>
        </div>

        {/* Hero image / mock */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85"
              alt="Platform preview"
              className="w-full object-cover aspect-[16/7]"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-14 border-y border-zinc-100 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Learners", value: "12,400+" },
            { label: "Courses Delivered", value: "340+" },
            { label: "Avg Completion Rate", value: "91%" },
            { label: "Customer Rating", value: "4.9 / 5" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <div className="text-2xl md:text-3xl font-bold text-zinc-900">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-900">Everything you need to run world-class training</h2>
            <p className="text-base text-zinc-500 max-w-lg mx-auto">A complete learning stack, beautifully designed and ready to deploy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-zinc-700" />
                </div>
                <h3 className="text-sm font-semibold mb-2 text-zinc-900">{feature.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-zinc-900">Trusted by leading teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
              >
                <p className="text-sm text-zinc-600 leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">{t.name}</p>
                    <p className="text-[10px] text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-zinc-900">Simple, transparent pricing</h2>
          <p className="text-zinc-500 text-sm mb-10">All plans include unlimited courses, quizzes, and analytics. Scale to your team size.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {[
              { plan: "Starter", price: "$199", period: "/mo", seats: "Up to 50 learners", features: ["Unlimited courses", "Quiz builder", "Progress tracking"] },
              { plan: "Growth", price: "$499", period: "/mo", seats: "Up to 250 learners", features: ["Everything in Starter", "Admin analytics", "Custom branding", "Priority support"], highlight: true },
              { plan: "Enterprise", price: "Custom", period: "", seats: "Unlimited learners", features: ["Everything in Growth", "SSO / SAML", "Dedicated CSM", "SLA guarantee"] },
            ].map((tier, i) => (
              <div key={i} className={`rounded-2xl border p-6 ${tier.highlight ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200"}`}>
                <p className={`text-xs font-semibold mb-1 ${tier.highlight ? "text-zinc-400" : "text-zinc-500"}`}>{tier.plan}</p>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className={`text-2xl font-bold ${tier.highlight ? "text-white" : "text-zinc-900"}`}>{tier.price}</span>
                  <span className={`text-xs ${tier.highlight ? "text-zinc-400" : "text-zinc-400"}`}>{tier.period}</span>
                </div>
                <p className={`text-[11px] mb-5 ${tier.highlight ? "text-zinc-400" : "text-zinc-400"}`}>{tier.seats}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-xs ${tier.highlight ? "text-zinc-300" : "text-zinc-600"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${tier.highlight ? "text-zinc-400" : "text-zinc-400"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className={`w-full text-xs rounded-lg ${tier.highlight ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                >
                  {tier.plan === "Enterprise" ? "Contact sales" : "Get started"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-zinc-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Ready to transform your team?</h2>
          <p className="text-sm text-zinc-400 mb-8">Join forward-thinking organisations already using LearnStudio.</p>
          <Button
            size="lg"
            className="bg-white text-zinc-900 hover:bg-zinc-100 text-sm h-11 px-8 rounded-xl"
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
          >
            Start free trial <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-zinc-900">LearnStudio</span>
          </div>
          <span className="text-[10px] text-zinc-400">© 2026 LearnStudio. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}