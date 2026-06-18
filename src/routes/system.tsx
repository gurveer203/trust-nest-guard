import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Cpu, HardDrive, MemoryStick, Globe, Server, Terminal, Network } from "lucide-react";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/system")({
  head: () => ({ meta: [{ title: "System Information · Cyber Security Toolkit Pro" }] }),
  component: SystemInfo,
});

type Info = Record<string, string>;

function gather(): Info {
  if (typeof navigator === "undefined") return {};
  const ua = navigator.userAgent;
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || "Unknown";
  const cpu = `${navigator.hardwareConcurrency ?? "?"} logical cores`;
  const mem = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB (approx)` : "Unavailable in browser";
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    Hostname: typeof location !== "undefined" ? location.hostname : "—",
    "Operating System": platform,
    "Kernel / User-Agent": ua,
    "CPU Information": cpu,
    "Memory (estimated)": mem,
    "Disk Usage": "Browser sandbox — N/A",
    "IP Address": "Resolving…",
    "Connection": (navigator as any).connection?.effectiveType ?? "unknown",
    "Language": lang,
    "Timezone": tz,
    "Online": navigator.onLine ? "Yes" : "No",
  };
}

function SystemInfo() {
  const [info, setInfo] = useState<Info>({});

  async function refresh() {
    const base = gather();
    setInfo(base);
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      const j = await r.json();
      setInfo((cur) => ({ ...cur, "IP Address": j.ip }));
    } catch {
      setInfo((cur) => ({ ...cur, "IP Address": "Unable to fetch" }));
    }
  }

  useEffect(() => { refresh(); }, []);

  function exportReport() {
    reportStore.add({ section: "system", title: "System Information", data: info });
    toast.success("Added to report");
  }

  const icons: Record<string, any> = {
    Hostname: Server, "Operating System": Terminal, "Kernel / User-Agent": Terminal,
    "CPU Information": Cpu, "Memory (estimated)": MemoryStick, "Disk Usage": HardDrive,
    "IP Address": Globe, "Connection": Network,
  };

  return (
    <AppShell title="System Information" subtitle="Browser-accessible host metadata and network identity.">
      <div className="flex gap-2 mb-6">
        <Button onClick={refresh} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
        <Button variant="outline" onClick={exportReport} className="gap-2"><Download className="h-4 w-4" />Export Report</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(info).map(([k, v]) => {
          const Icon = icons[k] ?? Server;
          return (
            <div key={k} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                <Icon className="h-3.5 w-3.5" /> {k}
              </div>
              <div className="font-mono text-sm break-all">{v}</div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}