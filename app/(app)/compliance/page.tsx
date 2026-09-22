"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { FRAMEWORKS } from "@/lib/data";
import { complianceScore } from "@/lib/utils";
import { Card, PageHeader, ProgressBar } from "@/components/ui";

export default function CompliancePage() {
  const { controls } = useApp();

  const overall = complianceScore(controls.map((c) => c.status));

  return (
    <div>
      <PageHeader
        title="Compliance Management"
        subtitle={`Overall compliance score ${overall}% across ${FRAMEWORKS.length} active frameworks`}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {FRAMEWORKS.map((fw) => {
          const fwControls = controls.filter((c) => c.frameworkId === fw.id);
          const compliant = fwControls.filter((c) => c.status === "Compliant").length;
          const partial = fwControls.filter((c) => c.status === "Partial").length;
          const non = fwControls.filter((c) => c.status === "Non-Compliant").length;
          const evidencePending = fwControls.filter(
            (c) => c.evidence.length === 0 && c.status !== "Compliant",
          ).length;
          const score = complianceScore(fwControls.map((c) => c.status));
          return (
            <Card key={fw.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3 px-5 pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{fw.shortName}</h3>
                    <p className="text-xs text-slate-500">{fw.name}</p>
                  </div>
                </div>
                <span className="text-2xl font-semibold text-slate-900">{score}%</span>
              </div>
              <div className="px-5 pt-4">
                <ProgressBar value={score} />
                <p className="mt-2 text-xs text-slate-500">{fw.description}</p>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 px-5 py-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-emerald-600">{compliant}</p>
                  <p className="text-[11px] text-slate-500">Compliant</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-600">{partial}</p>
                  <p className="text-[11px] text-slate-500">Partial</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-red-600">{non}</p>
                  <p className="text-[11px] text-slate-500">Non-Compliant</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700">{evidencePending}</p>
                  <p className="text-[11px] text-slate-500">Evidence Pending</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3">
                <Link
                  href={`/compliance/${fw.id}/assessment`}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Run Assessment
                </Link>
                <Link
                  href={`/compliance/${fw.id}`}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View Controls <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Additional frameworks (e.g. PCI DSS, HIPAA, local regulations) can be configured per
        organisation in Settings → Frameworks.
      </p>
    </div>
  );
}
