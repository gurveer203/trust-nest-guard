import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Shield, Lock, KeyRound, FileSignature, ScrollText, Hash, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecureCrypt — End-to-End Encryption Platform" },
      { name: "description", content: "AES-256 encryption, RSA-2048 digital signatures, SHA-256 integrity. All cryptography runs in your browser. Keys never leave your device." },
      { property: "og:title", content: "SecureCrypt — End-to-End Encryption Platform" },
      { property: "og:description", content: "Industry-grade browser-side cryptography with full audit logging." },
    ],
  }),
  component: Index,
});

function Index() {
  const features = [
    { icon: Lock, title: "AES-256-GCM Encryption", desc: "Authenticated symmetric encryption with PBKDF2-derived keys (250k iterations)." },
    { icon: KeyRound, title: "RSA-2048 Key Generation", desc: "Generate and manage asymmetric keypairs entirely client-side via Web Crypto." },
    { icon: FileSignature, title: "Digital Signatures", desc: "RSA-PSS signing and verification — prove authorship and detect tampering." },
    { icon: Hash, title: "SHA-256 Integrity", desc: "Hash any text or file, compare digests, verify content integrity instantly." },
    { icon: ScrollText, title: "Full Audit Trail", desc: "Every action logged with timestamp, status, and resource — exportable for compliance." },
    { icon: Shield, title: "Zero-Knowledge", desc: "Your passphrases and private keys never leave the browser. We see ciphertext only." },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />

      {/* Nav */}
      <nav className="relative z-10 px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-cyber)] glow">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">SecureCrypt</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[image:var(--gradient-cyber)] text-primary-foreground text-sm font-semibold glow hover:opacity-90 transition"
          >
            Launch console <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-12 pb-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono uppercase tracking-wider text-muted-foreground mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-ping opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          End-to-end encrypted · Zero-knowledge
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
          Industry-grade <br />
          <span className="text-gradient">cryptography,</span> in your browser.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          AES-256 file encryption, RSA-2048 digital signatures, SHA-256 integrity verification,
          and complete audit logging. All cryptographic operations run client-side — your keys
          never leave your device.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[image:var(--gradient-cyber)] text-primary-foreground font-semibold glow hover:translate-y-[-1px] transition"
          >
            Get started — it's free <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass font-medium hover:bg-secondary/50 transition"
          >
            See features
          </a>
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground">
          {["AES-256-GCM", "RSA-PSS-2048", "SHA-256", "PBKDF2 · 250k", "Web Crypto API"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 lg:px-12 pb-24 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 hover:translate-y-[-2px] hover:glow transition-all"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/60 border border-border mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 pb-24 max-w-4xl mx-auto">
        <div className="glass-strong rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[image:var(--gradient-cyber)] opacity-10" />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
              Ready to encrypt with confidence?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Create an account and start protecting files in under 30 seconds.
            </p>
            <Link
              to="/auth"
              className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[image:var(--gradient-cyber)] text-primary-foreground font-semibold glow hover:translate-y-[-1px] transition"
            >
              Launch console <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-6 lg:px-12 py-8 text-center text-xs text-muted-foreground font-mono">
        SecureCrypt · Built with Web Crypto API · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <img
        data-lovable-blank-page-placeholder="REMOVE_THIS"
        src="https://cdn.gpteng.co/blank-app-v1.svg"
        alt="Your app will live here!"
      />
    </div>
  );
}
