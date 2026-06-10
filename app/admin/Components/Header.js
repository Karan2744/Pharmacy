"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Settings,
  Shield,
} from "lucide-react";
import { logout, getAdminUser } from "@/lib/auth";

export default function Header({ isSidebarOpen, setIsSidebarOpen }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ username: "Admin", role: "Super Admin" });
  const dropdownRef = useRef(null);

  useEffect(() => {
    setAdminUser(getAdminUser());
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.replace("/admin/login");
  };

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-5 lg:px-6 sticky top-0 z-40 flex-shrink-0">

      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen?.(!isSidebarOpen)}
          className="lg:hidden p-1.5 hover:bg-gray-100 rounded transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

        <div className="relative hidden sm:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 text-[13px] w-52 lg:w-64 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">

        <button className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-2" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-gray-600" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-medium text-gray-800 leading-tight">{adminUser.username}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{adminUser.role}</p>
            </div>
            <ChevronDown
              size={13}
              className={`text-gray-400 hidden sm:block transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-sm z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-[13px] font-medium text-gray-900">{adminUser.username}</p>
                <p className="text-[11px] text-gray-400">{adminUser.role}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); router.push("/admin/dashboard"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Shield size={13} className="text-gray-400" />
                Dashboard
              </button>
              <button
                onClick={() => { setDropdownOpen(false); router.push("/admin/settings"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={13} className="text-gray-400" />
                Settings
              </button>
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
