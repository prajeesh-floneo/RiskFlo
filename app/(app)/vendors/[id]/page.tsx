"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Award, FileText, Lightbulb, ShieldAlert } from "lucide-react";
import { useApp } from "@/lib/store";
import { VENDOR_QUESTIONS } from "@/lib/data";
import {
  badgeStyle,
  classifyVendor,
  cn,
  formatDate,
  RISK_LEVEL_STYLES,
  VENDOR_LEVEL_STYLES,
} from "@/lib/utils";
import {
  Badge,
  btnPrimary,
  Card,
  CardHeader,
  DetailItem,
  PageHeader,
  ProgressBar,
  Tabs,
  Toast,
} from "@/components/ui";

type Answer = "Yes" | "Partially" | "No" | "Not Applicable";
const OPTIONS: Answer[] = ["Yes", "Partially", "No", "Not Applicable"];

// vq6 asks about breaches in the last 24 months — "No" is the positive answer.
const INVERTED = new Set(["vq6"]);

const SECTION_TO_CATEGORY: Record<string, string> = {
  Cybersecurity: "Cybersecurity",
  "Data Privacy": "Privacy",
  "Business Continuity": "Business Continuity",
  Compliance: "Compliance",
  "Financial Stability": "Financial Stability",
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { vendors, risks, updateVendor, logActivity } = useApp();
  const [tab, setTab] = useState("Overview");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<null | {
    overall: number;
    level: "Low" | "Medium" | "High";
    categories: { category: string; score: number }[];
    gaps: number;
    highGaps: number;
    recs: string[];
  }>(null);
  const [toast, setToast] = useState<string | null>(null);

  const vendor = vendors.find((v) => v.id === id);
  const linkedRisks = useMemo(
    () => risks.filter((r) => vendor?.linkedRisks.includes(r.id) || (vendor && r.linkedVendors.includes(vendor.id))),
    [risks, vendor],
  );

  if (!vendor) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Vendor not found.{" "}
        <Link href="/vendors" className="font-medium text-indigo-600">
          Back to Third-Party Risk
        </Link>
      </div>
    );
  }

  const answered = Object.keys(answers).length;

  const scoreValue = (a: Answer, inverted: boolean): number | null => {
    if (a === "Not Applicable") return null;
    if (inverted) return a === "No" ? 1 : a === "Partially" ? 0.5 : 0;
    return a === "Yes" ? 1 : a === "Partially" ? 0.5 : 0;
  };

  const completeAssessment = () => {
    const bySection = new Map<string, { points: number; count: number }>();
    let points = 0;
    let count = 0;
    let gaps = 0;
    let highGaps = 0;
    for (const q of VENDOR_QUESTIONS) {
      const a = answers[q.id];
      if (!a) continue;
      const val = scoreValue(a, INVERTED.has(q.id));
      if (val === null) continue;
      points += val;
      count += 1;
      if (val === 0) {
        gaps += 1;
        if (q.section === "Cybersecurity" || q.section === "Data Privacy") highGaps += 1;
      } else if (val === 0.5) {
        gaps += 1;
      }
      const entry = bySection.get(q.section) ?? { points: 0, count: 0 };
      entry.points += val;
      entry.count += 1;
      bySection.set(q.section, entry);
    }
    const overall = count === 0 ? 0 : Math.round((points / count) * 100);
    const level = classifyVendor(overall);
    const categories = Object.entries(SECTION_TO_CATEGORY)
      .map(([section, category]) => {
        const entry = bySection.get(section);
        return {
          category,
          score: entry && entry.count > 0 ? Math.round((entry.points / entry.count) * 100) : overall,
        };
      });
    const recs: string[] = [];
    for (const q of VENDOR_QUESTIONS) {
      const a = answers[q.id];
      if (!a) continue;
      const val = scoreValue(a, INVERTED.has(q.id));
      if (val !== null && val < 1) {
        recs.push(
          INVERTED.has(q.id)
            ? "Request the vendor's breach post-incident report and remediation evidence."
            : `Remediate: ${q.text.replace(/^Does the vendor /i, "").replace(/\?$/, "")}.`,
        );
      }
    }
    setResult({ overall, level, categories, gaps, highGaps, recs: recs.slice(0, 6) });
    updateVendor(vendor.id, {
      score: overall,
      level,
      assessmentStatus: "Completed",
      lastAssessment: new Date().toISOString().slice(0, 10),
      categoryScores: categories,
    });
    logActivity(
      `Vendor ${vendor.name} assessment completed (score ${overall}/100, ${level} Risk).`,
      `/vendors/${vendor.id}`,
    );
    setToast("Assessment completed — vendor risk score updated");
    setTimeout(() => setToast(null), 3500);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/vendors")}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Third-Party Risk
      </button>

      <PageHeader
        title={vendor.name}
        subtitle={`${vendor.service} · Business owner: ${vendor.businessOwner}`}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-semibold text-slate-900">
                {vendor.score}
                <span className="text-sm font-normal text-slate-400"> / 100</span>
              </p>
              <p className="text-xs text-slate-500">Overall risk score</p>
            </div>
            <Badge className={VENDOR_LEVEL_STYLES[vendor.level]}>{vendor.level} Risk</Badge>
          </div>
        }
      />

      <Tabs
        tabs={["Overview", "Assessment", "Risks", "Documents", "Activity"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Overview" && (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader title="Vendor Profile" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4 sm:grid-cols-3">
              <DetailItem label="Vendor Owner">{vendor.businessOwner}</DetailItem>
              <DetailItem label="Criticality">{vendor.criticality}</DetailItem>
              <DetailItem label="Data Access Level">{vendor.dataAccess}</DetailItem>
              <DetailItem label="Contract Renewal">{formatDate(vendor.contractRenewal)}</DetailItem>
              <DetailItem label="Last Assessment">{formatDate(vendor.lastAssessment)}</DetailItem>
              <DetailItem label="Next Assessment">{formatDate(vendor.nextReview)}</DetailItem>
              <DetailItem label="Assessment Status">
                <Badge className={badgeStyle(vendor.assessmentStatus)}>
                  {vendor.assessmentStatus}
                </Badge>
              </DetailItem>
              <DetailItem label="Risk Classification">
                <Badge className={VENDOR_LEVEL_STYLES[vendor.level]}>{vendor.level} Risk</Badge>
              </DetailItem>
            </dl>
            <div className="border-t border-slate-100 px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Certifications
              </p>
              {vendor.certifications.length === 0 ? (
                <p className="text-sm text-slate-400">No certifications on file.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {vendor.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      <Award className="h-3.5 w-3.5 text-indigo-500" />
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Assessment Scores" subtitle="By assessment domain" />
            <div className="space-y-4 px-5 py-4">
              {vendor.categoryScores.map((cs) => (
                <div key={cs.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">{cs.category}</span>
                    <span className="font-semibold text-slate-900">{cs.score}%</span>
                  </div>
                  <ProgressBar value={cs.score} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "Assessment" && (
        <div className="mt-5">
          {result && (
            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <Card>
                <CardHeader title="Assessment Result" />
                <div className="px-5 py-5 text-center">
                  <p className="text-5xl font-semibold text-slate-900">{result.overall}%</p>
                  <div className="mt-2">
                    <Badge className={VENDOR_LEVEL_STYLES[result.level]}>
                      Classification: {result.level} Risk
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    {result.level === "Low"
                      ? "Vendor can proceed under standard monitoring."
                      : result.level === "Medium"
                        ? "Vendor can proceed subject to remediation of identified gaps."
                        : "Vendor requires remediation and senior approval before proceeding."}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Configurable assessment recommendation — final decision remains with the
                    business.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-amber-50 py-2">
                      <p className="text-base font-semibold text-amber-700">{result.gaps}</p>
                      Gaps found
                    </div>
                    <div className="rounded-lg bg-red-50 py-2">
                      <p className="text-base font-semibold text-red-700">{result.highGaps}</p>
                      High priority
                    </div>
                    <div className="rounded-lg bg-indigo-50 py-2">
                      <p className="text-base font-semibold text-indigo-700">{result.recs.length}</p>
                      Actions
                    </div>
                  </div>
                </div>
              </Card>
              <Card>
                <CardHeader title="Domain Scores" />
                <div className="space-y-4 px-5 py-4">
                  {result.categories.map((cs) => (
                    <div key={cs.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-600">{cs.category}</span>
                        <span className="font-semibold text-slate-900">{cs.score}%</span>
                      </div>
                      <ProgressBar value={cs.score} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <CardHeader title="Recommended Actions" />
                <ul className="space-y-2.5 px-5 py-4">
                  {result.recs.length === 0 && (
                    <li className="text-sm text-emerald-700">No remediation actions required.</li>
                  )}
                  {result.recs.map((rec) => (
                    <li key={rec} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader
              title="Third-Party Assessment Questionnaire"
              subtitle={`${answered} of ${VENDOR_QUESTIONS.length} questions answered · answers drive the simulated vendor score`}
            />
            <div className="divide-y divide-slate-100">
              {VENDOR_QUESTIONS.map((q, i) => (
                <div key={q.id} className="px-5 py-4">
                  {(i === 0 || VENDOR_QUESTIONS[i - 1].section !== q.section) && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {q.section}
                    </p>
                  )}
                  <p className="text-sm font-medium text-slate-800">{q.text}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm transition",
                          answers[q.id] === opt
                            ? "border-indigo-600 bg-indigo-50 font-medium text-indigo-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                className={btnPrimary}
                disabled={answered === 0}
                onClick={completeAssessment}
              >
                Complete Assessment &amp; Recalculate Score
              </button>
            </div>
          </Card>
        </div>
      )}

      {tab === "Risks" && (
        <Card className="mt-5">
          <CardHeader
            title="Linked Risks"
            subtitle="Risks in the enterprise register connected to this vendor"
          />
          {linkedRisks.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">
              No risks are currently linked to this vendor.
            </p>
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
                    <span className="block text-sm font-medium text-slate-900">
                      {r.id} · {r.title}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {r.category} · Owner {r.owner}
                    </span>
                  </span>
                  <Badge className={RISK_LEVEL_STYLES[r.level]}>{r.level}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "Documents" && (
        <Card className="mt-5">
          <CardHeader title="Documents" subtitle="Contracts, reports and certifications on file" />
          {vendor.documents.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">No documents uploaded for this vendor.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {vendor.documents.map((d) => (
                <li key={d.name} className="flex items-center gap-3 px-5 py-3">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{d.name}</span>
                    <span className="block text-xs text-slate-400">
                      Uploaded by {d.uploadedBy} · {formatDate(d.date)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "Activity" && (
        <Card className="mt-5">
          <CardHeader title="Activity" />
          <ol className="px-5 py-4">
            {vendor.activity.map((t, i) => (
              <li key={t.id} className="relative flex gap-3 pb-5 last:pb-0">
                {i < vendor.activity.length - 1 && (
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
      )}

      <Toast message={toast} />
    </div>
  );
}
