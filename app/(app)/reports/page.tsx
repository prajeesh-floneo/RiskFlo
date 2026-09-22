"use client";

import { useState } from "react";
import { Download, Eye, FileBarChart, RefreshCw } from "lucide-react";
import { useApp } from "@/lib/store";
import { FRAMEWORKS, OVERALL_RISK_SCORE, REPORTS } from "@/lib/data";
import { complianceScore, formatDate } from "@/lib/utils";
import {
  btnPrimary,
  btnSecondary,
  Card,
  Modal,
  PageHeader,
  ProgressBar,
  Toast,
} from "@/components/ui";

export default function ReportsPage() {
  const { risks, controls, vendors, incidents } = useApp();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewName, setPreviewName] = useState("Executive GRC Summary");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const criticalRisks = risks.filter((r) => r.level === "Critical" && r.status !== "Closed");
  const highVendors = vendors.filter((v) => v.level === "High");
  const majorIncidents = incidents.filter(
    (i) =>
      (i.severity === "Critical" || i.severity === "High") &&
      i.status !== "Resolved" &&
      i.status !== "Post-Incident Review",
  );
  const overallCompliance = complianceScore(controls.map((c) => c.status));

  return (
    <div>
      <PageHeader
        title="Reports Centre"
        subtitle="Generate and export governance, risk and compliance reporting packs"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((rep) => (
          <Card key={rep.id} className="flex flex-col p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <FileBarChart className="h-4.5 w-4.5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{rep.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{rep.description}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {rep.frequency} · Last generated {formatDate(rep.lastGenerated)} · {rep.format}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setPreviewName(rep.name);
                  setPreviewOpen(true);
                }}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => notify(`${rep.name} regenerated with current data (simulated)`)}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Generate
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => notify(`${rep.name}.pdf export queued (simulated)`)}
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Preview · ${previewName}`}
        wide
      >
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Apex Technologies Ltd. · September 2026 · Prepared by Sarah Mathew
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <p className="text-xl font-semibold text-amber-600">{OVERALL_RISK_SCORE}/100</p>
              <p className="text-[11px] text-slate-500">Overall Risk Rating (Moderate)</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <p className="text-xl font-semibold text-emerald-600">{overallCompliance}%</p>
              <p className="text-[11px] text-slate-500">Compliance Score</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <p className="text-xl font-semibold text-red-600">{criticalRisks.length}</p>
              <p className="text-[11px] text-slate-500">Critical Risks</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-center">
              <p className="text-xl font-semibold text-red-600">{majorIncidents.length}</p>
              <p className="text-[11px] text-slate-500">Major Open Incidents</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Compliance by Framework
            </p>
            <div className="space-y-2.5">
              {FRAMEWORKS.map((fw) => {
                const score = complianceScore(
                  controls.filter((c) => c.frameworkId === fw.id).map((c) => c.status),
                );
                return (
                  <div key={fw.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-600">{fw.shortName}</span>
                      <span className="font-semibold text-slate-900">{score}%</span>
                    </div>
                    <ProgressBar value={score} />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vendor Risk
            </p>
            <p className="text-sm text-slate-700">
              {vendors.length} active vendors; {highVendors.length} classified high risk (
              {highVendors.map((v) => v.name).join(", ")}). Nexus Outsourcing reassessment is due
              within 14 days.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Key Recommendations
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Complete EDR and immutable backup rollout to reduce ransomware exposure (RISK-001).</li>
              <li>Close the ISO 27001 A.8.12 data leakage prevention gap in Q4 2026.</li>
              <li>Finalise Nexus Outsourcing reassessment and remediation plan before contract renewal.</li>
              <li>Conclude INC-014 forensic investigation and enforce phishing-resistant MFA for privileged accounts.</li>
              <li>Progress data localisation remediation to avoid regulatory penalties (RISK-012).</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </button>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                setPreviewOpen(false);
                notify(`${previewName}.pdf export queued (simulated)`);
              }}
            >
              <Download className="h-4 w-4" /> Export PDF
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toast} />
    </div>
  );
}
