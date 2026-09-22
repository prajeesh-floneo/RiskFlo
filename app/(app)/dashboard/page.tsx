"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { useApp } from "@/lib/store";
import {
  CONTROLS_IMPLEMENTED,
  FRAMEWORKS,
  OVERALL_RISK_SCORE,
  RISK_TREND,
} from "@/lib/data";
import { complianceScore, formatDate } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";
import { Card, CardHeader, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { RiskDonut, RiskTrendChart } from "@/components/charts";

export default function DashboardPage() {
  const { risks, controls, vendors, incidents, activity } = useApp();
  const router = useRouter();

  const openRisks = risks.filter((r) => r.status !== "Closed");
  const counts: Record<RiskLevel, number> = {
    Critical: openRisks.filter((r) => r.level === "Critical").length,
    High: openRisks.filter((r) => r.level === "High").length,
    Medium: openRisks.filter((r) => r.level === "Medium").length,
    Low: openRisks.filter((r) => r.level === "Low").length,
  };

  const highRiskVendors = vendors.filter((v) => v.level === "High").length;
  const openIncidents = incidents.filter(
    (i) => i.status !== "Resolved" && i.status !== "Post-Incident Review",
  );
  const criticalIncidents = openIncidents.filter((i) => i.severity === "Critical").length;

  const overallCompliance = complianceScore(controls.map((c) => c.status));

  const evidencePending = controls.filter((c) => c.evidence.length === 0 && c.status !== "Compliant").length + 7;
  const pendingVendorReviews = vendors.filter((v) => v.assessmentStatus === "Pending Review").length;
  const criticalNeedTreatment = openRisks.filter(
    (r) => r.level === "Critical" && r.status !== "Under Review",
  ).length;

  const priorityActions = [
    {
      label: `${criticalNeedTreatment} Critical Risks Require Treatment`,
      href: "/risks?level=Critical",
    },
    {
      label: `${pendingVendorReviews} Vendor Assessments Pending Review`,
      href: "/vendors?status=Pending Review",
    },
    {
      label: `${evidencePending} Compliance Controls Need Evidence`,
      href: "/compliance",
    },
    {
      label: `${criticalIncidents} High Severity Incident Requires Investigation`,
      href: "/incidents?severity=Critical",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Apex Technologies Ltd. · Consolidated governance, risk and compliance posture"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Overall Risk Score"
          value={`${OVERALL_RISK_SCORE} / 100`}
          sub="Moderate Risk · improving"
          tone="warning"
          icon={<TrendingDown className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          label="Compliance Score"
          value={`${overallCompliance}%`}
          sub="Across 4 frameworks"
          tone="success"
          icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
          onClick={() => router.push("/compliance")}
        />
        <StatCard
          label="Open Risks"
          value={openRisks.length}
          sub={`${counts.Critical} critical`}
          onClick={() => router.push("/risks")}
        />
        <StatCard
          label="Critical Risks"
          value={counts.Critical}
          tone="danger"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          onClick={() => router.push("/risks?level=Critical")}
        />
        <StatCard
          label="Controls Implemented"
          value={`${CONTROLS_IMPLEMENTED}%`}
          sub="Across all frameworks"
          onClick={() => router.push("/compliance")}
        />
        <StatCard
          label="Active Vendors"
          value={vendors.length}
          sub={`${vendors.filter((v) => v.assessmentStatus === "Pending Review" || v.assessmentStatus === "Not Started").length} assessments pending`}
          onClick={() => router.push("/vendors")}
        />
        <StatCard
          label="High-Risk Vendors"
          value={highRiskVendors}
          tone="danger"
          onClick={() => router.push("/vendors?level=High")}
        />
        <StatCard
          label="Open Incidents"
          value={openIncidents.length}
          onClick={() => router.push("/incidents")}
        />
        <StatCard
          label="Critical Incidents"
          value={criticalIncidents}
          tone="danger"
          onClick={() => router.push("/incidents?severity=Critical")}
        />
        <StatCard
          label="Compliance Frameworks"
          value={FRAMEWORKS.length}
          sub="ISO · SOC 2 · GDPR · NIST"
          onClick={() => router.push("/compliance")}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader title="Risk Distribution" subtitle="Open risks by severity level" />
          <div className="px-5 py-4">
            <RiskDonut counts={counts} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Risk Trend"
            subtitle="Overall risk score, last 6 months (lower is better)"
          />
          <div className="px-3 py-4">
            <RiskTrendChart data={RISK_TREND} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Compliance Overview" subtitle="Framework compliance scores" />
          <div className="space-y-4 px-5 py-4">
            {FRAMEWORKS.map((fw) => {
              const score = complianceScore(
                controls.filter((c) => c.frameworkId === fw.id).map((c) => c.status),
              );
              return (
                <Link key={fw.id} href={`/compliance/${fw.id}`} className="block">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 hover:text-indigo-600">
                      {fw.shortName}
                    </span>
                    <span className="font-semibold text-slate-900">{score}%</span>
                  </div>
                  <ProgressBar value={score} />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Priority Actions"
            subtitle="Items requiring attention across GRC modules"
          />
          <div className="divide-y divide-slate-100">
            {priorityActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center justify-between px-5 py-3 transition hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 text-sm text-slate-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  {a.label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" subtitle="Latest changes across the platform" />
          <div className="divide-y divide-slate-100">
            {activity.slice(0, 5).map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className="flex items-start gap-3 px-5 py-3 transition hover:bg-slate-50"
              >
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <span>
                  <span className="block text-sm text-slate-700">{a.message}</span>
                  <span className="block text-xs text-slate-400">{formatDate(a.date)}</span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
