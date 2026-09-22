"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileBarChart,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ORG } from "@/lib/data";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/risks", label: "Risk Management", icon: ShieldAlert },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/vendors", label: "Third-Party Risk", icon: Network },
  { href: "/incidents", label: "Incidents", icon: Siren },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-slate-900 lg:flex">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
          N
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">
            NEXORA <span className="text-indigo-400">GRC</span>
          </p>
          <p className="text-[10px] leading-tight text-slate-400">
            Governance, Risk &amp; Compliance. Connected.
          </p>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-100">{ORG.name}</p>
            <p className="truncate text-[10px] text-slate-400">{ORG.industry}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Demo Environment
        </span>
      </div>
    </aside>
  );
}
