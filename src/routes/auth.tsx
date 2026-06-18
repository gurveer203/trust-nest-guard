import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { passwordStrength } from "@/lib/crypto";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · SecureCrypt" },
      { name: "description", content: "Sign in or create a SecureCrypt account to manage your encrypted files and digital signatures." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const strength = passwordStrength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (strength.score < 2) {
          toast.error("Choose a stronger password");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        await logAudit("auth.signup", email);
        toast.success("Account created!");
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await logAudit("auth.signin", email);
        toast.success("Welcome back");
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Password reset email sent");
        setMode("signin");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="relative w-full max-w-md glass-strong rounded-3xl p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-cyber)] glow mb-4">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" && "Sign in to access your encryption console"}
            {mode === "signup" && "Industry-grade crypto in 30 seconds"}
            {mode === "forgot" && "We'll email you a reset link"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                  placeholder="••••••••"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {mode === "signup" && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
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
                  <p className="text-xs text-muted-foreground">{strength.label}</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[image:var(--gradient-cyber)] text-primary-foreground font-semibold glow hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" && "Sign in"}
            {mode === "signup" && "Create account"}
            {mode === "forgot" && "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
          {mode === "signin" && (
            <>
              <button onClick={() => setMode("forgot")} className="hover:text-foreground transition">
                Forgot password?
              </button>
              <div>
                No account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                  Create one
                </button>
              </div>
            </>
          )}
          {mode === "signup" && (
            <div>
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </div>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("signin")} className="hover:text-foreground transition">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}