import type { ControlStatus, RiskLevel, VendorRiskLevel } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function classifyRisk(score: number): RiskLevel {
  if (score >= 16) return "Critical";
  if (score >= 10) return "High";
  if (score >= 5) return "Medium";
  return "Low";
}

export function classifyVendor(score: number): VendorRiskLevel {
  if (score >= 80) return "Low";
  if (score >= 60) return "Medium";
  return "High";
}

export const RISK_LEVEL_STYLES: Record<RiskLevel, string> = {
  Critical: "bg-red-50 text-red-700 ring-red-600/20",
  High: "bg-orange-50 text-orange-700 ring-orange-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#d97706",
  Low: "#059669",
};

export const VENDOR_LEVEL_STYLES: Record<VendorRiskLevel, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  High: "bg-red-50 text-red-700 ring-red-600/20",
};

export const CONTROL_STATUS_STYLES: Record<ControlStatus, string> = {
  Compliant: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Partial: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Non-Compliant": "bg-red-50 text-red-700 ring-red-600/20",
  "Not Assessed": "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const STATUS_STYLES: Record<string, string> = {
  Open: "bg-sky-50 text-sky-700 ring-sky-600/20",
  "In Progress": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "Under Review": "bg-violet-50 text-violet-700 ring-violet-600/20",
  Closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Reported: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Triaged: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Investigating: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Containment: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Remediation: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Post-Incident Review": "bg-slate-100 text-slate-600 ring-slate-500/20",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Pending Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Not Started": "bg-slate-100 text-slate-600 ring-slate-500/20",
  "Expiring Soon": "bg-orange-50 text-orange-700 ring-orange-600/20",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Invited: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export function badgeStyle(label: string): string {
  return STATUS_STYLES[label] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Compliance score: compliant = 1, partial = 0.5, over all controls. */
export function complianceScore(
  statuses: ControlStatus[],
): number {
  if (statuses.length === 0) return 0;
  const points = statuses.reduce(
    (acc, s) => acc + (s === "Compliant" ? 1 : s === "Partial" ? 0.5 : 0),
    0,
  );
  return Math.round((points / statuses.length) * 100);
}
