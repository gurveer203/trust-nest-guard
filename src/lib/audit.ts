import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "auth.signin"
  | "auth.signup"
  | "auth.signout"
  | "auth.reset"
  | "file.encrypt"
  | "file.decrypt"
  | "key.generate"
  | "signature.sign"
  | "signature.verify"
  | "hash.generate"
  | "hash.compare";

export async function logAudit(
  action: AuditAction,
  resource?: string,
  details: Record<string, unknown> = {},
  status: "success" | "failure" = "success",
) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("audit_logs").insert({
      user_id: data.user.id,
      action,
      resource: resource ?? null,
      details,
      status,
    });
  } catch (err) {
    console.warn("Audit log failed", err);
  }
}