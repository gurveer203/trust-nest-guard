import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { reportStore } from "@/lib/report-store";

export const Route = createFileRoute("/password")({
  head: () => ({ meta: [{ title: "Password Generator · Cyber Security Toolkit Pro" }] }),
  component: PasswordGen,
});

function gen(len: number, opts: { upper: boolean; lower: boolean; digit: boolean; sym: boolean }) {
  let chars = "";
  if (opts.upper) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (opts.lower) chars += "abcdefghijkmnopqrstuvwxyz";
  if (opts.digit) chars += "23456789";
  if (opts.sym) chars += "!@#$%^&*()-_=+[]{};:,.<>?";
  if (!chars) return "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return [...arr].map((n) => chars[n % chars.length]).join("");
}

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++; if (p.length >= 12) s++; if (p.length >= 16) s++;
  if (/[A-Z]/.test(p)) s++; if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 6);
}

function PasswordGen() {
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ upper: true, lower: true, digit: true, sym: true });
  const [pwd, setPwd] = useState("");

  function regenerate() { setPwd(gen(len, opts)); }
  function copy() { if (pwd) { navigator.clipboard.writeText(pwd); toast.success("Copied"); reportStore.add({ section: "password", title: "Password generated", data: { length: len, options: opts, strength: strength(pwd) } }); } }

  const s = strength(pwd);
  const labels = ["—", "Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const hues = ["bg-muted", "bg-destructive", "bg-destructive", "bg-warning", "bg-warning", "bg-success", "bg-success"];

  return (
    <AppShell title="Password Generator" subtitle="Cryptographically secure passwords using Web Crypto getRandomValues().">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 lg:col-span-2 space-y-5">
          <label className="block">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Length</span><span className="font-mono">{len}</span>
            </div>
            <input type="range" min={6} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full accent-primary" />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              ["upper", "Uppercase letters"], ["lower", "Lowercase letters"],
              ["digit", "Numbers"], ["sym", "Special characters"],
            ] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/40 cursor-pointer">
                <input type="checkbox" checked={(opts as any)[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} className="accent-primary" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={regenerate} className="gap-2"><KeyRound className="h-4 w-4" />Generate Password</Button>
            <Button variant="outline" onClick={regenerate} className="gap-2"><RefreshCw className="h-4 w-4" />Generate New</Button>
            <Button variant="outline" onClick={copy} disabled={!pwd} className="gap-2"><Copy className="h-4 w-4" />Copy</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex flex-col">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Generated</div>
          <Input readOnly value={pwd} placeholder="Click Generate" className="font-mono text-sm" />
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Strength</span><span>{labels[s]}</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= s ? hues[s] : "bg-secondary"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}