"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative lg:flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* CONTENT */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />

        {/* Main Content → scroll horizontal ENABLED */}
        <main className="flex-1 px-3 py-4 overflow-x-auto">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
