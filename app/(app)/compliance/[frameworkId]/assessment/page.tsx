"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Lightbulb } from "lucide-react";
import { useApp } from "@/lib/store";
import { COMPLIANCE_QUESTIONS, FRAMEWORKS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { btnPrimary, btnSecondary, Card, CardHeader, PageHeader, ProgressBar } from "@/components/ui";

type Answer = "Yes" | "Partially" | "No" | "Not Applicable";
const OPTIONS: Answer[] = ["Yes", "Partially", "No", "Not Applicable"];

const RECOMMENDATIONS: Record<string, string> = {
  cq4: "Enable MFA for administrative and critical systems.",
  cq3: "Perform quarterly privileged-access reviews.",
  cq10: "Complete evidence collection for data retention controls.",
  cq9: "Accelerate the DLP deployment to close the data leakage gap.",
  cq6: "Schedule and document a backup restoration test.",
  cq8: "Onboard remaining SaaS log sources into monitoring.",
  cq11: "Chase outstanding security-awareness training completions.",
};

export default function AssessmentPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const router = useRouter();
  const { logActivity } = useApp();

  const framework = FRAMEWORKS.find((f) => f.id === frameworkId);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);

  const sections = useMemo(() => {
    const map = new Map<string, typeof COMPLIANCE_QUESTIONS>();
    for (const q of COMPLIANCE_QUESTIONS) {
      map.set(q.section, [...(map.get(q.section) ?? []), q]);
    }
    return [...map.entries()];
  }, []);

  const answered = Object.keys(answers).length;
  const total = COMPLIANCE_QUESTIONS.length;

  const result = useMemo(() => {
    const scored = COMPLIANCE_QUESTIONS.filter(
      (q) => answers[q.id] && answers[q.id] !== "Not Applicable",
    );
    const points = scored.reduce(
      (acc, q) =>
        acc + (answers[q.id] === "Yes" ? 1 : answers[q.id] === "Partially" ? 0.5 : 0),
      0,
    );
    const pct = scored.length === 0 ? 0 : Math.round((points / scored.length) * 100);
    const compliant = scored.filter((q) => answers[q.id] === "Yes").length;
    const partial = scored.filter((q) => answers[q.id] === "Partially").length;
    const non = scored.filter((q) => answers[q.id] === "No").length;
    const recs = COMPLIANCE_QUESTIONS.filter(
      (q) =>
        (answers[q.id] === "No" || answers[q.id] === "Partially") && RECOMMENDATIONS[q.id],
    ).map((q) => RECOMMENDATIONS[q.id]);
    return { pct, compliant, partial, non, recs };
  }, [answers]);

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

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push(`/compliance/${framework.id}`)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> {framework.shortName} Controls
      </button>

      <PageHeader
        title={`${framework.shortName} Self-Assessment`}
        subtitle="Answer the questionnaire to generate a simulated compliance result. Answers map to framework controls."
      />

      {!submitted ? (
        <>
          <Card className="mb-5 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {answered} of {total} questions answered
              </span>
              <span className="font-semibold text-slate-900">
                {Math.round((answered / total) * 100)}%
              </span>
            </div>
            <ProgressBar value={(answered / total) * 100} color="bg-indigo-500" className="mt-2" />
          </Card>

          {sections.map(([section, questions]) => (
            <Card key={section} className="mb-5">
              <CardHeader title={section} />
              <div className="divide-y divide-slate-100">
                {questions.map((q) => (
                  <div key={q.id} className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">{q.text}</p>
                    {q.mappedControl && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        Maps to control {q.mappedControl}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-sm transition",
                            answers[q.id] === opt
                              ? opt === "Yes"
                                ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-700"
                                : opt === "Partially"
                                  ? "border-amber-600 bg-amber-50 font-medium text-amber-700"
                                  : opt === "No"
                                    ? "border-red-600 bg-red-50 font-medium text-red-700"
                                    : "border-slate-500 bg-slate-100 font-medium text-slate-700"
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
            </Card>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              className={btnPrimary}
              disabled={answered === 0}
              onClick={() => {
                setSubmitted(true);
                logActivity(
                  `${framework.shortName} self-assessment completed (${result.pct}%).`,
                  `/compliance/${framework.id}`,
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Complete Assessment
            </button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-1">
            <CardHeader title="Assessment Result" subtitle="Simulated scoring from your answers" />
            <div className="px-5 py-6 text-center">
              <p className="text-5xl font-semibold text-slate-900">{result.pct}%</p>
              <p className="mt-1 text-sm text-slate-500">Overall Compliance Score</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 py-2.5">
                  <p className="text-lg font-semibold text-emerald-700">{result.compliant}</p>
                  <p className="text-[11px] text-emerald-700">Compliant</p>
                </div>
                <div className="rounded-lg bg-amber-50 py-2.5">
                  <p className="text-lg font-semibold text-amber-700">{result.partial}</p>
                  <p className="text-[11px] text-amber-700">Partial</p>
                </div>
                <div className="rounded-lg bg-red-50 py-2.5">
                  <p className="text-lg font-semibold text-red-700">{result.non}</p>
                  <p className="text-[11px] text-red-700">Non-Compliant</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader
              title="Recommended Actions"
              subtitle="Generated from gaps identified in the questionnaire"
            />
            <div className="px-5 py-4">
              {result.recs.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> No gaps identified from the answers
                  provided.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {result.recs.map((rec) => (
                    <li key={rec} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                  }}
                >
                  Restart Assessment
                </button>
                <Link href={`/compliance/${framework.id}`} className={btnPrimary}>
                  Back to {framework.shortName}
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
