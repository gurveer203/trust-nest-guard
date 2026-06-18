import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/traceroute")({
  head: () => ({ meta: [{ title: "Traceroute · Cyber Security Toolkit Pro" }] }),
  component: Traceroute,
});

type Hop = { n: number; ip: string; rtt: number };

function Traceroute() {
  const [target, setTarget] = useState("google.com");
  const [hops, setHops] = useState<Hop[]>([]);
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);

  async function trace() {
    setHops([]); setRunning(true); stopRef.current = false;
    const total = 8 + Math.floor(Math.random() * 6);
    for (let i = 1; i <= total; i++) {
      if (stopRef.current) break;
      await new Promise((r) => setTimeout(r, 250));
      const ip = `${10 + (i % 200)}.${(i * 7) % 255}.${(i * 13) % 255}.${(i * 17) % 255}`;
      setHops((h) => [...h, { n: i, ip, rtt: Math.round(5 + i * 4 + Math.random() * 20) }]);
    }
    setRunning(false);
  }

  return (
    <AppShell title="Traceroute" subtitle="Trace the network path hop-by-hop to a target (simulated).">
      <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
        <label className="space-y-1.5 flex-1 min-w-[240px]">
          <div className="text-xs text-muted-foreground">Target host</div>
          <Input value={target} onChange={(e) => setTarget(e.target.value)} className="font-mono" />
        </label>
        <Button onClick={trace} disabled={running} className="gap-2"><Play className="h-4 w-4" />Start Trace</Button>
        <Button variant="outline" onClick={() => { stopRef.current = true; }} disabled={!running} className="gap-2"><Square className="h-4 w-4" />Stop</Button>
        <Button variant="outline" onClick={() => { reportStore.add({ section: "traceroute", title: `Traceroute ${target}`, data: hops }); toast.success("Added to report"); }} className="gap-2"><Download className="h-4 w-4" />Export</Button>
      </div>

      <div className="glass rounded-2xl p-2 overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Hop</TableHead><TableHead>IP Address</TableHead><TableHead>Response Time</TableHead></TableRow></TableHeader>
          <TableBody>
            {hops.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No trace yet.</TableCell></TableRow>
            ) : hops.map((h) => (
              <TableRow key={h.n}>
                <TableCell className="font-mono">{h.n}</TableCell>
                <TableCell className="font-mono">{h.ip}</TableCell>
                <TableCell className="font-mono">{h.rtt} ms</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}