import Link from "next/link";
import {
  ArrowRight,
  FileBarChart,
  Network,
  ShieldAlert,
  ShieldCheck,
  Siren,
  LayoutDashboard,
} from "lucide-react";
import { ORG } from "@/lib/data";

const MODULES = [
  { icon: LayoutDashboard, label: "Executive Dashboard" },
  { icon: ShieldAlert, label: "Risk Management" },
  { icon: ShieldCheck, label: "Compliance" },
  { icon: Network, label: "Third-Party Risk" },
  { icon: Siren, label: "Incident Management" },
  { icon: FileBarChart, label: "Reports" },
];

export default function EntryPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold text-white">
              N
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-wide text-white">
                NEXORA <span className="text-indigo-400">GRC</span>
              </h1>
              <p className="text-xs text-slate-400">
                Governance, Risk &amp; Compliance. Connected.
              </p>
            </div>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-slate-300">
            One platform to manage enterprise risks, compliance frameworks,
            third-party exposure and incidents — with executive visibility
            across all of it.
          </p>

          <div className="mb-6 grid grid-cols-2 gap-2">
            {MODULES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span className="text-xs text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-lg border border-slate-800 bg-slate-800/40 px-4 py-3">
            <p className="text-xs text-slate-400">Demo workspace</p>
            <p className="mt-0.5 text-sm font-medium text-slate-200">{ORG.name}</p>
            <p className="text-xs text-slate-400">
              {ORG.industry} · {ORG.employees.toLocaleString()} employees ·{" "}
              {ORG.locations.join(", ")}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Enter Demo Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-4 text-center text-[11px] text-slate-500">
            Demo environment · No sign-in required · Signed in as Sarah Mathew,
            Risk &amp; Compliance Manager
          </p>
        </div>
      </div>
    </main>
  );
}
