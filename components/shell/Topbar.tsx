"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Search, ShieldAlert, ShieldCheck, Siren, Network, RotateCcw } from "lucide-react";
import { useApp } from "@/lib/store";
import { DEMO_USER } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  type: "Risk" | "Control" | "Vendor" | "Incident";
  href: string;
  meta: string;
}

export function Topbar() {
  const { risks, controls, vendors, incidents, notifications, markNotificationRead, markAllNotificationsRead, resetDemo } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: SearchResult[] = [];
    for (const r of risks) {
      if (`${r.id} ${r.title} ${r.category} ${r.owner} ${r.department}`.toLowerCase().includes(q)) {
        out.push({ id: r.id, title: `${r.id} – ${r.title}`, type: "Risk", href: `/risks/${r.id}`, meta: `${r.level} · ${r.category}` });
      }
    }
    for (const c of controls) {
      if (`${c.id} ${c.title} ${c.description}`.toLowerCase().includes(q)) {
        out.push({ id: c.id, title: `${c.id} – ${c.title}`, type: "Control", href: `/compliance/${c.frameworkId}?control=${encodeURIComponent(c.id)}`, meta: c.status });
      }
    }
    for (const v of vendors) {
      if (`${v.name} ${v.service}`.toLowerCase().includes(q)) {
        out.push({ id: v.id, title: v.name, type: "Vendor", href: `/vendors/${v.id}`, meta: `${v.level} Risk · ${v.service}` });
      }
    }
    for (const i of incidents) {
      if (`${i.id} ${i.title} ${i.category}`.toLowerCase().includes(q)) {
        out.push({ id: i.id, title: `${i.id} – ${i.title}`, type: "Incident", href: `/incidents/${i.id}`, meta: `${i.severity} · ${i.status}` });
      }
    }
    return out.slice(0, 10);
  }, [query, risks, controls, vendors, incidents]);

  const unread = notifications.filter((n) => !n.read);

  const typeIcon = {
    Risk: <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />,
    Control: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />,
    Vendor: <Network className="h-3.5 w-3.5 text-indigo-500" />,
    Incident: <Siren className="h-3.5 w-3.5 text-red-500" />,
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div ref={wrapRef} className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search risks, controls, vendors, incidents…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchOpen && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-11 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
              {results.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-500">No results for “{query}”.</p>
              )}
              {results.map((res) => (
                <button
                  key={`${res.type}-${res.id}`}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    router.push(res.href);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-slate-50"
                >
                  {typeIcon[res.type]}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-900">{res.title}</span>
                    <span className="block text-xs text-slate-500">{res.type} · {res.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                {unread.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-96 rounded-lg border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id);
                      setNotifOpen(false);
                      router.push(n.href);
                    }}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50",
                      !n.read && "bg-indigo-50/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        n.read ? "bg-slate-300" : "bg-indigo-500",
                      )}
                    />
                    <span>
                      <span className="block text-sm text-slate-800">{n.message}</span>
                      <span className="block text-xs text-slate-400">{formatDate(n.date)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {DEMO_USER.initials}
            </span>
            <span className="hidden text-left md:block">
              <span className="block text-sm font-medium leading-tight text-slate-900">{DEMO_USER.name}</span>
              <span className="block text-xs leading-tight text-slate-500">{DEMO_USER.role}</span>
            </span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  resetDemo();
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4 text-slate-400" />
                Reset demo data
              </button>
              <Link
                href="/"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setProfileOpen(false)}
              >
                <LogOut className="h-4 w-4 text-slate-400" />
                Exit workspace
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
