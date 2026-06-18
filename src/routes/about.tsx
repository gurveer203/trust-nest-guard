import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Shield, Heart, Code2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · Cyber Security Toolkit Pro" }] }),
  component: About,
});

function About() {
  return (
    <AppShell title="About Cyber Security Toolkit Pro" subtitle="Version 1.0 · 2026">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[image:var(--gradient-cyber)] glow">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display font-bold text-lg">Cyber Security Toolkit Pro</div>
              <div className="text-xs text-muted-foreground font-mono">All-in-one security suite</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A modern, browser-based cybersecurity dashboard bringing together the essential
            reconnaissance, auditing, and reporting tools every security professional needs.
            Designed as a learning platform — network operations such as ping, port scanning,
            traceroute and whois are simulated client-side because raw socket access is not
            available in browsers. Cryptography (SHA-256, MD5, password generation) and log
            analysis run natively on real data via the Web Crypto API.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg bg-secondary/40 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Stack</div>
              <div className="text-sm font-mono">React · TypeScript · Tailwind v4 · shadcn/ui · recharts</div>
            </div>
            <div className="rounded-lg bg-secondary/40 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">License</div>
              <div className="text-sm font-mono">For academic & portfolio use</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <Code2 className="h-5 w-5 text-accent mb-2" />
            <div className="font-display font-semibold">10+ Modules</div>
            <div className="text-xs text-muted-foreground mt-1">Every tool you need in one console.</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <Heart className="h-5 w-5 text-destructive mb-2" />
            <div className="font-display font-semibold">Built for analysts</div>
            <div className="text-xs text-muted-foreground mt-1">Modern UX inspired by SOC dashboards.</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}