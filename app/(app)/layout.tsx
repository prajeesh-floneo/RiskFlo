import type { ReactNode } from "react";
import { AppProvider } from "@/lib/store";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { Copilot } from "@/components/shell/Copilot";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="lg:pl-60">
          <Topbar />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
        </div>
        <Copilot />
      </div>
    </AppProvider>
  );
}
