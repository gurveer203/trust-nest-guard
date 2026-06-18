import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Unlock, PenLine, Hash, ScrollText, ShieldCheck, Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · SecureCrypt" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [logs, sigs] = await Promise.all([
        supabase.from("audit_logs").select("action, created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("signatures").select("id"),
      ]);
      const items = logs.data ?? [];
      const count = (a: string) => items.filter((i) => i.action === a).length;
      return {
        encryptions: count("file.encrypt"),
        decryptions: count("file.decrypt"),
        hashes: count("hash.generate") + count("hash.compare"),
        signatures: sigs.data?.length ?? 0,
        recent: items.slice(0, 8),
      };
    },
  });

  const cards = [
    { label: "Files encrypted", value: stats?.encryptions ?? 0, icon: Lock, hue: "var(--cyber-violet)" },
    { label: "Files decrypted", value: stats?.decryptions ?? 0, icon: Unlock, hue: "var(--cyber-cyan)" },
    { label: "Signatures", value: stats?.signatures ?? 0, icon: PenLine, hue: "var(--cyber-pink)" },
    { label: "Hashes computed", value: stats?.hashes ?? 0, icon: Hash, hue: "var(--success)" },
  ];

  const actions = [
    { to: "/encrypt", title: "Encrypt a file", desc: "AES-256-GCM with passphrase", icon: Lock },
    { to: "/decrypt", title: "Decrypt a file", desc: "Recover your protected data", icon: Unlock },
    { to: "/sign", title: "Sign & verify", desc: "RSA-2048 digital signatures", icon: PenLine },
    { to: "/hash", title: "Hash generator", desc: "SHA-256 for text or files", icon: Hash },
  ] as const;

  return (
    <AppShell title="Security Console" subtitle="All cryptography runs in your browser. Keys never leave your device.">
      {/* Status banner */}
      <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/15">
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm">All systems secure</div>
          <div className="text-xs text-muted-foreground font-mono">
            Web Crypto API · AES-256-GCM · RSA-PSS-2048 · SHA-256 · PBKDF2-250k
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-ping opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          ONLINE
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5 relative overflow-hidden">
            <div
              className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
              style={{ background: c.hue }}
            />
            <div className="relative">
              <c.icon className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="text-3xl font-display font-bold tracking-tight">{c.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="glass rounded-2xl p-5 hover:translate-y-[-2px] hover:glow transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-cyber)] glow">
                  <a.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
              </div>
              <div className="font-display font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
            </Link>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Recent activity</h2>
          </div>
          {stats?.recent.length ? (
            <ul className="space-y-2">
              {stats.recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground truncate">{r.action}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/logs" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  View full audit log <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          ) : (
            <div className="text-xs text-muted-foreground">
              <ScrollText className="h-8 w-8 mb-2 opacity-40" />
              No activity yet. Try encrypting a file to get started.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}