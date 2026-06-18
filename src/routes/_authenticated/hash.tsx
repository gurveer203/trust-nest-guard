import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Hash, Copy, Check, UploadCloud, GitCompare } from "lucide-react";
import { sha256Hex } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hash")({
  head: () => ({ meta: [{ title: "Hash · SecureCrypt" }] }),
  component: HashPage,
});

function HashPage() {
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!text) {
      setHash("");
      return;
    }
    let alive = true;
    sha256Hex(text).then((h) => alive && setHash(h));
    return () => {
      alive = false;
    };
  }, [text]);

  async function generateNow() {
    if (!text) return;
    const h = await sha256Hex(text);
    setHash(h);
    await logAudit("hash.generate", "text", { length: text.length });
    toast.success("SHA-256 generated");
  }

  async function hashFile(f: File) {
    const buf = await f.arrayBuffer();
    const h = await sha256Hex(buf);
    setHash(h);
    setText(`<file: ${f.name} · ${f.size} bytes>`);
    await logAudit("hash.generate", f.name, { size: f.size });
    toast.success("File hashed");
  }

  function copy() {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const compareResult =
    compareA && compareB ? compareA.trim().toLowerCase() === compareB.trim().toLowerCase() : null;

  return (
    <AppShell
      title="SHA-256 Hash Generator"
      subtitle="Generate cryptographic digests for text or files, and compare hashes to verify integrity."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" /> Generate
          </h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to hash…"
            rows={6}
            className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={generateNow}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[image:var(--gradient-cyber)] text-primary-foreground font-semibold glow disabled:opacity-40"
              disabled={!text}
            >
              <Hash className="h-4 w-4" /> Generate SHA-256
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass hover:bg-secondary/50 font-medium"
            >
              <UploadCloud className="h-4 w-4" /> Hash file
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && hashFile(e.target.files[0])}
            />
          </div>

          {hash && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Digest (256 bits · hex)
              </label>
              <div className="relative">
                <pre className="w-full px-3 py-3 pr-12 rounded-lg bg-input border border-border text-xs font-mono break-all whitespace-pre-wrap">
                  {hash}
                </pre>
                <button
                  onClick={copy}
                  className="absolute top-2 right-2 p-2 rounded-md bg-secondary/80 hover:bg-secondary"
                  aria-label="Copy"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-accent" /> Compare hashes
          </h2>
          <input
            value={compareA}
            onChange={(e) => setCompareA(e.target.value)}
            placeholder="Hash A"
            className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <input
            value={compareB}
            onChange={(e) => setCompareB(e.target.value)}
            placeholder="Hash B"
            className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          {compareResult !== null && (
            <div
              className={`rounded-lg p-4 border text-sm font-medium flex items-center gap-2 ${
                compareResult
                  ? "bg-success/10 border-success/40 text-success"
                  : "bg-destructive/10 border-destructive/40 text-destructive"
              }`}
            >
              {compareResult ? (
                <>
                  <Check className="h-4 w-4" /> Hashes match — integrity confirmed
                </>
              ) : (
                <>
                  <GitCompare className="h-4 w-4" /> Hashes differ — content has changed
                </>
              )}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Comparison is case-insensitive and ignores surrounding whitespace.
          </p>
        </div>
      </div>
    </AppShell>
  );
}