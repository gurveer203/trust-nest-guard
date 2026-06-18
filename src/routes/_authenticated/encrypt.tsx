import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { UploadCloud, Lock, Eye, EyeOff, Loader2, Download, FileLock2, X } from "lucide-react";
import { encryptFile, downloadBlob, passwordStrength } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/encrypt")({
  head: () => ({ meta: [{ title: "Encrypt · SecureCrypt" }] }),
  component: EncryptPage,
});

function EncryptPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);

  const strength = passwordStrength(passphrase);

  async function doEncrypt() {
    if (!file || !passphrase) {
      toast.error("Pick a file and enter a passphrase");
      return;
    }
    if (strength.score < 2) {
      toast.error("Use a stronger passphrase");
      return;
    }
    setBusy(true);
    setProgress(10);
    try {
      const t = setInterval(() => setProgress((p) => Math.min(p + 8, 85)), 80);
      const blob = await encryptFile(file, passphrase);
      clearInterval(t);
      setProgress(100);
      downloadBlob(blob, file.name + ".scrypt");
      await logAudit("file.encrypt", file.name, { size: file.size });
      toast.success("File encrypted and downloaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Encryption failed";
      await logAudit("file.encrypt", file.name, { error: msg }, "failure");
      toast.error(msg);
    } finally {
      setTimeout(() => {
        setBusy(false);
        setProgress(0);
      }, 600);
    }
  }

  return (
    <AppShell
      title="Encrypt File"
      subtitle="AES-256-GCM with PBKDF2-derived key (250,000 iterations). File is processed entirely in-browser."
    >
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`glass rounded-2xl p-10 text-center cursor-pointer border-2 border-dashed transition-all ${
              drag ? "border-primary glow" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <UploadCloud className="h-10 w-10 mx-auto mb-3 text-primary" />
            <div className="font-display font-semibold">
              {drag ? "Drop to select" : "Drag and drop a file"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              or click to browse · any file type · stays on your device
            </div>
          </div>

          {file && (
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary/60">
                <FileLock2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs font-mono text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · {file.type || "unknown"}
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg hover:bg-destructive/15 hover:text-destructive transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Encryption settings
          </h2>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Passphrase
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="A long, memorable phrase"
                className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-input border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passphrase && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < strength.score
                          ? strength.score <= 1
                            ? "bg-destructive"
                            : strength.score === 2
                            ? "bg-warning"
                            : "bg-success"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{strength.label}</p>
              </div>
            )}
          </div>

          {busy && (
            <div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[image:var(--gradient-cyber)] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-mono">Encrypting… {progress}%</p>
            </div>
          )}

          <button
            onClick={doEncrypt}
            disabled={!file || !passphrase || busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[image:var(--gradient-cyber)] text-primary-foreground font-semibold glow disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {busy ? "Encrypting" : "Encrypt & download"}
          </button>

          <p className="text-[11px] text-muted-foreground">
            Encrypted output is saved as <span className="font-mono">filename.scrypt</span>. Keep your
            passphrase safe — it cannot be recovered.
          </p>
        </div>
      </div>
    </AppShell>
  );
}