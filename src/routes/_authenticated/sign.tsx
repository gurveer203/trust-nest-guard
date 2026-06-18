import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import {
  KeyRound,
  PenLine,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Download,
  UploadCloud,
  FileSignature,
  Trash2,
} from "lucide-react";
import {
  generateRsaKeyPair,
  exportPublicKey,
  exportPrivateKey,
  importPrivateKey,
  importPublicKey,
  signData,
  verifySignature,
  sha256Hex,
  downloadBlob,
} from "@/lib/crypto";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sign")({
  head: () => ({ meta: [{ title: "Sign & Verify · SecureCrypt" }] }),
  component: SignPage,
});

function SignPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"sign" | "verify">("sign");

  // Sign state
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [signFile, setSignFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const signFileRef = useRef<HTMLInputElement>(null);

  // Verify state
  const [vFile, setVFile] = useState<File | null>(null);
  const [vSignature, setVSignature] = useState("");
  const [vPubKey, setVPubKey] = useState("");
  const [vResult, setVResult] = useState<"valid" | "invalid" | null>(null);
  const vFileRef = useRef<HTMLInputElement>(null);

  const { data: history } = useQuery({
    queryKey: ["signatures"],
    queryFn: async () => {
      const { data } = await supabase
        .from("signatures")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  async function genKeys() {
    setBusy(true);
    try {
      const pair = await generateRsaKeyPair();
      const [pub, priv] = await Promise.all([
        exportPublicKey(pair.publicKey),
        exportPrivateKey(pair.privateKey),
      ]);
      setPublicKey(pub);
      setPrivateKey(priv);
      await logAudit("key.generate", "RSA-2048");
      toast.success("RSA-2048 keypair generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Key generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function doSign() {
    if (!signFile || !privateKey) {
      toast.error("Pick a file and provide a private key");
      return;
    }
    setBusy(true);
    try {
      const buf = await signFile.arrayBuffer();
      const priv = await importPrivateKey(privateKey);
      const sig = await signData(priv, buf);
      const hash = await sha256Hex(buf);
      await supabase.from("signatures").insert({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        file_name: signFile.name,
        file_hash: hash,
        signature: sig,
        public_key: publicKey || "(external)",
      });
      await logAudit("signature.sign", signFile.name);
      qc.invalidateQueries({ queryKey: ["signatures"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });

      const bundle = JSON.stringify(
        {
          algorithm: "RSA-PSS-SHA256",
          fileName: signFile.name,
          fileHash: hash,
          signature: sig,
          publicKey,
          signedAt: new Date().toISOString(),
        },
        null,
        2,
      );
      downloadBlob(new Blob([bundle], { type: "application/json" }), signFile.name + ".sig.json");
      toast.success("Signed and saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setBusy(false);
    }
  }

  async function doVerify() {
    if (!vFile || !vSignature || !vPubKey) {
      toast.error("Need file, signature, and public key");
      return;
    }
    setBusy(true);
    setVResult(null);
    try {
      const buf = await vFile.arrayBuffer();
      const pub = await importPublicKey(vPubKey);
      const ok = await verifySignature(pub, vSignature, buf);
      setVResult(ok ? "valid" : "invalid");
      await logAudit("signature.verify", vFile.name, { result: ok ? "valid" : "invalid" });
      ok ? toast.success("Signature is valid") : toast.error("Signature did not verify");
    } catch (err) {
      setVResult("invalid");
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadSigBundle(f: File) {
    try {
      const txt = await f.text();
      const obj = JSON.parse(txt);
      setVSignature(obj.signature ?? "");
      setVPubKey(obj.publicKey ?? "");
      toast.success("Signature bundle loaded");
    } catch {
      toast.error("Invalid signature bundle");
    }
  }

  return (
    <AppShell
      title="Digital Signatures"
      subtitle="RSA-PSS-SHA256 (2048-bit). Sign documents to prove authorship — verify to detect tampering."
    >
      <div className="flex gap-2 mb-6">
        {(["sign", "verify"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t
                ? "bg-[image:var(--gradient-cyber)] text-primary-foreground glow"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "sign" ? "Sign" : "Verify"}
          </button>
        ))}
      </div>

      {tab === "sign" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> RSA-2048 Keys
              </h2>
              <button
                onClick={genKeys}
                disabled={busy}
                className="px-3 py-1.5 rounded-lg bg-[image:var(--gradient-cyber)] text-primary-foreground text-xs font-semibold glow disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Generate"}
              </button>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Public key (base64 SPKI)
              </label>
              <textarea
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                rows={3}
                placeholder="Generate or paste"
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-[10px] font-mono break-all resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Private key (base64 PKCS8) — keep secret
              </label>
              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                rows={4}
                placeholder="Generate or paste"
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-[10px] font-mono break-all resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {publicKey && privateKey && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    downloadBlob(
                      new Blob([JSON.stringify({ publicKey, privateKey }, null, 2)], {
                        type: "application/json",
                      }),
                      "securecrypt-keypair.json",
                    )
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg glass hover:bg-secondary/50 text-xs font-medium"
                >
                  <Download className="h-3.5 w-3.5" /> Download keypair
                </button>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" /> Sign a file
            </h2>
            <button
              onClick={() => signFileRef.current?.click()}
              className="w-full glass rounded-xl p-6 text-center border-2 border-dashed border-border hover:border-primary/50 transition"
            >
              <UploadCloud className="h-7 w-7 mx-auto mb-2 text-primary" />
              <div className="text-sm font-medium">{signFile ? signFile.name : "Choose a file to sign"}</div>
              {signFile && (
                <div className="text-[11px] text-muted-foreground font-mono mt-1">
                  {(signFile.size / 1024).toFixed(1)} KB
                </div>
              )}
            </button>
            <input
              ref={signFileRef}
              type="file"
              className="hidden"
              onChange={(e) => setSignFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={doSign}
              disabled={!signFile || !privateKey || busy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[image:var(--gradient-cyber)] text-primary-foreground font-semibold glow disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
              Sign & download bundle
            </button>
            <p className="text-[11px] text-muted-foreground">
              Saves a <span className="font-mono">.sig.json</span> bundle and stores the signature record on your account.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> Verify
            </h2>
            <button
              onClick={() => vFileRef.current?.click()}
              className="w-full glass rounded-xl p-5 text-center border-2 border-dashed border-border hover:border-accent/50 transition"
            >
              <UploadCloud className="h-6 w-6 mx-auto mb-2 text-accent" />
              <div className="text-sm font-medium">
                {vFile ? vFile.name : "Original file to verify"}
              </div>
            </button>
            <input
              ref={vFileRef}
              type="file"
              className="hidden"
              onChange={(e) => setVFile(e.target.files?.[0] ?? null)}
            />
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Signature (base64) or load bundle
              </label>
              <textarea
                value={vSignature}
                onChange={(e) => setVSignature(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-[10px] font-mono break-all resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && loadSigBundle(e.target.files[0])}
                className="mt-2 text-xs text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Signer's public key
              </label>
              <textarea
                value={vPubKey}
                onChange={(e) => setVPubKey(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-[10px] font-mono break-all resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <button
              onClick={doVerify}
              disabled={!vFile || !vSignature || !vPubKey || busy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold glow-cyan disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify signature
            </button>
            {vResult && (
              <div
                className={`rounded-lg p-4 border text-sm font-medium flex items-center gap-2 ${
                  vResult === "valid"
                    ? "bg-success/10 border-success/40 text-success"
                    : "bg-destructive/10 border-destructive/40 text-destructive"
                }`}
              >
                {vResult === "valid" ? (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Signature valid — file is authentic
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" /> Signature invalid — file may be tampered
                  </>
                )}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
              <FileSignature className="h-4 w-4 text-primary" /> Your signatures
            </h2>
            {history?.length ? (
              <ul className="space-y-2">
                {history.map((s) => (
                  <li key={s.id} className="glass rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{s.file_name}</span>
                      <button
                        onClick={async () => {
                          await supabase.from("signatures").delete().eq("id", s.id);
                          qc.invalidateQueries({ queryKey: ["signatures"] });
                        }}
                        className="p-1 rounded hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                      hash: {s.file_hash.slice(0, 32)}…
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No signatures yet.</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}