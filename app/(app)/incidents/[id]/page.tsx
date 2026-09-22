"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileText, ShieldAlert, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { badgeStyle, cn, formatDate, RISK_LEVEL_STYLES } from "@/lib/utils";
import type { IncidentStatus } from "@/lib/types";
import {
  Badge,
  Card,
  CardHeader,
  DetailItem,
  inputClass,
  PageHeader,
  Toast,
} from "@/components/ui";

const LIFECYCLE: IncidentStatus[] = [
  "Reported",
  "Triaged",
  "Investigating",
  "Containment",
  "Remediation",
  "Resolved",
  "Post-Incident Review",
];

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { incidents, risks, updateIncident, logActivity } = useApp();
  const [toast, setToast] = useState<string | null>(null);

  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Incident not found.{" "}
        <Link href="/incidents" className="font-medium text-indigo-600">
          Back to Incidents
        </Link>
      </div>
    );
  }

  const linkedRisks = risks.filter((r) => incident.linkedRisks.includes(r.id));
  const stageIndex = LIFECYCLE.indexOf(incident.status);

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/incidents")}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Incidents
      </button>

      <PageHeader
        title={`${incident.id} · ${incident.title}`}
        subtitle={incident.description}
        actions={
          <select
            className={cn(inputClass, "w-auto")}
            value={incident.status}
            onChange={(e) => {
              updateIncident(incident.id, { status: e.target.value as IncidentStatus });
              logActivity(
                `${incident.id} status changed to ${e.target.value}.`,
                `/incidents/${incident.id}`,
              );
              setToast(`Status updated to ${e.target.value}`);
              setTimeout(() => setToast(null), 3000);
            }}
          >
            {LIFECYCLE.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        }
      />

      <Card className="mb-5 px-5 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Incident Lifecycle
        </p>
        <ol className="flex flex-wrap items-center gap-y-3">
          {LIFECYCLE.map((stage, i) => (
            <li key={stage} className="flex items-center">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  i < stageIndex
                    ? "bg-emerald-50 text-emerald-700"
                    : i === stageIndex
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {stage}
              </span>
              {i < LIFECYCLE.length - 1 && (
                <span
                  className={cn(
                    "mx-1.5 h-px w-4 sm:w-6",
                    i < stageIndex ? "bg-emerald-300" : "bg-slate-200",
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardHeader title="Investigation Summary" />
            <dl className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <DetailItem label="Business Impact">{incident.businessImpact}</DetailItem>
              </div>
              <div className="sm:col-span-2">
                <DetailItem label="Root Cause">{incident.rootCause}</DetailItem>
              </div>
              <DetailItem label="Systems Affected">
                {incident.systemsAffected.length > 0
                  ? incident.systemsAffected.join(", ")
                  : "None identified"}
              </DetailItem>
              <DetailItem label="Category">{incident.category}</DetailItem>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Corrective Actions" />
            {incident.correctiveActions.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">
                No corrective actions recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {incident.correctiveActions.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                      {a.title}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <UserRound className="h-3.5 w-3.5" /> {a.owner}
                    </span>
                    <span className="text-xs text-slate-500">Due {formatDate(a.dueDate)}</span>
                    <Badge className={badgeStyle(a.status)}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Timeline" />
            <ol className="px-5 py-4">
              {incident.timeline.map((t, i) => (
                <li key={t.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < incident.timeline.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />
                  )}
                  <span className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{t.title}</p>
                    {t.detail && <p className="text-xs text-slate-500">{t.detail}</p>}
                    <p className="text-xs text-slate-400">
                      {formatDate(t.date)}
                      {t.actor ? ` · ${t.actor}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Details" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4">
              <DetailItem label="Severity">
                <Badge className={RISK_LEVEL_STYLES[incident.severity]}>{incident.severity}</Badge>
              </DetailItem>
              <DetailItem label="Status">
                <Badge className={badgeStyle(incident.status)}>{incident.status}</Badge>
              </DetailItem>
              <DetailItem label="Reported By">{incident.reportedBy}</DetailItem>
              <DetailItem label="Incident Owner">{incident.assignedTo}</DetailItem>
              <DetailItem label="Reported Date">{formatDate(incident.reportedDate)}</DetailItem>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Related Risks" subtitle="Risks connected to this incident" />
            {linkedRisks.length === 0 ? (
              <p className="px-5 py-5 text-sm text-slate-400">No related risks linked.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {linkedRisks.map((r) => (
                  <Link
                    key={r.id}
                    href={`/risks/${r.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0 text-orange-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {r.id} · {r.title}
                      </span>
                    </span>
                    <Badge className={RISK_LEVEL_STYLES[r.level]}>{r.level}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Attachments" />
            {incident.attachments.length === 0 ? (
              <p className="px-5 py-5 text-sm text-slate-400">No attachments.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {incident.attachments.map((a) => (
                  <li key={a.name} className="flex items-center gap-3 px-5 py-3">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {a.name}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {a.uploadedBy} · {formatDate(a.date)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
