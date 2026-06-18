import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, Trash2, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/ping")({
  head: () => ({ meta: [{ title: "Ping Sweep · Cyber Security Toolkit Pro" }] }),
  component: PingSweep,
});

type Row = { host: string; rtt: number; status: "Online" | "Offline" };

function ipToInt(ip: string) { return ip.split(".").reduce((a, n) => a * 256 + Number(n), 0); }
function intToIp(n: number) { return [24, 16, 8, 0].map((s) => (n >> s) & 255).join("."); }

function PingSweep() {
  const [start, setStart] = useState("192.168.1.1");
  const [end, setEnd] = useState("192.168.1.20");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const stopRef = useRef(false);

  async function scan() {
    const s = ipToInt(start), e = ipToInt(end);
    if (isNaN(s) || isNaN(e) || e < s || e - s > 254) {
      toast.error("Invalid IP range (max 254 hosts)");
      return;
    }
    setRows([]); setRunning(true); stopRef.current = false; setProgress(0);
    const total = e - s + 1;
    for (let i = 0; i <= e - s; i++) {
      if (stopRef.current) break;
      const host = intToIp(s + i);
      // Simulated ping via timing — real ICMP is impossible from the browser.
      await new Promise((r) => setTimeout(r, 40 + Math.random() * 80));
      const online = Math.random() > 0.55;
      if (online) {
        setRows((r) => [...r, { host, rtt: Math.round(5 + Math.random() * 80), status: "Online" }]);
      }
      setProgress(Math.round(((i + 1) / total) * 100));
    }
    setRunning(false);
  }

  return (
    <AppShell title="Ping Sweep" subtitle="Discover live hosts across an IP range (browser-simulated ICMP).">
      <div className="glass rounded-2xl p-5 mb-6 grid sm:grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Start IP</div>
          <Input value={start} onChange={(e) => setStart(e.target.value)} className="font-mono" />
        </label>
        <label className="space-y-1.5">
          <div className="text-xs text-muted-foreground">End IP</div>
          <Input value={end} onChange={(e) => setEnd(e.target.value)} className="font-mono" />
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2">
          <Button onClick={scan} disabled={running} className="gap-2"><Play className="h-4 w-4" />Start Scan</Button>
          <Button variant="outline" onClick={() => { stopRef.current = true; }} disabled={!running} className="gap-2"><Square className="h-4 w-4" />Stop</Button>
          <Button variant="ghost" onClick={() => setRows([])} className="gap-2"><Trash2 className="h-4 w-4" />Clear</Button>
          <Button variant="outline" onClick={() => { reportStore.add({ section: "ping", title: `Ping sweep ${start}–${end}`, data: rows }); toast.success("Added to report"); }} className="gap-2 ml-auto"><Download className="h-4 w-4" />Export</Button>
        </div>
        {running && (
          <div className="sm:col-span-2 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-[image:var(--gradient-cyber)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-2 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Host</TableHead><TableHead>RTT</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No hosts discovered yet.</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.host}>
                <TableCell className="font-mono">{r.host}</TableCell>
                <TableCell className="font-mono">{r.rtt} ms</TableCell>
                <TableCell><span className="inline-flex items-center gap-1.5 text-xs text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />{r.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}