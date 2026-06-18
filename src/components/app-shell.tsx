import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Shield,
  LayoutDashboard,
  Lock,
  Unlock,
  PenLine,
  Hash,
  ScrollText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/encrypt", label: "Encrypt", icon: Lock },
  { to: "/decrypt", label: "Decrypt", icon: Unlock },
  { to: "/sign", label: "Sign & Verify", icon: PenLine },
  { to: "/hash", label: "Hash", icon: Hash },
  { to: "/logs", label: "Audit Logs", icon: ScrollText },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function handleSignOut() {
    await logAudit("auth.signout");
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex w-full text-foreground">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass-strong flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-cyber)] glow">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold tracking-tight truncate">SecureCrypt</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg hover:bg-secondary/50"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-30 glass-strong border-r border-border flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="px-5 py-5 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-cyber)] glow">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold tracking-tight truncate">SecureCrypt</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Zero-knowledge crypto
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => {
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

        <div className="border-t border-border p-3 space-y-2">
          <div className="px-2 py-2 rounded-lg bg-secondary/40">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Signed in
            </div>
            <div className="text-xs font-mono truncate">{email || "—"}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-destructive/15 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-background/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
            )}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}