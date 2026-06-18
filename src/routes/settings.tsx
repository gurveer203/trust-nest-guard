import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Cyber Security Toolkit Pro" }] }),
  component: Settings,
});

function Settings() {
  const [notif, setNotif] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [autoexport, setAutoexport] = useState(true);

  const items = [
    ["Desktop notifications", "Show toast alerts when scans complete.", notif, setNotif],
    ["Anonymous analytics", "Help improve the toolkit by sharing anonymous usage.", analytics, setAnalytics],
    ["Auto-export to report", "Automatically add completed scans to the report.", autoexport, setAutoexport],
  ] as const;

  return (
    <AppShell title="Settings" subtitle="Customize the toolkit behavior and preferences.">
      <div className="space-y-3 max-w-2xl">
        {items.map(([label, desc, val, set]) => (
          <div key={label} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </div>
            <Switch checked={val} onCheckedChange={set as any} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}