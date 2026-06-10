"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Menu, X, ShoppingCart, User, Heart, Phone, Plus } from "lucide-react";
import { useCart } from "@/components/CartContext";
import LoginModal from "@/components/LoginModal";
import { slugify } from "@/lib/slugify";

// ── Medical theme tokens ─────────────────────────────────────────────────────
const M_BLUE    = "#0070B3"; // primary medical blue
const M_DARK    = "#005A92"; // hover / pressed
const M_LIGHT   = "#EBF5FF"; // light tint

export default function Navbar() {
  const router = useRouter();

  const [logoUrl,       setLogoUrl]       = useState("");
  const [siteName,      setSiteName]      = useState("MauryaRx");
  const [navCategories, setNavCategories] = useState([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLogoUrl(d.data.logoUrl   || "");
          setSiteName(d.data.siteName || "MauryaRx");
        }
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { if (d.success) setNavCategories(d.data.filter((c) => !c.isDeleted)); })
      .catch(() => {});
  }, []);

  const navItems = navCategories.map((cat) => ({
    label:    cat.name,
    href:     `/categories/${slugify(cat.name)}`,
    subItems: cat.subcategories || [],
  }));

  const placeholders = [
    "ECOSPRIN", "METFORMIN", "TELMA", "GALVUS", "BIOVAS",
    "ATORVA", "JANUMET", "CIPCAL", "GEMER", "NEBICARD",
  ];

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [activeMega,   setActiveMega]   = useState(null);
  const [loginOpen,    setLoginOpen]    = useState(false);
  const [search,       setSearch]       = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated, totalItems, user, logout } = useCart();

  useEffect(() => {
    const iv = setInterval(() => setCurrentIndex((p) => (p + 1) % placeholders.length), 2200);
    return () => clearInterval(iv);
  }, []);

  const goSearch = (q) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setSearch("");
      setMobileSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.07)]">

      {/* ── Top utility bar ──────────────────────────────────────────── */}
      <div style={{ backgroundColor: M_BLUE }} className="hidden lg:block">
        <div className="max-w-[1560px] mx-auto px-6 h-8 flex items-center justify-between text-white text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={11} /> 09240250346</span>
            <span className="opacity-60">|</span>
            <span>Free delivery above ₹500</span>
            <span className="opacity-60">|</span>
            <span>100% authentic medicines</span>
          </div>
          <div className="flex items-center gap-3 opacity-80 text-[11px]">
            <span>Mon–Sat 9 AM – 9 PM</span>
          </div>
        </div>
      </div>

      {/* ── Main bar ──────────────────────────────────────────────────── */}
      <div className="max-w-[1560px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-4">

        {/* Hamburger (mobile) */}
        <button className="lg:hidden p-1.5 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2">
          {logoUrl ? (
            <div className="relative h-9 w-32">
              <Image
                src={logoUrl} alt={siteName} fill
                className="object-contain" priority
                unoptimized={logoUrl.startsWith("data:")} sizes="128px"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: M_BLUE }}>
                <Plus size={16} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight" style={{ color: M_BLUE }}>{siteName}</span>
            </div>
          )}
        </Link>

        {/* Search bar (desktop) */}
        <div
          className="hidden lg:flex flex-1 max-w-2xl mx-4 items-center border-2 rounded-lg overflow-hidden h-[44px] focus-within:shadow-md transition-all"
          style={{ borderColor: M_BLUE }}
        >
          <Search className="ml-4 text-gray-400 shrink-0" size={17} />
          <div className="relative flex-1 h-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goSearch(search)}
              className="w-full h-full px-3 outline-none text-sm bg-transparent"
              placeholder=""
            />
            {!search && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm mr-1">Search</span>
                <div className="h-5 overflow-hidden">
                  <div className="transition-transform duration-500" style={{ transform: `translateY(-${currentIndex * 20}px)` }}>
                    {placeholders.map((m, i) => <div key={i} className="h-5 text-gray-700 font-semibold text-sm">{m}</div>)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => goSearch(search)}
            className="px-7 h-full font-bold text-sm text-white transition-colors"
            style={{ backgroundColor: M_BLUE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = M_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = M_BLUE)}
          >
            SEARCH
          </button>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 lg:gap-4 ml-auto">

          <div className="hidden lg:block w-px h-5 bg-gray-200" />

          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/account" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 transition-colors" style={{}}
                onMouseEnter={(e) => (e.currentTarget.style.color = M_BLUE)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}>
                <User size={17} /> Hi, {user?.name?.split(" ")[0] || "User"}
              </Link>
              <Link href="/wishlist" className="text-gray-500 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = M_BLUE)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}>
                <Heart size={18} />
              </Link>
              <button onClick={logout} className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors">Logout</button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = M_BLUE)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                <User size={17} /> Login
              </button>
              <Link
                href="/signup"
                className="text-sm font-bold px-4 py-1.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: M_BLUE }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = M_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = M_BLUE)}
              >
                Sign Up
              </Link>
            </div>
          )}

          <div className="hidden lg:block w-px h-5 bg-gray-200" />

          <Link href="/cart" className="flex items-center gap-1 group p-1.5">
            <div className="relative">
              <ShoppingCart size={22} className="text-gray-600 transition-colors" style={{}}
              />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white ring-2 ring-white"
                  style={{ backgroundColor: M_BLUE }}
                >
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden lg:block text-sm font-semibold text-gray-700 group-hover:text-[#0070B3] transition-colors">Cart</span>
          </Link>
        </div>
      </div>

      {/* ── Mobile Search ─────────────────────────────────────────────── */}
      <div className="lg:hidden px-4 pb-2.5 border-t border-gray-100 pt-2">
        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border" style={{ borderColor: "#cbd5e1" }}>
          <Search size={16} className="text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goSearch(mobileSearch)}
            placeholder="Search medicines, health products…"
            className="bg-transparent w-full outline-none text-sm"
          />
          {mobileSearch && (
            <button onClick={() => goSearch(mobileSearch)} className="ml-2 text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: M_BLUE }}>Go</button>
          )}
        </div>
      </div>

      {/* ── Category nav row (desktop) ────────────────────────────────── */}
      <nav className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-[1560px] mx-auto px-6 flex items-center gap-0">
          {navItems.length === 0
            ? Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-3 w-20 bg-gray-100 rounded animate-pulse mx-4 my-3" />)
            : navItems.map((item, idx) => (
              <div
                key={item.href}
                className="relative group px-4 py-3 shrink-0"
                onMouseEnter={() => item.subItems?.length && setActiveMega(idx)}
                onMouseLeave={() => setActiveMega(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-[13px] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                  style={{ color: activeMega === idx ? M_BLUE : undefined }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = M_BLUE)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = activeMega === idx ? M_BLUE : "#374151")}
                >
                  {item.label}
                  {item.subItems?.length > 0 && (
                    <ChevronDown size={12} className={`transition-transform ${activeMega === idx ? "rotate-180" : ""}`} />
                  )}
                </Link>
                {/* blue underline indicator */}
                <div
                  className={`absolute bottom-0 left-4 right-4 h-0.5 transition-all duration-200 ${activeMega === idx ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  style={{ backgroundColor: M_BLUE }}
                />

                {/* Dropdown */}
                {item.subItems?.length > 0 && (
                  <div className={`absolute top-full left-0 pt-1 transition-all duration-150 origin-top-left ${activeMega === idx ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}>
                    <div className="bg-white shadow-xl rounded-lg border border-gray-100 p-3 min-w-[200px]">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub}
                          href={`${item.href}?sub=${encodeURIComponent(sub)}`}
                          className="block px-3 py-2 text-sm text-gray-600 rounded-lg transition-colors"
                          onMouseEnter={(e) => { e.currentTarget.style.color = M_BLUE; e.currentTarget.style.background = M_LIGHT; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </nav>

      {/* ── Mobile drawer overlay ─────────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] lg:hidden transition-opacity ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`fixed left-0 top-0 h-full w-[280px] bg-white shadow-2xl z-[61] transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: M_BLUE }}>
          <span className="text-base font-black text-white">{siteName}</span>
          <button onClick={() => setMobileOpen(false)}>
            <X size={20} className="text-white/80" />
          </button>
        </div>
        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {navItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 text-sm font-semibold text-gray-700 rounded-lg transition-colors hover:text-white"
                style={{}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = M_BLUE; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = ""; }}
              >
                {item.label}
                {item.subItems?.length > 0 && <ChevronDown size={13} className="text-gray-400" />}
              </Link>
              {item.subItems?.length > 0 && (
                <div className="ml-4 border-l-2 pl-3 mt-0.5 mb-1 space-y-0.5" style={{ borderColor: M_LIGHT }}>
                  {item.subItems.slice(0, 5).map((sub) => (
                    <Link
                      key={sub}
                      href={`${item.href}?sub=${encodeURIComponent(sub)}`}
                      onClick={() => setMobileOpen(false)}
                      className="block py-1.5 text-xs text-gray-500 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.color = M_BLUE)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 border-t mt-4 space-y-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => { setMobileOpen(false); setLoginOpen(true); }}
                  className="w-full flex items-center gap-3 p-3 text-sm font-bold rounded-lg text-white transition-colors"
                  style={{ backgroundColor: M_BLUE }}
                >
                  <User size={17} /> Login
                </button>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center p-3 text-sm font-bold rounded-lg border-2 transition-colors"
                  style={{ borderColor: M_BLUE, color: M_BLUE }}
                >
                  Create Account
                </Link>
              </>
            ) : (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-gray-700 rounded-lg hover:bg-blue-50 transition-colors">
                  <User size={17} /> My Account
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
