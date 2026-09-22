"use client";

import { Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { complianceScore } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Show me our highest cybersecurity risks",
  "Which ISO 27001 controls are non-compliant?",
  "Summarise our third-party risks",
  "Which incidents need immediate attention?",
  "Generate an executive risk summary",
];

export function Copilot() {
  const { risks, controls, vendors, incidents } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const answer = (q: string): string => {
    const s = q.toLowerCase();
    if (s.includes("cyber")) {
      const top = risks
        .filter((r) => r.category === "Cybersecurity")
        .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
        .slice(0, 4);
      return (
        "Your highest cybersecurity risks right now:\n\n" +
        top
          .map(
            (r) =>
              `• ${r.id} — ${r.title} (score ${r.likelihood * r.impact}, ${r.level}, owner ${r.owner})`,
          )
          .join("\n") +
        "\n\nRISK-001 and RISK-007 drive most of the exposure. Both have active treatment plans — the EDR rollout and privileged session monitoring are the key open actions."
      );
    }
    if (s.includes("iso") || s.includes("non-compliant") || s.includes("control")) {
      const bad = controls.filter(
        (
          c,
        ) => c.frameworkId === "iso-27001" && c.status === "Non-Compliant",
      );
      const partial = controls.filter(
        (c) => c.frameworkId === "iso-27001" && c.status === "Partial",
      );
      return (
        `ISO 27001 currently has ${bad.length} non-compliant and ${partial.length} partially compliant control(s):\n\n` +
        bad.map((c) => `• ${c.id} ${c.title} — Non-Compliant (${c.owner})`).join("\n") +
        "\n" +
        partial.map((c) => `• ${c.id} ${c.title} — Partial (${c.owner})`).join("\n") +
        "\n\nThe largest gap is A.8.12 Data Leakage Prevention; DLP deployment is scheduled for Q4 2026."
      );
    }
    if (s.includes("third") || s.includes("vendor")) {
      const high = vendors.filter((v) => v.level === "High");
      return (
        `You manage ${vendors.length} active vendors: ${vendors.filter((v) => v.level === "Low").length} low, ${vendors.filter((v) => v.level === "Medium").length} medium and ${high.length} high risk.\n\n` +
        "High-risk vendors:\n" +
        high.map((v) => `• ${v.name} (${v.service}) — score ${v.score}/100`).join("\n") +
        "\n\nNexus Outsourcing is the priority: its assessment expires within 14 days and it is linked to RISK-002 and RISK-015."
      );
    }
    if (s.includes("incident")) {
      const urgent = incidents.filter(
        (i) => (i.severity === "Critical" || i.severity === "High") && i.status !== "Resolved",
      );
      return (
        "Incidents needing immediate attention:\n\n" +
        urgent
          .map((i) => `• ${i.id} — ${i.title} (${i.severity}, ${i.status}, owner ${i.assignedTo})`)
          .join("\n") +
        "\n\nINC-014 is the only Critical incident. Forensic review is in progress and phishing-resistant MFA for privileged accounts is the next corrective action."
      );
    }
    if (s.includes("executive") || s.includes("summary")) {
      const iso = complianceScore(
        controls.filter((c) => c.frameworkId === "iso-27001").map((c) => c.status),
      );
      const critical = risks.filter((r) => r.level === "Critical").length;
      const openInc = incidents.filter((i) => i.status !== "Resolved" && i.status !== "Post-Incident Review").length;
      return (
        "Executive risk summary — Apex Technologies Ltd.\n\n" +
        `• Overall risk score: 64/100 (Moderate), improving for 6 consecutive months.\n` +
        `• ${critical} critical risks are open; ransomware (RISK-001) and data localisation (RISK-012) carry the highest exposure.\n` +
        `• ISO 27001 compliance stands at ${iso}%, with DLP (A.8.12) the main outstanding gap.\n` +
        `• ${vendors.filter((v) => v.level === "High").length} of ${vendors.length} vendors are high risk; Nexus Outsourcing requires reassessment this month.\n` +
        `• ${openInc} incidents are open, including 1 critical privileged-access investigation (INC-014).\n\n` +
        "Recommendation: prioritise the EDR/DLP rollout, complete the Nexus Outsourcing reassessment, and close INC-014 corrective actions before the Q4 risk committee."
      );
    }
    return (
      "I can help you interrogate the GRC data in this workspace. Try asking about cybersecurity risks, non-compliant ISO 27001 controls, third-party risk, open incidents, or an executive summary.\n\n(In this prototype, GRC Copilot responses are simulated from the demo dataset — no external AI service is used.)"
    );
  };

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: answer(q) }]);
      setTyping(false);
    }, 700);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-700"
      >
        <Sparkles className="h-4 w-4" />
        GRC Copilot
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-white">GRC Copilot</p>
                <p className="text-[10px] text-slate-400">Simulated assistant · demo data only</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">
                  Ask about your risk and compliance posture:
                </p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => send(sug)}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-xl rounded-br-sm bg-indigo-600 px-3 py-2 text-sm text-white"
                    : "mr-4 whitespace-pre-wrap rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800"
                }
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="mr-4 w-16 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400">
                …
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-slate-100 px-3 py-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask GRC Copilot…"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 p-2 text-white transition hover:bg-indigo-700"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
