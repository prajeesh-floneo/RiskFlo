"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Network, ShieldCheck, Siren, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { OWNERS } from "@/lib/data";
import {
  badgeStyle,
  classifyRisk,
  cn,
  formatDate,
  RISK_LEVEL_STYLES,
} from "@/lib/utils";
import type { RiskStatus } from "@/lib/types";
import {
  Badge,
  btnSecondary,
  Card,
  CardHeader,
  DetailItem,
  Field,
  inputClass,
  Modal,
  PageHeader,
  Toast,
  btnPrimary,
} from "@/components/ui";
import { RiskMatrix } from "@/components/RiskMatrix";

const STATUSES: RiskStatus[] = ["Open", "In Progress", "Under Review", "Closed"];

export default function RiskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { risks, controls, vendors, incidents, updateRisk, logActivity } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const risk = risks.find((r) => r.id === id);

  if (!risk) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Risk {id} was not found in the register.</p>
        <Link href="/risks" className="mt-3 inline-block text-sm font-medium text-indigo-600">
          Back to Risk Register
        </Link>
      </div>
    );
  }

  const inherent = risk.likelihood * risk.impact;
  const residual = risk.residualLikelihood * risk.residualImpact;
  const linkedControls = controls.filter((c) => risk.linkedControls.includes(c.id));
  const linkedVendors = vendors.filter((v) => risk.linkedVendors.includes(v.id));
  const linkedIncidents = incidents.filter((i) => risk.linkedIncidents.includes(i.id));

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/risks")}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Risk Register
      </button>

      <PageHeader
        title={`${risk.id} · ${risk.title}`}
        subtitle={risk.description}
        actions={
          <>
            <select
              className={cn(inputClass, "w-auto")}
              value={risk.status}
              onChange={(e) => {
                updateRisk(risk.id, { status: e.target.value as RiskStatus });
                logActivity(`${risk.id} status changed to ${e.target.value}.`, `/risks/${risk.id}`);
                notify(`Status updated to ${e.target.value}`);
              }}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button type="button" className={btnSecondary} onClick={() => setEditOpen(true)}>
              Edit Risk
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardHeader title="Risk Assessment" subtitle="Likelihood × Impact = Risk Score" />
            <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-4">
              <DetailItem label="Likelihood">{risk.likelihood} / 5</DetailItem>
              <DetailItem label="Impact">{risk.impact} / 5</DetailItem>
              <DetailItem label="Inherent Risk Score">
                <span className="text-lg font-semibold">{inherent}</span>{" "}
                <Badge className={RISK_LEVEL_STYLES[classifyRisk(inherent)]}>
                  {classifyRisk(inherent)}
                </Badge>
              </DetailItem>
              <DetailItem label="Residual Risk Score">
                <span className="text-lg font-semibold">{residual}</span>{" "}
                <Badge className={RISK_LEVEL_STYLES[classifyRisk(residual)]}>
                  {classifyRisk(residual)}
                </Badge>
              </DetailItem>
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <RiskMatrix
                risks={risks}
                highlight={{ likelihood: risk.likelihood, impact: risk.impact }}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Risk Treatment Plan"
              subtitle={`Strategy: ${risk.treatment} · Treatment owner: ${risk.treatmentOwner}`}
            />
            {risk.treatmentPlan.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">
                No treatment actions defined yet for this risk.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {risk.treatmentPlan.map((a) => (
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
            <CardHeader title="Activity Timeline" />
            <ol className="space-y-0 px-5 py-4">
              {risk.timeline.map((t, i) => (
                <li key={t.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < risk.timeline.length - 1 && (
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
              <DetailItem label="Category">{risk.category}</DetailItem>
              <DetailItem label="Department">{risk.department}</DetailItem>
              <DetailItem label="Risk Owner">{risk.owner}</DetailItem>
              <DetailItem label="Treatment Owner">{risk.treatmentOwner}</DetailItem>
              <DetailItem label="Status">
                <Badge className={badgeStyle(risk.status)}>{risk.status}</Badge>
              </DetailItem>
              <DetailItem label="Treatment">{risk.treatment}</DetailItem>
              <DetailItem label="Date Identified">{formatDate(risk.dateIdentified)}</DetailItem>
              <DetailItem label="Last Reviewed">{formatDate(risk.lastReviewed)}</DetailItem>
              <DetailItem label="Next Review">{formatDate(risk.reviewDate)}</DetailItem>
              <div className="col-span-2">
                <DetailItem label="Risk Appetite / Threshold">{risk.appetite}</DetailItem>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Connected Records"
              subtitle="Controls, vendors and incidents linked to this risk"
            />
            <div className="space-y-4 px-5 py-4">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> Linked Controls
                </p>
                {linkedControls.length === 0 && (
                  <p className="text-sm text-slate-400">None linked.</p>
                )}
                {linkedControls.map((c) => (
                  <Link
                    key={c.id}
                    href={`/compliance/${c.frameworkId}?control=${encodeURIComponent(c.id)}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-indigo-600 hover:bg-slate-50"
                  >
                    {c.id} · {c.title}
                  </Link>
                ))}
              </div>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Network className="h-3.5 w-3.5" /> Linked Vendors
                </p>
                {linkedVendors.length === 0 && (
                  <p className="text-sm text-slate-400">None linked.</p>
                )}
                {linkedVendors.map((v) => (
                  <Link
                    key={v.id}
                    href={`/vendors/${v.id}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-indigo-600 hover:bg-slate-50"
                  >
                    {v.name} · {v.service}
                  </Link>
                ))}
              </div>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Siren className="h-3.5 w-3.5" /> Linked Incidents
                </p>
                {linkedIncidents.length === 0 && (
                  <p className="text-sm text-slate-400">None linked.</p>
                )}
                {linkedIncidents.map((i) => (
                  <Link
                    key={i.id}
                    href={`/incidents/${i.id}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-indigo-600 hover:bg-slate-50"
                  >
                    {i.id} · {i.title}
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <EditRiskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        riskId={risk.id}
        onSaved={() => {
          setEditOpen(false);
          notify("Risk updated");
        }}
      />
      <Toast message={toast} />
    </div>
  );
}

function EditRiskModal({
  open,
  onClose,
  riskId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  riskId: string;
  onSaved: () => void;
}) {
  const { risks, updateRisk, logActivity } = useApp();
  const risk = risks.find((r) => r.id === riskId);
  const [owner, setOwner] = useState(risk?.owner ?? OWNERS[0]);
  const [likelihood, setLikelihood] = useState(risk?.likelihood ?? 3);
  const [impact, setImpact] = useState(risk?.impact ?? 3);
  const [reviewDate, setReviewDate] = useState(risk?.reviewDate ?? "2026-12-31");

  if (!risk) return null;
  const score = likelihood * impact;

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${risk.id}`}>
      <div className="space-y-4">
        <Field label="Risk Owner">
          <select className={inputClass} value={owner} onChange={(e) => setOwner(e.target.value)}>
            {OWNERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={`Likelihood: ${likelihood} / 5`}>
            <input
              type="range"
              min={1}
              max={5}
              value={likelihood}
              onChange={(e) => setLikelihood(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </Field>
          <Field label={`Impact: ${impact} / 5`}>
            <input
              type="range"
              min={1}
              max={5}
              value={impact}
              onChange={(e) => setImpact(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </Field>
        </div>
        <Field label="Next Review Date">
          <input
            type="date"
            className={inputClass}
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
          />
        </Field>
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          New score: <span className="font-semibold">{score}</span> ·{" "}
          <Badge className={RISK_LEVEL_STYLES[classifyRisk(score)]}>
            {classifyRisk(score)}
          </Badge>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              updateRisk(risk.id, {
                owner,
                likelihood,
                impact,
                level: classifyRisk(score),
                lastReviewed: new Date().toISOString().slice(0, 10),
                reviewDate,
              });
              logActivity(`${risk.id} reassessed (score ${score}).`, `/risks/${risk.id}`);
              onSaved();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
