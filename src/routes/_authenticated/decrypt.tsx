import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { UploadCloud, Unlock, Eye, EyeOff, Loader2, Download, FileLock2, X } from "lucide-react";
import { decryptFile, downloadBlob } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/decrypt")({
  head: () => ({ meta: [{ title: "Decrypt · SecureCrypt" }] }),
  component: DecryptPage,
});

function DecryptPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function doDecrypt() {
    if (!file || !passphrase) {
      toast.error("Pick an encrypted file and enter the passphrase");
      return;
    }
    setBusy(true);
    try {
      const blob = await decryptFile(file, passphrase);
      const outName = file.name.endsWith(".scrypt") ? file.name.slice(0, -7) : file.name + ".decrypted";
      downloadBlob(blob, outName);
      await logAudit("file.decrypt", file.name, { size: file.size });
      toast.success("File decrypted and downloaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Decryption failed";
      await logAudit("file.decrypt", file.name, { error: msg }, "failure");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Decrypt File"
      subtitle="Restore a .scrypt file with the passphrase used to encrypt it. Authentication tag prevents tampering."
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
              drag ? "border-accent glow-cyan" : "border-border hover:border-accent/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".scrypt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <UploadCloud className="h-10 w-10 mx-auto mb-3 text-accent" />
            <div className="font-display font-semibold">
              {drag ? "Drop to select" : "Drop a .scrypt file"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              or click to browse · only SecureCrypt files supported
            </div>
          </div>

          {file && (
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary/60">
                <FileLock2 className="h-5 w-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs font-mono text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
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
            <Unlock className="h-4 w-4 text-accent" /> Decryption
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
                placeholder="Enter the original passphrase"
                className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-input border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={doDecrypt}
            disabled={!file || !passphrase || busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold glow-cyan disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {busy ? "Decrypting" : "Decrypt & download"}
          </button>

          <p className="text-[11px] text-muted-foreground">
            If the passphrase is wrong or the file was tampered with, decryption will fail safely.
          </p>
        </div>
      </div>
    </AppShell>
  );
}