"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { badgeStyle, cn, formatDate, VENDOR_LEVEL_STYLES } from "@/lib/utils";
import { Badge, Card, inputClass, PageHeader, StatCard } from "@/components/ui";

function VendorsContent() {
  const { vendors } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState("");
  const [level, setLevel] = useState(params.get("level") ?? "All");
  const [status, setStatus] = useState(params.get("status") ?? "All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      if (level !== "All" && v.level !== level) return false;
      if (status !== "All" && v.assessmentStatus !== status) return false;
      if (q && !`${v.name} ${v.service} ${v.businessOwner}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [vendors, query, level, status]);

  const pending = vendors.filter(
    (v) => v.assessmentStatus === "Pending Review" || v.assessmentStatus === "Not Started",
  ).length;

  return (
    <div>
      <PageHeader
        title="Third-Party Risk Management"
        subtitle="Vendor portfolio risk, assessments and review schedule"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total Vendors" value={vendors.length} />
        <StatCard
          label="Low Risk"
          value={vendors.filter((v) => v.level === "Low").length}
          tone="success"
          onClick={() => setLevel("Low")}
        />
        <StatCard
          label="Medium Risk"
          value={vendors.filter((v) => v.level === "Medium").length}
          tone="warning"
          onClick={() => setLevel("Medium")}
        />
        <StatCard
          label="High Risk"
          value={vendors.filter((v) => v.level === "High").length}
          tone="danger"
          onClick={() => setLevel("High")}
        />
        <StatCard label="Assessments Pending" value={pending} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select className={cn(inputClass, "w-auto")} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="All">All risk levels</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select className={cn(inputClass, "w-auto")} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All assessment statuses</option>
          <option>Completed</option>
          <option>In Progress</option>
          <option>Pending Review</option>
          <option>Not Started</option>
          <option>Expiring Soon</option>
        </select>
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Business Owner</th>
              <th className="px-4 py-3 font-medium">Risk Score</th>
              <th className="px-4 py-3 font-medium">Risk Level</th>
              <th className="px-4 py-3 font-medium">Assessment Status</th>
              <th className="px-4 py-3 font-medium">Next Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((v) => (
              <tr
                key={v.id}
                onClick={() => router.push(`/vendors/${v.id}`)}
                className="cursor-pointer transition hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{v.name}</td>
                <td className="px-4 py-3 text-slate-600">{v.service}</td>
                <td className="px-4 py-3 text-slate-600">{v.businessOwner}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-900">{v.score}</span>
                  <span className="text-xs text-slate-400"> / 100</span>
                </td>
                <td className="px-4 py-3">
                  <Badge className={VENDOR_LEVEL_STYLES[v.level]}>{v.level} Risk</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={badgeStyle(v.assessmentStatus)}>{v.assessmentStatus}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(v.nextReview)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  No vendors match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <p className="mt-2 text-xs text-slate-400">
        Showing {filtered.length} of {vendors.length} vendors · Click a row to open the vendor
        profile and assessment.
      </p>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense>
      <VendorsContent />
    </Suspense>
  );
}
