import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Phone, Users, BarChart3, LogOut, Menu, X, ShieldAlert, Settings, Layers, Brain } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AgentAssist } from "./agent-assist";
import { OnboardingTour } from "./onboarding-tour";

const NAV_ITEMS = [
  { href: "/", label: "Dialer", icon: Phone },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "CRM Settings", icon: Settings },
  { href: "/operations", label: "Operations 2.0", icon: Layers },
  { href: "/sovereign", label: "Sovereign Agent", icon: Brain },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isLoadingUser, logout, isLoggingOut } = useAuth();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (user && !user.onboardingCompleted && location === "/") {
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user, location]);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      setLocation("/login");
    }
  }, [isLoadingUser, user, setLocation]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070a]">
        <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#07070a] text-foreground font-sans">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 neu-sidebar flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg neu-raised-sm flex items-center justify-center p-1">
              <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]">INSURE</span>
              <span className="text-white">itALL</span>
            </h1>
          </div>
          <button className="lg:hidden text-zinc-500 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" data-tour="sidebar-nav">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            const tourId = href === "/analytics" ? "nav-analytics" : href === "/settings" ? "nav-settings" : undefined;
            return (
              <Link key={href} href={href}>
                <motion.div
                  {...(tourId ? { "data-tour": tourId } : {})}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer group relative overflow-hidden",
                    isActive
                      ? "neu-nav-active text-blue-400"
                      : "neu-nav-item text-zinc-500 hover:text-white"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={18} className={cn("transition-all duration-300", isActive ? "scale-110 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]" : "group-hover:scale-110")} />
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl neu-inset">
            <div className="w-10 h-10 rounded-lg neu-btn-primary flex items-center justify-center text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <ShieldAlert size={12} className="text-blue-400/60" />
                <span className="capitalize">{user.role.toLowerCase()}</span>
              </div>
            </div>
            <motion.button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="p-2 text-zinc-600 hover:text-red-400 rounded-lg transition-colors duration-200"
              title="Logout"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="lg:hidden h-16 flex items-center gap-4 px-4 border-b border-white/[0.04] bg-[#0a0a0e] shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-500 hover:text-white p-2 -ml-2 transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md neu-raised-sm flex items-center justify-center p-0.5">
              <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display font-bold text-base">
              <span className="text-blue-400">INSURE</span>itALL
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </div>
      </main>
      <AgentAssist />
      <OnboardingTour run={showTour} onComplete={() => setShowTour(false)} />
    </div>
  );
}
