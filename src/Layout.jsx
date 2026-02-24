import React, { useState, useEffect } from "react";
import DemoBanner from "@/components/ui/DemoBanner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  LayoutDashboard, BookOpen, Trophy, BarChart3, Settings, 
  ChevronLeft, Menu, X, LogOut, Shield, GraduationCap, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const studentNav = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Courses", page: "Courses", icon: BookOpen },
  { name: "My Progress", page: "Progress", icon: Trophy },
];

const adminNav = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "Courses", page: "Courses", icon: BookOpen },
  { name: "Admin", page: "AdminDashboard", icon: Shield },
  { name: "CMS", page: "CMS", icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Public pages with no sidebar
  const publicPages = ["Landing"];
  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border/50 bg-white transition-all duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}>
        {/* Logo */}
        <div className={cn(
          "flex items-center h-[60px] px-4 border-b border-border/40",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-semibold text-[15px] tracking-tight">Studio</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors",
              collapsed && "hidden"
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5">
          {navItems.map((item) => {
            const active = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all",
                  active 
                    ? "bg-foreground text-white" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={cn(
          "border-t border-border/40 p-3",
          collapsed && "flex justify-center"
        )}>
          {user && !collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                {user.full_name?.[0] || user.email?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.full_name || "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <button 
                onClick={() => base44.auth.logout()} 
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted"
              >
                <LogOut className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
          {collapsed && (
            <button 
              onClick={() => setCollapsed(false)}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold"
            >
              {user?.full_name?.[0] || "U"}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-[56px] bg-white/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4">
        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">Studio</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="w-8 h-8 flex items-center justify-center">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-[260px] h-full bg-white pt-[56px]"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="py-3 px-3 space-y-0.5">
                {navItems.map((item) => {
                  const active = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        active ? "bg-foreground text-white" : "text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-[56px]">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}