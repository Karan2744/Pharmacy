"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Users,
  Settings,
  BarChart2,
  LogOut,
  MapPin,
  User,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { getSettings } from "@/services/settingsService";

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);
  const [siteName, setSiteName] = useState("PharmaAdmin");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    getSettings().then((data) => {
      if (data?.success) {
        setSiteName(data.data.siteName || "PharmaAdmin");
        setLogoUrl(data.data.logoUrl || "");
      }
    });
  }, []);

  const navItems = [
    { id: "Dashboard",  label: "Dashboard",         icon: LayoutGrid,  href: "/admin/dashboard" },
    {
      id: "Products", label: "Products", icon: Package,
      submenu: [
        { id: "All Products", label: "Product List", href: "/admin/products" },
        { id: "Add products", label: "Add Product",  href: "/admin/products/addproduct" },
        { id: "Categories",   label: "Categories",   href: "/admin/categories" },
      ],
    },
    { id: "Orders",    label: "Orders",             icon: ShoppingCart, href: "/admin/orders" },
    { id: "Customers", label: "Customers",          icon: Users,        href: "/admin/customers" },
    { id: "Analytics", label: "Analytics",          icon: BarChart2,    href: "/admin/dashboard" },
    { id: "Pincodes",  label: "Pincode Management", icon: MapPin,       href: "/admin/pincodes" },
    { id: "Settings",  label: "Settings",           icon: Settings,     href: "/admin/settings" },
    { id: "Users",     label: "User Management",    icon: User,         href: "/admin/users" },
  ];

  const handleNav = (item) => {
    setActiveTab?.(item.id);
    router.push(item.href);
    setIsSidebarOpen?.(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen?.(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-200
          lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-[60px] flex items-center px-5 border-b border-gray-200 flex-shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo"
              width={110}
              height={32}
              className="object-contain"
              unoptimized={logoUrl.startsWith("/") || logoUrl.startsWith("data:")}
            />
          ) : (
            <span className="text-sm font-semibold text-gray-900">{siteName}</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = !!item.submenu;
            const isOpen = openMenu === item.id;
            const isActive =
              activeTab === item.id ||
              (hasSubmenu && item.submenu.some((s) => s.id === activeTab));

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasSubmenu) setOpenMenu(isOpen ? null : item.id);
                    else handleNav(item);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-5 py-2.5 text-[13px] transition-colors border-l-2
                    ${isActive
                      ? "border-gray-900 bg-gray-50 text-gray-900 font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasSubmenu && (
                    isOpen
                      ? <ChevronDown  size={13} className="opacity-40" />
                      : <ChevronRight size={13} className="opacity-40" />
                  )}
                </button>

                {hasSubmenu && isOpen && (
                  <div className="pl-[52px] pb-1">
                    {item.submenu.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab?.(sub.id);
                          router.push(sub.href);
                          setIsSidebarOpen?.(false);
                        }}
                        className={`
                          w-full text-left px-3 py-2 text-[12px] transition-colors
                          ${activeTab === sub.id
                            ? "text-gray-900 font-medium"
                            : "text-gray-400 hover:text-gray-700"
                          }
                        `}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-[13px] text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} className="flex-shrink-0" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
