"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { badgeStyle, cn, formatDate, RISK_LEVEL_STYLES } from "@/lib/utils";
import { Badge, Card, inputClass, PageHeader, StatCard } from "@/components/ui";

function IncidentsContent() {
  const { incidents } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState(params.get("severity") ?? "All");
  const [status, setStatus] = useState("All");

  const open = incidents.filter(
    (i) => i.status !== "Resolved" && i.status !== "Post-Incident Review",
  );
  const resolvedThisMonth = incidents.filter((i) => i.status === "Resolved").length;

  const q = query.trim().toLowerCase();
  const filtered = incidents.filter((i) => {
    if (severity !== "All" && i.severity !== severity) return false;
    if (status !== "All" && i.status !== status) return false;
    if (q && !`${i.id} ${i.title} ${i.category} ${i.assignedTo}`.toLowerCase().includes(q))
      return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Incident Management"
        subtitle="Track, investigate and resolve operational, security and privacy incidents"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Open Incidents" value={open.length} />
        <StatCard
          label="Critical"
          value={open.filter((i) => i.severity === "Critical").length}
          tone="danger"
          onClick={() => setSeverity("Critical")}
        />
        <StatCard
          label="High"
          value={open.filter((i) => i.severity === "High").length}
          tone="warning"
          onClick={() => setSeverity("High")}
        />
        <StatCard
          label="Under Investigation"
          value={incidents.filter((i) => i.status === "Investigating").length}
          onClick={() => setStatus("Investigating")}
        />
        <StatCard label="Resolved This Month" value={resolvedThisMonth} tone="success" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select className={cn(inputClass, "w-auto")} value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="All">All severities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select className={cn(inputClass, "w-auto")} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          <option>Reported</option>
          <option>Triaged</option>
          <option>Investigating</option>
          <option>Containment</option>
          <option>Remediation</option>
          <option>Resolved</option>
        </select>
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Incident ID</th>
              <th className="px-4 py-3 font-medium">Incident</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Reported By</th>
              <th className="px-4 py-3 font-medium">Assigned To</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reported</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((i) => (
              <tr
                key={i.id}
                onClick={() => router.push(`/incidents/${i.id}`)}
                className="cursor-pointer transition hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-indigo-600">{i.id}</td>
                <td className="max-w-72 px-4 py-3">
                  <span className="block truncate font-medium text-slate-900">{i.title}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{i.category}</td>
                <td className="px-4 py-3">
                  <Badge className={RISK_LEVEL_STYLES[i.severity]}>{i.severity}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{i.reportedBy}</td>
                <td className="px-4 py-3 text-slate-600">{i.assignedTo}</td>
                <td className="px-4 py-3">
                  <Badge className={badgeStyle(i.status)}>{i.status}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(i.reportedDate)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                  No incidents match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function IncidentsPage() {
  return (
    <Suspense>
      <IncidentsContent />
    </Suspense>
  );
}
