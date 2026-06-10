"use client";

import { useState } from "react";

import Sidebar from "@/app/admin/Components/sidebar";
import Header from "@/app/admin/Components/Header";
import Toast from "@/app/admin/Components/settings/Toast";
import { tabs } from "./Components/tabsConfig";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Sidebar
        activeTab="Settings"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="lg:ml-72">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="p-8 max-w-3xl">
          {/* Tab navigation */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
                  ${activeTab === id
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {ActiveComponent && <ActiveComponent showToast={showToast} />}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
