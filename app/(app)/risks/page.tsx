"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowUpDown, Plus, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { DEPARTMENTS, RISK_CATEGORIES } from "@/lib/data";
import {
  badgeStyle,
  cn,
  formatDate,
  RISK_LEVEL_STYLES,
} from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";
import {
  Badge,
  btnPrimary,
  Card,
  inputClass,
  PageHeader,
  Tabs,
  Toast,
} from "@/components/ui";
import { AddRiskModal } from "@/components/AddRiskModal";
import { RiskMatrix } from "@/components/RiskMatrix";

const LEVELS: RiskLevel[] = ["Critical", "High", "Medium", "Low"];

function RisksContent() {
  const { risks } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab] = useState("Risk Register");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState(params.get("level") ?? "All");
  const [category, setCategory] = useState("All");
  const [department, setDepartment] = useState("All");
  const [sortByScore, setSortByScore] = useState<"desc" | "asc">("desc");
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return risks
      .filter((r) => {
        if (level !== "All" && r.level !== level) return false;
        if (category !== "All" && r.category !== category) return false;
        if (department !== "All" && r.department !== department) return false;
        if (
          q &&
          !`${r.id} ${r.title} ${r.owner} ${r.category} ${r.department}`
            .toLowerCase()
            .includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        const sa = a.likelihood * a.impact;
        const sb = b.likelihood * b.impact;
        return sortByScore === "desc" ? sb - sa : sa - sb;
      });
  }, [risks, query, level, category, department, sortByScore]);

  return (
    <div>
      <PageHeader
        title="Risk Management"
        subtitle={`Central risk register · ${risks.length} risks tracked across ${new Set(risks.map((r) => r.department)).size} departments`}
        actions={
          <button type="button" className={btnPrimary} onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Risk
          </button>
        }
      />

      <Tabs
        tabs={["Risk Register", "Risk Matrix"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Risk Register" && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search risks…"
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <select className={cn(inputClass, "w-auto")} value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="All">All severities</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select className={cn(inputClass, "w-auto")} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              {RISK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className={cn(inputClass, "w-auto")} value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="All">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <Card className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Risk ID</th>
                  <th className="px-4 py-3 font-medium">Risk Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">L</th>
                  <th className="px-4 py-3 font-medium">I</th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      className="flex items-center gap-1 uppercase tracking-wide hover:text-slate-700"
                      onClick={() => setSortByScore(sortByScore === "desc" ? "asc" : "desc")}
                    >
                      Score <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">Level</th>
                  <th className="px-4 py-3 font-medium">Treatment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/risks/${r.id}`)}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-indigo-600">{r.id}</td>
                    <td className="max-w-64 px-4 py-3">
                      <span className="block truncate font-medium text-slate-900">{r.title}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.category}</td>
                    <td className="px-4 py-3 text-slate-600">{r.department}</td>
                    <td className="px-4 py-3 text-slate-600">{r.owner}</td>
                    <td className="px-4 py-3 text-slate-600">{r.likelihood}</td>
                    <td className="px-4 py-3 text-slate-600">{r.impact}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {r.likelihood * r.impact}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={RISK_LEVEL_STYLES[r.level]}>{r.level}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.treatment}</td>
                    <td className="px-4 py-3">
                      <Badge className={badgeStyle(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(r.reviewDate)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-sm text-slate-500">
                      No risks match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
          <p className="mt-2 text-xs text-slate-400">
            Showing {filtered.length} of {risks.length} risks · Click a row to open the risk detail.
          </p>
        </>
      )}

      {tab === "Risk Matrix" && (
        <Card className="mt-4 p-5">
          <p className="mb-4 text-sm text-slate-600">
            Interactive 5×5 heatmap of the current risk register (likelihood × impact).
            Click a cell to see the risks plotted in it.
          </p>
          <RiskMatrix risks={risks} />
        </Card>
      )}

      <AddRiskModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(id) => {
          setAddOpen(false);
          setToast(`${id} added to the risk register`);
          setTimeout(() => setToast(null), 3500);
        }}
      />
      <Toast message={toast} />
    </div>
  );
}

export default function RisksPage() {
  return (
    <Suspense>
      <RisksContent />
    </Suspense>
  );
}
