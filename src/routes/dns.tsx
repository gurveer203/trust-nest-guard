import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Download } from "lucide-react";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dns")({
  head: () => ({ meta: [{ title: "DNS Lookup · Cyber Security Toolkit Pro" }] }),
  component: DnsLookup,
});

const TYPES = ["A", "AAAA", "MX", "NS", "CNAME"] as const;

function DnsLookup() {
  const [domain, setDomain] = useState("example.com");
  const [results, setResults] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!domain) return;
    setLoading(true); setResults({});
    const out: Record<string, string[]> = {};
    await Promise.all(TYPES.map(async (t) => {
      try {
        const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${t}`);
        const j = await r.json();
        out[t] = (j.Answer ?? []).map((a: any) => a.data);
      } catch { out[t] = []; }
    }));
    setResults(out); setLoading(false);
  }

  return (
    <AppShell title="DNS Lookup" subtitle="Resolve A, AAAA, MX, NS and CNAME records via Google DNS-over-HTTPS.">
      <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
        <label className="space-y-1.5 flex-1 min-w-[240px]">
          <div className="text-xs text-muted-foreground">Domain</div>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} className="font-mono" />
        </label>
        <Button onClick={lookup} disabled={loading} className="gap-2"><Search className="h-4 w-4" />{loading ? "Looking up…" : "Lookup DNS"}</Button>
        <Button variant="ghost" onClick={() => setResults({})} className="gap-2"><Trash2 className="h-4 w-4" />Clear</Button>
        <Button variant="outline" onClick={() => { reportStore.add({ section: "dns", title: `DNS ${domain}`, data: results }); toast.success("Added to report"); }} className="gap-2"><Download className="h-4 w-4" />Export</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TYPES.map((t) => (
          <div key={t} className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t} Record</div>
            {results[t]?.length ? (
              <ul className="space-y-1 font-mono text-sm">
                {results[t].map((v, i) => <li key={i} className="break-all">{v}</li>)}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground">{loading ? "Resolving…" : "—"}</div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}