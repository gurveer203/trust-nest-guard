import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileCheck2, ShieldCheck, ShieldAlert } from "lucide-react";
import { reportStore } from "@/lib/report-store";
import { toast } from "sonner";

export const Route = createFileRoute("/integrity")({
  head: () => ({ meta: [{ title: "File Integrity · Cyber Security Toolkit Pro" }] }),
  component: Integrity,
});

async function sha256(buf: ArrayBuffer) {
  const h = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
// MD5 implementation (compact) for educational integrity comparison.
function md5(bytes: Uint8Array): string {
  function rl(x: number, n: number) { return (x << n) | (x >>> (32 - n)); }
  const s = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
    4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32);
  const ml = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes); padded[bytes.length] = 0x80;
  const v = new DataView(padded.buffer);
  v.setUint32(padded.length - 8, ml >>> 0, true);
  v.setUint32(padded.length - 4, Math.floor(ml / 2 ** 32), true);
  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (let off = 0; off < padded.length; off += 64) {
    const M = new Uint32Array(16);
    for (let i = 0; i < 16; i++) M[i] = v.getUint32(off + i * 4, true);
    let [A, B, C, D] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D; D = C; C = B; B = (B + rl(F, s[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  return [a0, b0, c0, d0].map((x) => {
    const h = new ArrayBuffer(4); new DataView(h).setUint32(0, x, true);
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }).join("");
}

function Integrity() {
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<{ sha: string; md5: string } | null>(null);
  const [expected, setExpected] = useState("");
  const [verified, setVerified] = useState<null | boolean>(null);

  async function generate(f: File) {
    const buf = await f.arrayBuffer();
    const sha = await sha256(buf);
    const m = md5(new Uint8Array(buf));
    setHashes({ sha, md5: m });
    setVerified(null);
    reportStore.add({ section: "integrity", title: `Hashed ${f.name}`, data: { name: f.name, size: f.size, sha256: sha, md5: m } });
  }

  function compare() {
    if (!hashes || !expected) return;
    const ok = expected.trim().toLowerCase() === hashes.sha.toLowerCase() || expected.trim().toLowerCase() === hashes.md5.toLowerCase();
    setVerified(ok);
    toast[ok ? "success" : "error"](ok ? "Integrity verified" : "Hash mismatch — file modified");
  }

  return (
    <AppShell title="File Integrity Checker" subtitle="Generate SHA-256 and MD5 fingerprints and verify file integrity.">
      <div className="glass rounded-2xl p-5 mb-6 space-y-3">
        <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">{file ? file.name : "Select a file to hash"}</span>
          <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); generate(f); } }} />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!file} onClick={() => file && generate(file)} className="gap-2"><FileCheck2 className="h-4 w-4" />Generate Hash</Button>
        </div>
      </div>

      {hashes && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">SHA-256</div>
            <div className="font-mono text-xs break-all">{hashes.sha}</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">MD5</div>
            <div className="font-mono text-xs break-all">{hashes.md5}</div>
          </div>
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Verify against expected hash</div>
            <Input value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Paste known SHA-256 or MD5…" className="font-mono text-xs" />
            <div className="flex gap-2 items-center">
              <Button onClick={compare} disabled={!expected} className="gap-2"><ShieldCheck className="h-4 w-4" />Compare Hashes</Button>
              {verified === true && <span className="inline-flex items-center gap-1.5 text-sm text-success"><ShieldCheck className="h-4 w-4" />Verified</span>}
              {verified === false && <span className="inline-flex items-center gap-1.5 text-sm text-destructive"><ShieldAlert className="h-4 w-4" />Modified</span>}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}