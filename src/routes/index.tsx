import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Cpu, Radar, Network, Globe, Search, Route as RouteIcon,
  KeyRound, FileText, FileCheck2, ClipboardList, ArrowRight, ShieldCheck, Activity,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Cyber Security Toolkit Pro" },
      { name: "description", content: "All-in-one cybersecurity toolkit dashboard with 10+ professional security tools." },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/system", icon: Cpu, name: "System Information", desc: "Inspect host, CPU, memory, disk & network." },
  { to: "/ping", icon: Radar, name: "Ping Sweep", desc: "Discover live hosts across an IP range." },
  { to: "/ports", icon: Network, name: "Port Scanner", desc: "Scan TCP ports and identify open services." },
  { to: "/dns", icon: Globe, name: "DNS Lookup", desc: "Resolve A, AAAA, MX, NS and CNAME records." },
  { to: "/whois", icon: Search, name: "Whois Lookup", desc: "Domain registrar and expiry intel." },
  { to: "/traceroute", icon: RouteIcon, name: "Traceroute", desc: "Trace network path hop-by-hop." },
  { to: "/password", icon: KeyRound, name: "Password Generator", desc: "Strong customizable password generator." },
  { to: "/log-analyzer", icon: FileText, name: "Log Analyzer", desc: "Detect failed logins & suspicious patterns." },
  { to: "/integrity", icon: FileCheck2, name: "File Integrity Checker", desc: "SHA-256 / MD5 hashing & verification." },
  { to: "/reports", icon: ClipboardList, name: "Report Generation", desc: "Aggregate findings into a report." },
] as const;

function Dashboard() {
  const stats = [
    { label: "Tools available", value: "10", icon: Network },
    { label: "Scans today", value: "0", icon: Radar },
    { label: "Reports", value: "0", icon: ClipboardList },
    { label: "Threats blocked", value: "—", icon: ShieldCheck },
  ];
  return (
    <AppShell title="Security Operations" subtitle="Run network reconnaissance, audit logs, generate credentials and produce reports — all from one console.">
      <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/15">
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm">All systems secure</div>
          <div className="text-xs text-muted-foreground font-mono">
            Toolkit ready · 10 modules online · Real-time monitoring
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-ping opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          OPERATIONAL
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-20 blur-2xl bg-[image:var(--gradient-cyber)]" />
            <s.icon className="h-5 w-5 text-muted-foreground mb-3" />
            <div className="text-3xl font-display font-bold tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-accent" />
        <h2 className="font-display font-semibold">Security Tools</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="glass rounded-2xl p-5 hover:translate-y-[-2px] hover:glow transition-all group flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-cyber)] glow">
                <t.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
            </div>
            <div className="font-display font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground mt-1 flex-1">{t.desc}</div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
              Open tool <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}