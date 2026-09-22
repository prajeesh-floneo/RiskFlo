"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ActivityItem,
  Control,
  ControlStatus,
  Incident,
  Notification,
  Risk,
  Vendor,
} from "./types";
import {
  SEED_ACTIVITY,
  SEED_CONTROLS,
  SEED_INCIDENTS,
  SEED_NOTIFICATIONS,
  SEED_RISKS,
  SEED_VENDORS,
} from "./data";

const STORAGE_KEY = "riskflo-demo-state-v1";

interface AppState {
  risks: Risk[];
  controls: Control[];
  vendors: Vendor[];
  incidents: Incident[];
  notifications: Notification[];
  activity: ActivityItem[];
}

interface AppStore extends AppState {
  hydrated: boolean;
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, patch: Partial<Risk>) => void;
  updateControl: (id: string, patch: Partial<Control>) => void;
  setControlStatus: (id: string, status: ControlStatus) => void;
  addControlNote: (id: string, note: string) => void;
  addControlEvidence: (id: string, fileName: string) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  updateIncident: (id: string, patch: Partial<Incident>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  logActivity: (message: string, href: string) => void;
  resetDemo: () => void;
}

const seedState = (): AppState => ({
  risks: SEED_RISKS,
  controls: SEED_CONTROLS,
  vendors: SEED_VENDORS,
  incidents: SEED_INCIDENTS,
  notifications: SEED_NOTIFICATIONS,
  activity: SEED_ACTIVITY,
});

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && Array.isArray(parsed.risks)) {
          // One-time hydration from localStorage after mount (SSR-safe).
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState({ ...seedState(), ...parsed });
        }
      }
    } catch {
      // Ignore corrupted local state and fall back to seed data.
    }
    skipPersist.current = false;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (skipPersist.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be unavailable (private mode); demo still works in memory.
    }
  }, [state]);

  const today = () => new Date().toISOString().slice(0, 10);

  const logActivity = useCallback((message: string, href: string) => {
    setState((s) => ({
      ...s,
      activity: [
        { id: `act-${Date.now()}`, message, date: today(), href },
        ...s.activity,
      ].slice(0, 30),
    }));
  }, []);

  const addRisk = useCallback((risk: Risk) => {
    setState((s) => ({
      ...s,
      risks: [risk, ...s.risks],
      activity: [
        {
          id: `act-${Date.now()}`,
          message: `${risk.id} "${risk.title}" added to the risk register.`,
          date: today(),
          href: `/risks/${risk.id}`,
        },
        ...s.activity,
      ].slice(0, 30),
    }));
  }, []);

  const updateRisk = useCallback((id: string, patch: Partial<Risk>) => {
    setState((s) => ({
      ...s,
      risks: s.risks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);

  const updateControl = useCallback((id: string, patch: Partial<Control>) => {
    setState((s) => ({
      ...s,
      controls: s.controls.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);

  const setControlStatus = useCallback(
    (id: string, status: ControlStatus) => {
      setState((s) => ({
        ...s,
        controls: s.controls.map((x) =>
          x.id === id ? { ...x, status, lastReviewed: today() } : x,
        ),
        activity: [
          {
            id: `act-${Date.now()}`,
            message: `Control ${id} marked ${status}.`,
            date: today(),
            href: `/compliance`,
          },
          ...s.activity,
        ].slice(0, 30),
      }));
    },
    [],
  );

  const addControlNote = useCallback((id: string, note: string) => {
    setState((s) => ({
      ...s,
      controls: s.controls.map((x) =>
        x.id === id ? { ...x, notes: [note, ...x.notes] } : x,
      ),
    }));
  }, []);

  const addControlEvidence = useCallback((id: string, fileName: string) => {
    setState((s) => ({
      ...s,
      controls: s.controls.map((x) =>
        x.id === id
          ? {
              ...x,
              evidence: [
                { name: fileName, uploadedBy: "Sarah Mathew", date: today() },
                ...x.evidence,
              ],
            }
          : x,
      ),
    }));
  }, []);

  const updateVendor = useCallback((id: string, patch: Partial<Vendor>) => {
    setState((s) => ({
      ...s,
      vendors: s.vendors.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);

  const updateIncident = useCallback((id: string, patch: Partial<Incident>) => {
    setState((s) => ({
      ...s,
      incidents: s.incidents.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(seedState());
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      hydrated,
      addRisk,
      updateRisk,
      updateControl,
      setControlStatus,
      addControlNote,
      addControlEvidence,
      updateVendor,
      updateIncident,
      markNotificationRead,
      markAllNotificationsRead,
      logActivity,
      resetDemo,
    }),
    [
      state,
      hydrated,
      addRisk,
      updateRisk,
      updateControl,
      setControlStatus,
      addControlNote,
      addControlEvidence,
      updateVendor,
      updateIncident,
      markNotificationRead,
      markAllNotificationsRead,
      logActivity,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
