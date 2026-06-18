import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { reportStore, type ReportEntry } from "@/lib/report-store";
import { FileText, Download, Trash2, FileSpreadsheet, FileType2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · Cyber Security Toolkit Pro" }] }),
  component: Reports,
});

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

function toTxt(entries: ReportEntry[]) {
  const lines = [`CYBER SECURITY TOOLKIT PRO — REPORT`, `Generated: ${new Date().toISOString()}`, ""];
  for (const e of entries) {
    lines.push(`### [${e.section.toUpperCase()}] ${e.title}`);
    lines.push(`Timestamp: ${e.timestamp}`);
    lines.push(JSON.stringify(e.data, null, 2));
    lines.push("");
  }
  return lines.join("\n");
}

function toCsv(entries: ReportEntry[]) {
  const rows = [["section", "title", "timestamp", "data"]];
  for (const e of entries) rows.push([e.section, e.title, e.timestamp, JSON.stringify(e.data).replace(/"/g, '""')]);
  return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}

function Reports() {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  useEffect(() => {
    const refresh = () => setEntries(reportStore.list());
    refresh();
    window.addEventListener("cstp:report-updated", refresh);
    return () => window.removeEventListener("cstp:report-updated", refresh);
  }, []);

  function generate() {
    toast.success(`Generated report with ${entries.length} entries`);
  }

  function pdfPrint() {
    const html = `<html><head><title>Cyber Security Toolkit Pro — Report</title>
      <style>body{font-family:system-ui;padding:32px;color:#111}h1{color:#0d4d8a}h3{margin-top:24px;color:#0d4d8a}pre{background:#f4f6f8;padding:12px;border-radius:8px;overflow:auto;font-size:12px}</style>
      </head><body><h1>Cyber Security Toolkit Pro — Security Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      ${entries.map((e) => `<h3>[${e.section.toUpperCase()}] ${e.title}</h3><p><small>${e.timestamp}</small></p><pre>${JSON.stringify(e.data, null, 2).replace(/</g, "&lt;")}</pre>`).join("")}
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast.error("Allow popups to export PDF"); return; }
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => w.print(), 400);
  }

  return (
    <AppShell title="Report Generation" subtitle="Consolidate findings from every module into a downloadable security report.">
      <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap gap-2">
        <Button onClick={generate} className="gap-2"><FileText className="h-4 w-4" />Generate Report</Button>
        <Button variant="outline" onClick={pdfPrint} disabled={!entries.length} className="gap-2"><FileType2 className="h-4 w-4" />Download PDF</Button>
        <Button variant="outline" onClick={() => download("report.csv", toCsv(entries), "text/csv")} disabled={!entries.length} className="gap-2"><FileSpreadsheet className="h-4 w-4" />Download CSV</Button>
        <Button variant="outline" onClick={() => download("report.txt", toTxt(entries), "text/plain")} disabled={!entries.length} className="gap-2"><Download className="h-4 w-4" />Download TXT</Button>
        <Button variant="ghost" onClick={() => { reportStore.clear(); }} disabled={!entries.length} className="gap-2 ml-auto"><Trash2 className="h-4 w-4" />Clear</Button>
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
          No findings yet. Run a tool and click <span className="text-foreground">Export</span> to add it here.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary">{e.section}</span>
                  <span className="font-medium text-sm">{e.title}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{new Date(e.timestamp).toLocaleString()}</span>
              </div>
              <pre className="text-xs font-mono bg-secondary/40 rounded-lg p-3 overflow-auto max-h-48">{JSON.stringify(e.data, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}