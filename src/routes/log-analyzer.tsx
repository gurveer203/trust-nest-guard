import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Play, Trash2, AlertTriangle, ShieldAlert, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/log-analyzer")({
  head: () => ({ meta: [{ title: "Log Analyzer · Cyber Security Toolkit Pro" }] }),
  component: LogAnalyzer,
});

type Analysis = {
  failedLogins: number;
  suspicious: number;
  errors: number;
  warnings: number;
  totalLines: number;
  topIps: { ip: string; count: number }[];
};

function analyze(text: string): Analysis {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
  const failedRe = /failed|failure|invalid (?:user|password)|authentication failure/i;
  const errorRe = /\berror\b/i;
  const warnRe = /\bwarn(ing)?\b/i;
  const suspRe = /sql injection|xss|brute|exploit|attack|unauthorized|forbidden|malware/i;
  const ipCounts: Record<string, number> = {};
  let failedLogins = 0, suspicious = 0, errors = 0, warnings = 0;
  for (const line of lines) {
    if (failedRe.test(line)) failedLogins++;
    if (suspRe.test(line)) suspicious++;
    if (errorRe.test(line)) errors++;
    if (warnRe.test(line)) warnings++;
    const m = line.match(ipRegex);
    if (m) ipCounts[m[0]] = (ipCounts[m[0]] ?? 0) + 1;
  }
  const topIps = Object.entries(ipCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([ip, count]) => ({ ip, count }));
  return { failedLogins, suspicious, errors, warnings, totalLines: lines.length, topIps };
}

function LogAnalyzer() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(f: File) {
    setText(await f.text());
    toast.success(`Loaded ${f.name}`);
  }

  function run() {
    if (!text.trim()) { toast.error("Upload a log file first"); return; }
    const a = analyze(text);
    setAnalysis(a);
    reportStore.add({ section: "logs", title: "Log analysis", data: a });
  }

  const stats = analysis ? [
    { label: "Failed Logins", value: analysis.failedLogins, icon: ShieldAlert, hue: "text-destructive" },
    { label: "Suspicious", value: analysis.suspicious, icon: AlertTriangle, hue: "text-warning" },
    { label: "Errors", value: analysis.errors, icon: XCircle, hue: "text-destructive" },
    { label: "Total Lines", value: analysis.totalLines, icon: Upload, hue: "text-accent" },
  ] : [];

  return (
    <AppShell title="Log Analyzer" subtitle="Upload a log file to detect failed logins, suspicious activity and errors.">
      <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap gap-2 items-center">
        <input ref={fileRef} type="file" accept=".log,.txt,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        <Button onClick={() => fileRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" />Upload Log</Button>
        <Button variant="outline" onClick={run} className="gap-2"><Play className="h-4 w-4" />Analyze</Button>
        <Button variant="ghost" onClick={() => { setText(""); setAnalysis(null); }} className="gap-2"><Trash2 className="h-4 w-4" />Clear</Button>
        <span className="text-xs text-muted-foreground ml-auto font-mono">{text ? `${text.length.toLocaleString()} chars loaded` : "No file loaded"}</span>
      </div>

      {analysis && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <s.icon className={`h-5 w-5 mb-3 ${s.hue}`} />
                <div className="text-3xl font-display font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold mb-4">Top Source IPs</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.topIps}>
                  <XAxis dataKey="ip" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}