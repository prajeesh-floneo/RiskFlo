"use client";

import { useState } from "react";
import { Bell, Plug, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";
import { DEPARTMENTS, FRAMEWORKS, ORG, ROLES, SETTINGS_USERS } from "@/lib/data";
import { badgeStyle, cn } from "@/lib/utils";
import {
  Badge,
  btnPrimary,
  Card,
  CardHeader,
  Field,
  inputClass,
  PageHeader,
  Tabs,
  Toast,
} from "@/components/ui";

const TABS = [
  "Organisation",
  "Risk Scoring",
  "Users & Roles",
  "Frameworks",
  "Notifications",
  "Integrations",
];

const INTEGRATIONS = [
  { name: "Microsoft Entra ID", description: "Single sign-on and user provisioning", connected: true },
  { name: "Jira", description: "Sync treatment actions and corrective actions", connected: true },
  { name: "Slack / Teams", description: "Notify channels on escalations", connected: false },
  { name: "ServiceNow", description: "Bi-directional incident sync", connected: false },
  { name: "AWS Security Hub", description: "Ingest cloud security findings", connected: false },
];

const NOTIFICATION_PREFS = [
  { label: "Risk review reminders", enabled: true },
  { label: "Critical risk escalations", enabled: true },
  { label: "Vendor assessment expiry alerts", enabled: true },
  { label: "Compliance evidence due dates", enabled: true },
  { label: "Incident escalations", enabled: true },
  { label: "Weekly executive digest", enabled: false },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("Organisation");
  const [toast, setToast] = useState<string | null>(null);
  const [prefs, setPrefs] = useState(NOTIFICATION_PREFS);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure the platform for your organisation — frameworks, scoring, roles and integrations are all adjustable per customer"
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Organisation" && (
        <Card className="mt-5 max-w-2xl">
          <CardHeader title="Organisation Profile" />
          <div className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Organisation Name">
                <input className={inputClass} defaultValue={ORG.name} />
              </Field>
              <Field label="Industry">
                <input className={inputClass} defaultValue={ORG.industry} />
              </Field>
              <Field label="Employees">
                <input className={inputClass} defaultValue={String(ORG.employees)} />
              </Field>
              <Field label="Locations">
                <input className={inputClass} defaultValue={ORG.locations.join(", ")} />
              </Field>
            </div>
            <Field label="Departments">
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((d) => (
                  <span key={d} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {d}
                  </span>
                ))}
              </div>
            </Field>
            <button type="button" className={btnPrimary} onClick={() => notify("Organisation settings saved (demo)")}>
              Save Changes
            </button>
          </div>
        </Card>
      )}

      {tab === "Risk Scoring" && (
        <Card className="mt-5 max-w-2xl">
          <CardHeader
            title="Risk Scoring Methodology"
            subtitle="The scoring model, scales and thresholds can be configured per organisation"
          />
          <div className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Scoring Model">
                <select className={inputClass} defaultValue="Likelihood × Impact (5×5)">
                  <option>Likelihood × Impact (5×5)</option>
                  <option>Likelihood × Impact (3×3)</option>
                  <option>Weighted multi-factor</option>
                </select>
              </Field>
              <Field label="Review Cadence">
                <select className={inputClass} defaultValue="Quarterly">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Bi-annually</option>
                </select>
              </Field>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">Severity Thresholds</p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2 font-medium">Level</th>
                      <th className="px-4 py-2 font-medium">Score Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="px-4 py-2"><Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">Low</Badge></td><td className="px-4 py-2 text-slate-600">1 – 4</td></tr>
                    <tr><td className="px-4 py-2"><Badge className="bg-amber-50 text-amber-700 ring-amber-600/20">Medium</Badge></td><td className="px-4 py-2 text-slate-600">5 – 9</td></tr>
                    <tr><td className="px-4 py-2"><Badge className="bg-orange-50 text-orange-700 ring-orange-600/20">High</Badge></td><td className="px-4 py-2 text-slate-600">10 – 15</td></tr>
                    <tr><td className="px-4 py-2"><Badge className="bg-red-50 text-red-700 ring-red-600/20">Critical</Badge></td><td className="px-4 py-2 text-slate-600">16 – 25</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <button type="button" className={btnPrimary} onClick={() => notify("Risk scoring configuration saved (demo)")}>
              Save Changes
            </button>
          </div>
        </Card>
      )}

      {tab === "Users & Roles" && (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader title="Users" subtitle={`${SETTINGS_USERS.length} users in this workspace`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SETTINGS_USERS.map((u) => (
                    <tr key={u.email}>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-slate-900">{u.name}</span>
                        <span className="block text-xs text-slate-400">{u.email}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.role}</td>
                      <td className="px-4 py-3 text-slate-600">{u.department}</td>
                      <td className="px-4 py-3">
                        <Badge className={badgeStyle(u.status)}>{u.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card>
            <CardHeader title="Roles" subtitle="Role-based access (simulated)" />
            <div className="divide-y divide-slate-100">
              {ROLES.map((r) => (
                <div key={r.name} className="px-5 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" /> {r.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{r.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "Frameworks" && (
        <Card className="mt-5 max-w-3xl">
          <CardHeader
            title="Compliance Frameworks"
            subtitle="Enable the frameworks relevant to your organisation. Custom frameworks and questionnaires can be added."
          />
          <div className="divide-y divide-slate-100">
            {FRAMEWORKS.map((fw) => (
              <div key={fw.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{fw.name}</p>
                  <p className="text-xs text-slate-500">{fw.description}</p>
                </div>
                <ToggleRight className="h-6 w-6 shrink-0 text-indigo-600" />
              </div>
            ))}
            {["PCI DSS v4.0", "HIPAA Security Rule", "UAE IA Regulation"].map((name) => (
              <div key={name} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-400">{name}</p>
                  <p className="text-xs text-slate-400">Available — not enabled for this organisation</p>
                </div>
                <ToggleLeft className="h-6 w-6 shrink-0 text-slate-300" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Notifications" && (
        <Card className="mt-5 max-w-2xl">
          <CardHeader title="Notification Preferences" />
          <div className="divide-y divide-slate-100">
            {prefs.map((p, idx) => (
              <button
                key={p.label}
                type="button"
                className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50"
                onClick={() =>
                  setPrefs((cur) =>
                    cur.map((x, i) => (i === idx ? { ...x, enabled: !x.enabled } : x)),
                  )
                }
              >
                <span className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Bell className="h-4 w-4 text-slate-400" /> {p.label}
                </span>
                {p.enabled ? (
                  <ToggleRight className="h-6 w-6 text-indigo-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-300" />
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      {tab === "Integrations" && (
        <Card className="mt-5 max-w-2xl">
          <CardHeader
            title="Integrations"
            subtitle="Connect surrounding systems — integrations are simulated in this prototype"
          />
          <div className="divide-y divide-slate-100">
            {INTEGRATIONS.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Plug className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{integration.name}</p>
                    <p className="text-xs text-slate-500">{integration.description}</p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    integration.connected
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                      : "bg-slate-100 text-slate-500 ring-slate-500/20",
                  )}
                >
                  {integration.connected ? "Connected" : "Available"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Toast message={toast} />
    </div>
  );
}
