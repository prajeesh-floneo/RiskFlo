"use client";

import { useState } from "react";
import Link from "next/link";
import type { Risk } from "@/lib/types";
import { classifyRisk, cn, RISK_LEVEL_STYLES } from "@/lib/utils";
import { Badge } from "./ui";

const CELL_COLORS: Record<string, string> = {
  Low: "bg-emerald-100 hover:bg-emerald-200 text-emerald-900",
  Medium: "bg-amber-100 hover:bg-amber-200 text-amber-900",
  High: "bg-orange-200 hover:bg-orange-300 text-orange-900",
  Critical: "bg-red-300 hover:bg-red-400 text-red-950",
};

export function RiskMatrix({
  risks,
  highlight,
}: {
  risks: Risk[];
  /** Optionally highlight one risk's cell (e.g. on a risk detail page). */
  highlight?: { likelihood: number; impact: number };
}) {
  const [selected, setSelected] = useState<{ l: number; i: number } | null>(null);

  const cellRisks = (l: number, i: number) =>
    risks.filter((r) => r.likelihood === l && r.impact === i);

  const selectedRisks = selected ? cellRisks(selected.l, selected.i) : [];

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex items-center">
          <span className="-rotate-90 whitespace-nowrap text-xs font-medium tracking-wide text-slate-500">
            Impact →
          </span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].map((impact) =>
              [1, 2, 3, 4, 5].map((likelihood) => {
                const score = likelihood * impact;
                const level = classifyRisk(score);
                const items = cellRisks(likelihood, impact);
                const isSelected =
                  selected?.l === likelihood && selected?.i === impact;
                const isHighlight =
                  highlight?.likelihood === likelihood && highlight?.impact === impact;
                return (
                  <button
                    key={`${likelihood}-${impact}`}
                    type="button"
                    onClick={() =>
                      setSelected(isSelected ? null : { l: likelihood, i: impact })
                    }
                    title={`Likelihood ${likelihood} × Impact ${impact} = ${score} (${level})`}
                    className={cn(
                      "relative flex h-14 flex-col items-center justify-center rounded-md text-xs font-semibold transition sm:h-16",
                      CELL_COLORS[level],
                      isSelected && "ring-2 ring-indigo-600 ring-offset-1",
                      isHighlight && "ring-2 ring-slate-900 ring-offset-1",
                    )}
                  >
                    <span>{score}</span>
                    {items.length > 0 && (
                      <span className="mt-0.5 rounded-full bg-white/70 px-1.5 text-[10px] font-bold">
                        {items.length} risk{items.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>
          <p className="mt-2 text-center text-xs font-medium tracking-wide text-slate-500">
            Likelihood →
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-100 ring-1 ring-emerald-300" /> Low (1–4)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-100 ring-1 ring-amber-300" /> Medium (5–9)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-200 ring-1 ring-orange-400" /> High (10–15)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-300 ring-1 ring-red-500" /> Critical (16–25)</span>
      </div>

      {selected && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold text-slate-700">
            Likelihood {selected.l} × Impact {selected.i} — {selectedRisks.length} risk
            {selectedRisks.length === 1 ? "" : "s"} in this cell
          </p>
          {selectedRisks.length === 0 ? (
            <p className="text-sm text-slate-500">No risks currently plotted in this cell.</p>
          ) : (
            <ul className="space-y-1.5">
              {selectedRisks.map((r) => (
                <li key={r.id} className="flex items-center gap-2">
                  <Link
                    href={`/risks/${r.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    {r.id}
                  </Link>
                  <span className="truncate text-sm text-slate-700">{r.title}</span>
                  <Badge className={RISK_LEVEL_STYLES[r.level]}>{r.level}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
