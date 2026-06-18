// Simple in-memory aggregator for cross-tool report generation.
// Persists to localStorage so reports survive page reloads.

export type ReportSection =
  | "system" | "ping" | "ports" | "dns" | "whois"
  | "traceroute" | "password" | "logs" | "integrity";

export type ReportEntry = {
  section: ReportSection;
  title: string;
  timestamp: string;
  data: unknown;
};

const KEY = "cstp.report.v1";

function read(): ReportEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function write(entries: ReportEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("cstp:report-updated"));
}

export const reportStore = {
  add(entry: Omit<ReportEntry, "timestamp">) {
    const entries = read();
    entries.unshift({ ...entry, timestamp: new Date().toISOString() });
    write(entries.slice(0, 100));
  },
  list(): ReportEntry[] { return read(); },
  clear() { write([]); },
};