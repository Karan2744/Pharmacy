import Image from "next/image";
import Link from "next/link";
import PopularItemsClient from "@/components/PopularItemsClient";
import ProductCarousel from "@/components/ProductCarousel";
import FAQAccordion from "@/components/FAQAccordion";
import { Star, ChevronRight, Upload, ArrowRight, ShieldCheck, Truck, CheckCircle, Zap, Award, Clock } from "lucide-react";

const M_BLUE  = "#0070B3";
const M_DARK  = "#005A92";
const M_LIGHT = "#EBF5FF";
const M_GREEN = "#00875A";

async function getHomeData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"}/api/home`, {
    next: { revalidate: 600 },
  }).catch(() => null);
  if (!res?.ok) {
    return {
      hero: {
        title: "Say GoodBye to high medicine prices",
        subtitle: "Compare prices and save up to 51%",
        bannerImage: "https://assets.truemeds.in/Images/website-assets/images/home-banner/home-banner-desktop.png",
        phone: "09240250346",
        badge: "India's #1 Online Pharmacy",
      },
      banners: [], categories: [], popularItems: [], deals: [], newArrivals: [], articles: [], testimonials: [], faqs: [], stats: [],
    };
  }
  return res.json();
}

const HEADER_CATS = [
  { name: "Medicines",      icon: "💊", href: "/categories/medicines",        bg: "#EBF5FF", border: "#B3D4EE", text: "#005A92" },
  { name: "Vitamins",       icon: "🌿", href: "/categories/vitamins",          bg: "#EDFAF3", border: "#A7DFC4", text: "#00694A" },
  { name: "Personal Care",  icon: "🧴", href: "/categories/personal-care-1",   bg: "#F0F4FF", border: "#C0CFF8", text: "#3B4DA0" },
  { name: "Health Devices", icon: "🩺", href: "/categories/health-conditions", bg: "#EEF8FF", border: "#A8DDF8", text: "#0070B3" },
  { name: "Baby Care",      icon: "👶", href: "/categories/baby-care",         bg: "#FFF6ED", border: "#FECBA1", text: "#B45309" },
  { name: "Diabetes Care",  icon: "🩸", href: "/search?q=diabetes",            bg: "#FFF0F0", border: "#FECACA", text: "#B91C1C" },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "FDA/GMP Certified",          sub: "100% authentic" },
  { icon: Award,       text: "Licensed Pharmacy",          sub: "Govt. approved" },
  { icon: Truck,       text: "Free delivery above ₹500",   sub: "Pan India" },
  { icon: Clock,       text: "Same-day dispatch",          sub: "Order before 3 PM" },
];

export default async function Home() {
  const data = await getHomeData();

  return (
    <main className="flex flex-col pb-16" style={{ background: "#F5F9FC" }}>

      {/* ── PROMO BAR ──────────────────────────────────────────────── */}
      <div className="text-white text-center text-xs py-2 font-semibold" style={{ backgroundColor: M_BLUE }}>
        ✚ Save up to 80% on generic medicines &nbsp;|&nbsp; Free delivery above ₹500 &nbsp;|&nbsp; Trusted by 5M+ Indians
      </div>

      {/* ── CATEGORY QUICK-NAV + HERO ──────────────────────────────── */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

          {/* Category quick-nav */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
            {HEADER_CATS.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex flex-col items-center justify-center text-center rounded-xl p-3 md:p-4 hover:-translate-y-1 transition-all duration-200"
                style={{ backgroundColor: cat.bg, border: `1.5px solid ${cat.border}`, minHeight: "90px" }}
              >
                <span className="text-2xl md:text-3xl mb-1.5">{cat.icon}</span>
                <span className="text-[10px] md:text-xs font-bold leading-tight" style={{ color: cat.text }}>{cat.name}</span>
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mb-5">Browse by health category</p>

          {/* Hero Banner */}
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "clamp(180px, 28vw, 340px)" }}>
            <Image
              src={data.hero.bannerImage}
              alt="MauryaRx Pharmacy"
              fill className="object-cover" priority
              sizes="(max-width: 768px) 100vw, 80vw"
            />
            <div
              className="absolute inset-0 flex flex-col justify-center pl-6 md:pl-12"
              style={{ background: `linear-gradient(90deg, ${M_BLUE}DD 0%, ${M_BLUE}66 50%, transparent 80%)` }}
            >
              <span className="inline-block bg-white/20 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-2 max-w-fit">
                ✚ {data.hero.badge}
              </span>
              <h1 className="text-white font-black leading-tight mb-2" style={{ fontSize: "clamp(16px, 3.5vw, 36px)" }}>
                Save up to <span className="text-yellow-300">80%</span><br />on medicines
              </h1>
              <p className="text-white/80 text-xs md:text-sm mb-4 max-w-xs">{data.hero.subtitle}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/categories/medicines"
                  className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-white px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  Shop Now <ArrowRight size={13} />
                </Link>
                <Link
                  href="/search"
                  className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold bg-white rounded-lg px-4 py-2 transition-colors hover:bg-blue-50"
                  style={{ color: M_BLUE }}
                >
                  <Upload size={13} /> Upload Prescription
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: M_LIGHT }}>
                    <Icon size={17} style={{ color: M_BLUE }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{t.text}</p>
                    <p className="text-[10px] text-gray-400">{t.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DB PROMO BANNERS ───────────────────────────────────────── */}
      {data.banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.banners.map((b) => (
              <div
                key={b.id}
                className={`relative overflow-hidden bg-gradient-to-r ${b.gradient} rounded-xl p-4 text-white cursor-pointer hover:-translate-y-0.5 transition-all`}
              >
                {b.tag && <span className="absolute top-2 right-2 bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{b.tag}</span>}
                <h3 className="text-sm font-extrabold mb-0.5">{b.title}</h3>
                <p className="text-[10px] text-white/80 mb-3">{b.subtitle}</p>
                <button className="text-[10px] font-black bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg">{b.buttonText}</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS FOR YOU ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-6">
        <div className="flex gap-5">

          {/* Sidebar filter */}
          <aside className="hidden lg:block w-56 shrink-0 self-start sticky top-[140px]">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: M_LIGHT }}>
                <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: M_BLUE }}>FILTERS</p>
                <p className="text-[11px] text-gray-500">1000+ products</p>
              </div>

              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">Sort By</p>
                <select className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none" style={{ accentColor: M_BLUE }}>
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>New Arrivals</option>
                  <option>Most Popular</option>
                </select>
              </div>

              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">Category</p>
                {["Medicines", "Vitamins", "Personal Care", "Health Devices", "Baby Care"].map((c) => (
                  <label key={c} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" className="rounded" style={{ accentColor: M_BLUE }} />
                    <span className="text-xs text-gray-600">{c}</span>
                  </label>
                ))}
              </div>

              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">Discount</p>
                {["10% off & above", "20% off & above", "30% off & above", "50% off & above"].map((d) => (
                  <label key={d} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" className="rounded" style={{ accentColor: M_BLUE }} />
                    <span className="text-xs text-gray-600">{d}</span>
                  </label>
                ))}
              </div>

              <div className="p-4">
                <p className="text-xs font-bold text-gray-700 mb-2">Rating</p>
                {["4★ & above", "3★ & above", "2★ & above"].map((r) => (
                  <label key={r} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="rating" style={{ accentColor: M_BLUE }} />
                    <span className="text-xs text-gray-600">{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Products for you</h2>
                <p className="text-xs text-gray-400 mt-0.5">Medicines &amp; healthcare products</p>
              </div>
              <Link href="/search" className="flex items-center gap-1 text-sm font-bold transition-colors" style={{ color: M_BLUE }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>

            {data.popularItems.length > 0 ? (
              <PopularItemsClient items={data.popularItems} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-4xl mb-3">💊</p>
                <p className="text-gray-500 font-semibold">Products loading from database…</p>
                <Link href="/search" className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: M_BLUE }}>
                  Browse Medicines
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── GENERIC SUBSTITUTE BANNER ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-8">
        <div
          className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: `linear-gradient(135deg, ${M_BLUE} 0%, ${M_DARK} 100%)` }}
        >
          <div className="text-white text-center md:text-left">
            <div className="font-bold text-xs uppercase mb-1.5 tracking-widest" style={{ color: "#A8D8F0" }}>The Smarter Choice</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Switch to Generic Substitutes</h2>
            <p className="text-sm max-w-md mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>
              Same active ingredients as branded medicines — FDA/GMP certified, equally safe, and up to 80% cheaper.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {["Same formula", "Doctor approved", "GMP certified"].map((tag) => (
                <div key={tag} className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <CheckCircle size={12} className="text-yellow-300" /> {tag}
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/search"
            className="shrink-0 px-7 py-3 bg-white font-black rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
            style={{ color: M_BLUE }}
          >
            Find Substitutes →
          </Link>
        </div>
      </section>

      {/* ── DEALS ──────────────────────────────────────────────────── */}
      {data.deals?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Deals You&apos;ll Love</h2>
              <p className="text-xs text-gray-400 mt-0.5">Best prices on top medicines</p>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-sm font-bold" style={{ color: M_BLUE }}>
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <ProductCarousel items={data.deals} />
        </section>
      )}

      {/* ── NEW ARRIVALS ───────────────────────────────────────────── */}
      {data.newArrivals?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">New Arrivals</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest additions to our pharmacy</p>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-sm font-bold" style={{ color: M_BLUE }}>
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <ProductCarousel items={data.newArrivals} />
        </section>
      )}

      {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
      {data.testimonials?.length > 0 && (
        <section className="mt-10 py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1 text-center">What our customers say</h2>
            <p className="text-gray-400 text-sm text-center mb-8">Trusted by 5 million+ happy customers across India</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data.testimonials.map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: M_BLUE }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{t.name}</p>
                      <p className="text-gray-400 text-[10px]">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STATS ──────────────────────────────────────────────────── */}
      {data.stats?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-gray-200">
            {data.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: M_BLUE }}>{s.value}</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ABOUT / SEO SECTION ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-10 bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-black text-gray-900 mb-4">MauryaRx: Affordable Online Pharmacy at Your Fingertips</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          There are many benefits of ordering medicines online. You can take your time and look at different options to find exactly what you need. It&apos;s easy to compare prices online and find the best generic substitutes. Now with MauryaRx, you can order medicines and healthcare products at the lowest prices in India — with free delivery above ₹500.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Medicines &amp; Healthcare</h3>
            <p className="leading-relaxed">We have a vast inventory of medicines ranging from antibiotics to vitamins to personal care products. With over 10,000+ products, MauryaRx is sure to have everything you need.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Generic Substitutes</h3>
            <p className="leading-relaxed">Same active ingredients as branded medicines, FDA/GMP certified, equally safe and effective — at up to 80% less cost. Our pharmacist will help you find the right substitute.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Trusted Pharmacy</h3>
            <p className="leading-relaxed">Licensed and government-approved. Trusted by 5 million+ Indians across the country. Cash on delivery available. Free delivery on orders above ₹500.</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Popular Searches</h4>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {["Paracetamol","Vitamin D3","Metformin","Atorvastatin","Azithromycin","Cetirizine","Omeprazole","Amlodipine","Metoprolol","Losartan","Glimepiride","Pantoprazole","Telmisartan","Rosuvastatin","Face Wash","Hand Sanitizer","BP Monitor","Glucometer"].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-[#0070B3] hover:text-[#0070B3]"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      {data.faqs?.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 md:px-6 w-full mt-10">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <FAQAccordion faqs={data.faqs} />
        </section>
      )}

    </main>
  );
}
