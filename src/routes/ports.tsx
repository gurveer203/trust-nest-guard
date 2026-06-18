import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/ports")({
  head: () => ({ meta: [{ title: "Port Scanner · Cyber Security Toolkit Pro" }] }),
  component: PortScanner,
});

const SERVICES: Record<number, string> = {
  21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 80: "HTTP", 110: "POP3",
  143: "IMAP", 443: "HTTPS", 445: "SMB", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
  6379: "Redis", 8080: "HTTP-Alt", 8443: "HTTPS-Alt", 27017: "MongoDB",
};

type Row = { port: number; protocol: string; service: string; status: "Open" | "Closed" };

function PortScanner() {
  const [target, setTarget] = useState("scanme.nmap.org");
  const [from, setFrom] = useState("20");
  const [to, setTo] = useState("100");
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);

  async function scan() {
    const f = Number(from), t = Number(to);
    if (!target || isNaN(f) || isNaN(t) || t < f || t - f > 500) {
      toast.error("Invalid range (max 500 ports)"); return;
    }
    setRows([]); setRunning(true); stopRef.current = false;
    for (let p = f; p <= t; p++) {
      if (stopRef.current) break;
      await new Promise((r) => setTimeout(r, 8));
      const open = SERVICES[p] ? Math.random() > 0.3 : Math.random() > 0.95;
      setRows((r) => [...r, { port: p, protocol: "TCP", service: SERVICES[p] ?? "unknown", status: open ? "Open" : "Closed" }]);
    }
    setRunning(false);
  }

  const filtered = rows.filter((r) => !filter || `${r.port} ${r.service}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <AppShell title="Port Scanner" subtitle="Probe TCP port ranges and identify exposed services (simulated).">
      <div className="glass rounded-2xl p-5 mb-6 grid sm:grid-cols-3 gap-3">
        <label className="space-y-1.5 sm:col-span-3"><div className="text-xs text-muted-foreground">Target</div><Input value={target} onChange={(e) => setTarget(e.target.value)} className="font-mono" /></label>
        <label className="space-y-1.5"><div className="text-xs text-muted-foreground">Start Port</div><Input value={from} onChange={(e) => setFrom(e.target.value)} className="font-mono" /></label>
        <label className="space-y-1.5"><div className="text-xs text-muted-foreground">End Port</div><Input value={to} onChange={(e) => setTo(e.target.value)} className="font-mono" /></label>
        <label className="space-y-1.5"><div className="text-xs text-muted-foreground">Filter</div><Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="search port / service" /></label>
        <div className="sm:col-span-3 flex flex-wrap gap-2">
          <Button onClick={scan} disabled={running} className="gap-2"><Play className="h-4 w-4" />Start Scan</Button>
          <Button variant="outline" onClick={() => { stopRef.current = true; }} disabled={!running} className="gap-2"><Square className="h-4 w-4" />Stop</Button>
          <Button variant="outline" className="gap-2 ml-auto" onClick={() => { reportStore.add({ section: "ports", title: `Port scan ${target}`, data: rows }); toast.success("Added to report"); }}><Download className="h-4 w-4" />Export</Button>
        </div>
      </div>

      <div className="glass rounded-2xl p-2 overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Port</TableHead><TableHead>Protocol</TableHead><TableHead>Service</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No results.</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.port}>
                <TableCell className="font-mono">{r.port}</TableCell>
                <TableCell className="font-mono">{r.protocol}</TableCell>
                <TableCell className="font-mono">{r.service}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${r.status === "Open" ? "text-success" : "text-muted-foreground"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${r.status === "Open" ? "bg-success" : "bg-muted-foreground"}`} />{r.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}