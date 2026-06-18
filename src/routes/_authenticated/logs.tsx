import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/logs")({
  head: () => ({ meta: [{ title: "Audit Logs · SecureCrypt" }] }),
  component: LogsPage,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "file", label: "Files" },
  { key: "signature", label: "Signatures" },
  { key: "hash", label: "Hashes" },
  { key: "auth", label: "Auth" },
] as const;

function LogsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");

  const { data: logs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "all" && !l.action.startsWith(filter)) return false;
      if (q && !l.action.toLowerCase().includes(q.toLowerCase()) && !(l.resource ?? "").toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [logs, filter, q]);

  function exportCsv() {
    const header = "timestamp,action,resource,status\n";
    const body = filtered
      .map((l) => `${l.created_at},${l.action},"${(l.resource ?? "").replace(/"/g, '""')}",${l.status}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `securecrypt-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="Audit Logs" subtitle="Every cryptographic action logged with timestamp, status, and resource.">
      <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search action or resource…"
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f.key
                  ? "bg-[image:var(--gradient-cyber)] text-primary-foreground glow"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:bg-secondary/50 text-xs font-medium"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Time</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Resource</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-muted-foreground">
                    No matching entries.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="border-t border-border hover:bg-secondary/20 transition">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-3 text-xs truncate max-w-[280px]">{l.resource ?? "—"}</td>
                    <td className="px-4 py-3">
                      {l.status === "success" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> failure
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        Showing latest {filtered.length} of up to 500 entries.
      </p>
    </AppShell>
  );
}