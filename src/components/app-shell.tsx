import { Link, useRouterState } from "@tanstack/react-router";
import {
  Shield, LayoutDashboard, Cpu, Radar, Network, Globe, Search, Route as RouteIcon,
  KeyRound, FileText, FileCheck2, ClipboardList, Home, Bell, User, Sun, Moon,
  Menu, X, Settings, Info,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const SIDEBAR = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/system", label: "System Information", icon: Cpu },
  { to: "/ping", label: "Ping Sweep", icon: Radar },
  { to: "/ports", label: "Port Scanner", icon: Network },
  { to: "/dns", label: "DNS Lookup", icon: Globe },
  { to: "/whois", label: "Whois Lookup", icon: Search },
  { to: "/traceroute", label: "Traceroute", icon: RouteIcon },
  { to: "/password", label: "Password Generator", icon: KeyRound },
  { to: "/log-analyzer", label: "Log Analyzer", icon: FileText },
  { to: "/integrity", label: "File Integrity", icon: FileCheck2 },
  { to: "/reports", label: "Report Generation", icon: ClipboardList },
] as const;

const TOPNAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/reports", label: "Reports", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
] as const;

export function AppShell({
  children, title, subtitle,
}: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary/50"
              aria-label="Toggle sidebar"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-cyber)] glow">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <div className="font-display font-bold tracking-tight truncate leading-none">
                  Cyber Security Toolkit <span className="text-gradient">Pro</span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  All-in-one security suite
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {TOPNAV.map((t) => {
              const active = pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLight((v) => !v)}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-[image:var(--gradient-cyber)]">
                <User className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline text-xs font-medium">admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[57px] lg:top-0 left-0 h-[calc(100vh-57px)] lg:h-screen w-64 z-30 glass-strong border-r border-border flex flex-col transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Security Tools
            </div>
            {SIDEBAR.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    active
                      ? "bg-[image:var(--gradient-cyber)] text-primary-foreground glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <div className="px-3 py-2 rounded-lg bg-secondary/40">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-ping opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="text-xs font-mono text-success">All systems operational</span>
              </div>
            </div>
          </div>
        </aside>

        {open && (
          <div
            className="lg:hidden fixed inset-0 top-[57px] z-20 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
              )}
            </header>
            {children}
          </div>

          <footer className="border-t border-border px-6 py-6 mt-12 text-center text-xs text-muted-foreground font-mono">
            Cyber Security Toolkit Pro © 2026 · Built for security professionals
          </footer>
        </main>
      </div>
    </div>
  );
}