"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, ClipboardCheck, FileText, Paperclip } from "lucide-react";
import { useApp } from "@/lib/store";
import { FRAMEWORKS } from "@/lib/data";
import {
  complianceScore,
  CONTROL_STATUS_STYLES,
  formatDate,
} from "@/lib/utils";
import type { Control, ControlStatus } from "@/lib/types";
import {
  Badge,
  btnPrimary,
  btnSecondary,
  Card,
  DetailItem,
  Drawer,
  inputClass,
  PageHeader,
  ProgressBar,
  Toast,
} from "@/components/ui";

function FrameworkContent() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const { controls, setControlStatus, addControlNote, addControlEvidence } = useApp();

  const framework = FRAMEWORKS.find((f) => f.id === frameworkId);
  const fwControls = controls.filter((c) => c.frameworkId === frameworkId);

  const openControlId = params.get("control");
  const openControl = fwControls.find((c) => c.id === openControlId) ?? null;

  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  if (!framework) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Framework not found.{" "}
        <Link href="/compliance" className="font-medium text-indigo-600">
          Back to Compliance
        </Link>
      </div>
    );
  }

  const score = complianceScore(fwControls.map((c) => c.status));

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const closeDrawer = () => router.push(`/compliance/${frameworkId}`);

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/compliance")}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Compliance
      </button>

      <PageHeader
        title={framework.name}
        subtitle={framework.description}
        actions={
          <Link href={`/compliance/${framework.id}/assessment`} className={btnPrimary}>
            <ClipboardCheck className="h-4 w-4" />
            Run Assessment
          </Link>
        }
      />

      <Card className="mb-5 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Framework compliance</p>
          <p className="text-xl font-semibold text-slate-900">{score}%</p>
        </div>
        <ProgressBar value={score} className="mt-2" />
        <p className="mt-2 text-xs text-slate-500">
          {fwControls.filter((c) => c.status === "Compliant").length} compliant ·{" "}
          {fwControls.filter((c) => c.status === "Partial").length} partial ·{" "}
          {fwControls.filter((c) => c.status === "Non-Compliant").length} non-compliant ·{" "}
          {fwControls.filter((c) => c.status === "Not Assessed").length} not assessed
        </p>
      </Card>

      {framework.areas.map((area) => {
        const areaControls = fwControls.filter((c) => c.area === area);
        if (areaControls.length === 0) return null;
        return (
          <div key={area} className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">{area}</h2>
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">Control ID</th>
                    <th className="px-4 py-3 font-medium">Control Requirement</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Evidence</th>
                    <th className="px-4 py-3 font-medium">Last Reviewed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {areaControls.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() =>
                        router.push(
                          `/compliance/${frameworkId}?control=${encodeURIComponent(c.id)}`,
                        )
                      }
                      className="cursor-pointer transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-indigo-600">{c.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                      <td className="px-4 py-3 text-slate-600">{c.owner}</td>
                      <td className="px-4 py-3">
                        <Badge className={CONTROL_STATUS_STYLES[c.status]}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.evidence.length > 0 ? (
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                            {c.evidence.length} file{c.evidence.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-amber-600">Pending</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDate(c.lastReviewed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        );
      })}

      <Drawer
        open={!!openControl}
        onClose={closeDrawer}
        title={openControl ? `${openControl.id} · ${openControl.title}` : ""}
      >
        {openControl && (
          <ControlDetail
            control={openControl}
            note={note}
            setNote={setNote}
            onStatus={(status) => {
              setControlStatus(openControl.id, status);
              notify(`${openControl.id} marked ${status}`);
            }}
            onUpload={() => {
              addControlEvidence(
                openControl.id,
                `${openControl.id.replace(/\./g, "-")}-Evidence-${new Date().toISOString().slice(0, 10)}.pdf`,
              );
              notify("Evidence uploaded (simulated)");
            }}
            onAddNote={() => {
              if (!note.trim()) return;
              addControlNote(openControl.id, note.trim());
              setNote("");
              notify("Assessment note added");
            }}
          />
        )}
      </Drawer>
      <Toast message={toast} />
    </div>
  );
}

function ControlDetail({
  control,
  note,
  setNote,
  onStatus,
  onUpload,
  onAddNote,
}: {
  control: Control;
  note: string;
  setNote: (v: string) => void;
  onStatus: (s: ControlStatus) => void;
  onUpload: () => void;
  onAddNote: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Control Description
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{control.description}</p>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <DetailItem label="Responsible">{control.owner}</DetailItem>
        <DetailItem label="Implementation Status">
          <Badge className={CONTROL_STATUS_STYLES[control.status]}>{control.status}</Badge>
        </DetailItem>
        <DetailItem label="Last Assessment">{formatDate(control.lastReviewed)}</DetailItem>
        <DetailItem label="Next Review">{formatDate(control.nextReview)}</DetailItem>
      </dl>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Update Status
        </p>
        <div className="flex flex-wrap gap-2">
          {(["Compliant", "Partial", "Non-Compliant"] as ControlStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              className={btnSecondary}
              onClick={() => onStatus(s)}
            >
              Mark {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Evidence ({control.evidence.length})
          </p>
          <button type="button" className={btnSecondary} onClick={onUpload}>
            <Paperclip className="h-3.5 w-3.5" /> Upload Evidence
          </button>
        </div>
        {control.evidence.length === 0 && (
          <p className="text-sm text-amber-600">No evidence attached yet — evidence pending.</p>
        )}
        <ul className="space-y-1.5">
          {control.evidence.map((e) => (
            <li
              key={e.name}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{e.name}</span>
                <span className="block text-xs text-slate-400">
                  {e.uploadedBy} · {formatDate(e.date)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Assessment Notes
        </p>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an assessment note…"
          />
          <button type="button" className={btnPrimary} onClick={onAddNote}>
            Add
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {control.notes.map((n, i) => (
            <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FrameworkPage() {
  return (
    <Suspense>
      <FrameworkContent />
    </Suspense>
  );
}
