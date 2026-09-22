"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { DEPARTMENTS, OWNERS, RISK_CATEGORIES } from "@/lib/data";
import type { Risk, Treatment } from "@/lib/types";
import { classifyRisk, cn, RISK_LEVEL_STYLES } from "@/lib/utils";
import { Badge, Field, inputClass, Modal, btnPrimary, btnSecondary } from "./ui";

const STEPS = ["Risk Information", "Assessment", "Ownership", "Treatment"];

export function AddRiskModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { risks, addRisk } = useApp();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(RISK_CATEGORIES[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [likelihood, setLikelihood] = useState(3);
  const [impact, setImpact] = useState(3);
  const [owner, setOwner] = useState(OWNERS[0]);
  const [treatmentOwner, setTreatmentOwner] = useState(OWNERS[0]);
  const [reviewDate, setReviewDate] = useState("2026-12-31");
  const [treatment, setTreatment] = useState<Treatment>("Mitigate");

  const score = likelihood * impact;
  const level = classifyRisk(score);

  const nextId = useMemo(() => {
    const max = risks.reduce((acc, r) => {
      const n = Number(r.id.replace("RISK-", ""));
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);
    return `RISK-${String(max + 1).padStart(3, "0")}`;
  }, [risks]);

  const reset = () => {
    setStep(0);
    setTitle("");
    setDescription("");
    setCategory(RISK_CATEGORIES[0]);
    setDepartment(DEPARTMENTS[0]);
    setLikelihood(3);
    setImpact(3);
    setOwner(OWNERS[0]);
    setTreatmentOwner(OWNERS[0]);
    setReviewDate("2026-12-31");
    setTreatment("Mitigate");
  };

  const save = () => {
    const today = new Date().toISOString().slice(0, 10);
    const risk: Risk = {
      id: nextId,
      title: title.trim(),
      description: description.trim() || "No description provided yet.",
      category,
      department,
      owner,
      likelihood,
      impact,
      residualLikelihood: likelihood,
      residualImpact: impact,
      level,
      treatment,
      treatmentOwner,
      status: "Open",
      dateIdentified: today,
      lastReviewed: today,
      reviewDate,
      appetite: "To be confirmed by risk owner",
      treatmentPlan: [],
      timeline: [
        { id: `${nextId}-t1`, date: today, title: "Risk created", actor: "Sarah Mathew" },
        { id: `${nextId}-t2`, date: today, title: "Owner assigned", detail: `Assigned to ${owner}`, actor: "Sarah Mathew" },
      ],
      linkedControls: [],
      linkedVendors: [],
      linkedIncidents: [],
    };
    addRisk(risk);
    reset();
    onCreated(risk.id);
  };

  const canNext =
    step === 0 ? title.trim().length > 2 : true;

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={`Add New Risk · ${nextId}`}
      wide
    >
      <ol className="mb-5 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < step
                  ? "bg-indigo-600 text-white"
                  : i === step
                    ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-600"
                    : "bg-slate-100 text-slate-500",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:block",
                i === step ? "text-slate-900" : "text-slate-400",
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <Field label="Risk Title *">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unpatched vulnerabilities in customer portal"
            />
          </Field>
          <Field label="Description">
            <textarea
              className={cn(inputClass, "min-h-24 resize-y")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the risk scenario, cause and potential consequence…"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {RISK_CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={`Likelihood: ${likelihood} / 5`}>
              <input
                type="range"
                min={1}
                max={5}
                value={likelihood}
                onChange={(e) => setLikelihood(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>Rare</span>
                <span>Almost certain</span>
              </div>
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
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>Insignificant</span>
                <span>Severe</span>
              </div>
            </Field>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs font-medium text-slate-500">
              Risk Score = Likelihood × Impact
            </p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {likelihood} × {impact} = {score}
            </p>
            <div className="mt-2">
              <Badge className={RISK_LEVEL_STYLES[level]}>{level} Risk</Badge>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Risk Owner">
            <select className={inputClass} value={owner} onChange={(e) => setOwner(e.target.value)}>
              {OWNERS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Treatment Owner">
            <select className={inputClass} value={treatmentOwner} onChange={(e) => setTreatmentOwner(e.target.value)}>
              {OWNERS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Next Review Date">
            <input
              type="date"
              className={inputClass}
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="mb-3 text-sm text-slate-600">Select a treatment strategy:</p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["Accept", "Acknowledge and monitor within appetite"],
                ["Mitigate", "Reduce likelihood or impact through controls"],
                ["Transfer", "Shift exposure via insurance or contracts"],
                ["Avoid", "Stop or change the activity causing the risk"],
              ] as [Treatment, string][]
            ).map(([t, hint]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTreatment(t)}
                className={cn(
                  "rounded-lg border p-3 text-left transition",
                  treatment === t
                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <p className="text-sm font-semibold text-slate-900">{t}</p>
                <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-semibold">{nextId}</span> · {title || "Untitled risk"} ·{" "}
            {category} · {department} · Score {score} ({level}) · Owner {owner}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className={btnSecondary}
          onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
        >
          {step === 0 ? "Cancel" : "Back"}
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className={btnPrimary}
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
          >
            Continue
          </button>
        ) : (
          <button type="button" className={btnPrimary} onClick={save}>
            Save Risk
          </button>
        )}
      </div>
    </Modal>
  );
}
