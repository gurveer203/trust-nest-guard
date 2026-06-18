import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/whois")({
  head: () => ({ meta: [{ title: "Whois Lookup · Cyber Security Toolkit Pro" }] }),
  component: WhoisLookup,
});

type Whois = { domain: string; registrar: string; created: string; expires: string; nameServers: string[] };

function fakeWhois(d: string): Whois {
  const seed = [...d].reduce((a, c) => a + c.charCodeAt(0), 0);
  const created = new Date(2000 + (seed % 24), seed % 12, (seed % 27) + 1);
  const expires = new Date(created.getFullYear() + 5, created.getMonth(), created.getDate());
  const registrars = ["MarkMonitor Inc.", "GoDaddy LLC", "Namecheap Inc.", "Cloudflare Inc.", "Google LLC"];
  return {
    domain: d,
    registrar: registrars[seed % registrars.length],
    created: created.toISOString().slice(0, 10),
    expires: expires.toISOString().slice(0, 10),
    nameServers: [`ns1.${d}`, `ns2.${d}`, `ns3.${d}`],
  };
}

function WhoisLookup() {
  const [domain, setDomain] = useState("example.com");
  const [data, setData] = useState<Whois | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!domain) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setData(fakeWhois(domain.trim().toLowerCase()));
    setLoading(false);
  }

  return (
    <AppShell title="Whois Lookup" subtitle="Domain registrar, dates and authoritative name servers.">
      <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
        <label className="space-y-1.5 flex-1 min-w-[240px]">
          <div className="text-xs text-muted-foreground">Domain</div>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} className="font-mono" />
        </label>
        <Button onClick={lookup} disabled={loading} className="gap-2"><Search className="h-4 w-4" />{loading ? "Looking up…" : "Lookup Whois"}</Button>
        <Button variant="outline" disabled={!data} onClick={() => { if (data) { reportStore.add({ section: "whois", title: `Whois ${data.domain}`, data }); toast.success("Added to report"); } }} className="gap-2"><Download className="h-4 w-4" />Export</Button>
      </div>

      {data && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ["Domain Name", data.domain],
            ["Registrar", data.registrar],
            ["Creation Date", data.created],
            ["Expiry Date", data.expires],
          ].map(([k, v]) => (
            <div key={k} className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{k}</div>
              <div className="font-mono text-sm">{v}</div>
            </div>
          ))}
          <div className="glass rounded-2xl p-5 sm:col-span-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Name Servers</div>
            <ul className="space-y-1 font-mono text-sm">{data.nameServers.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        </div>
      )}
    </AppShell>
  );
}