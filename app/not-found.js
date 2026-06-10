import Link from "next/link";
import {
  Home, Search, Pill, ShieldCheck, Truck, Phone,
  ArrowRight, RefreshCw,
} from "lucide-react";

const QUICK_LINKS = [
  { href: "/categories/medicines",         label: "Medicines",              emoji: "💊" },
  { href: "/categories/personal-care-1",   label: "Personal Care",          emoji: "🧴" },
  { href: "/categories/health-conditions", label: "Health Conditions",      emoji: "🩺" },
  { href: "/categories/vitamins",          label: "Vitamins & Supplements",  emoji: "🌿" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, text: "100% Genuine Medicines" },
  { icon: Truck,       text: "Fast Home Delivery"     },
  { icon: RefreshCw,   text: "Easy 15-Day Returns"    },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 flex flex-col">

      {/* ── Hero 404 block ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">

        {/* Animated pill illustration */}
        <div className="relative mb-8 select-none">
          {/* Glowing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-52 h-52 rounded-full bg-[#00a8e1]/10 animate-pulse" />
          </div>
          {/* Outer ring */}
          <div className="relative w-44 h-44 rounded-full bg-white shadow-xl border-4 border-[#00a8e1]/20 flex items-center justify-center mx-auto">
            {/* Pill icon */}
            <div className="text-7xl leading-none">💊</div>
            {/* Small floating badges */}
            <span className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-red-100 border-2 border-white shadow flex items-center justify-center text-lg">❓</span>
            <span className="absolute -bottom-2 -left-2 w-9 h-9 rounded-full bg-yellow-100 border-2 border-white shadow flex items-center justify-center text-lg">🔍</span>
          </div>
        </div>

        {/* 404 number */}
        <div className="relative mb-2">
          <p className="text-[110px] md:text-[140px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#00a8e1] via-blue-400 to-blue-600 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#00a8e1]/20 to-transparent" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Oops! Page Not Found
        </h1>

        {/* Pharmacy-themed sub-text */}
        <p className="text-gray-500 text-base md:text-lg max-w-md mx-auto leading-relaxed mb-2">
          Looks like this prescription doesn&apos;t exist in our system.
        </p>
        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-10">
          The page you&apos;re looking for may have been moved, deleted, or the URL might be incorrect.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-14">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#00a8e1] hover:bg-[#008ec4] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home size={17} />
            Go to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[#00a8e1] text-[#00a8e1] font-bold rounded-2xl hover:bg-blue-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search size={17} />
            Search Medicines
          </Link>
        </div>

        {/* ── Quick category links ────────────────────────────────────── */}
        <div className="w-full max-w-2xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Browse Popular Categories
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map(({ href, label, emoji }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center gap-2 bg-white border border-gray-100 hover:border-[#00a8e1] hover:bg-blue-50/40 rounded-2xl p-4 shadow-sm transition-all hover:-translate-y-0.5"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-bold text-gray-700 group-hover:text-[#00a8e1] text-center leading-tight transition-colors">
                  {label}
                </span>
                <ArrowRight size={12} className="text-gray-300 group-hover:text-[#00a8e1] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust strip ───────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-center gap-6">
          {TRUST_BADGES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-xs font-semibold text-gray-500">
              <Icon size={15} className="text-[#00a8e1]" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Help strip ─────────────────────────────────────────────────── */}
      <div className="bg-[#00a8e1]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-white">
            <Phone size={16} className="shrink-0" />
            <span className="text-sm font-semibold">
              Need help? Call us at <strong>1800-XXX-XXXX</strong> (Mon–Sat, 9 AM–9 PM)
            </span>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            <Pill size={13} />
            Find Medicine
          </Link>
        </div>
      </div>

    </main>
  );
}
