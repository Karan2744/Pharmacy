"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import {
  ShoppingCart, Plus, Minus, Star, ShieldCheck, Truck, CheckCircle,
  Heart, Share2, MapPin, Package, ChevronRight, ChevronDown, ChevronUp,
  RefreshCw, Wine, Baby, Car, Activity, Droplets, Pill, Zap,
} from "lucide-react";
import { slugify } from "@/lib/slugify";

/* ── Delivery-check widget ──────────────────────────────────────────────── */
function DeliveryCheck() {
  const [pin,     setPin]     = useState("");
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!/^\d{6}$/.test(pin)) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`/api/pincodes/check?pincode=${pin}`);
      setResult(await res.json());
    } catch { setResult({ available: false, message: "Could not check pincode." }); }
    finally { setLoading(false); }
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Truck size={15} style={{ color: "#e73096" }} />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Check Delivery</span>
      </div>
      <div className="flex gap-2">
        <div className="flex items-center flex-1 border border-gray-200 rounded-xl overflow-hidden">
          <MapPin size={14} className="ml-3 text-gray-400 shrink-0" />
          <input
            type="text"
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            className="flex-1 px-2 py-2.5 text-sm font-mono outline-none"
          />
        </div>
        <button
          onClick={check}
          disabled={loading || pin.length !== 6}
          className="px-4 py-2.5 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
          style={{ backgroundColor: "#e73096" }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#c4007a"; }}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e73096")}
        >
          {loading ? "…" : "Check"}
        </button>
      </div>
      {result && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-medium ${result.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          <span>{result.available ? "✅" : "❌"}</span>
          <div>
            <p className="font-bold">{result.available ? "Delivery Available!" : "Not Serviceable"}</p>
            <p className="opacity-80">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Safety level config ─────────────────────────────────────────────────── */
const SAFETY_CFG = {
  safe:     { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-800"  },
  moderate: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-800" },
  unsafe:   { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-800"      },
  consult:  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-800"},
};
const SAFETY_LABEL = { safe: "Safe", moderate: "Moderate", unsafe: "Unsafe", consult: "Consult Doctor" };

function SafetyCard({ Icon, label, level = "consult", advice }) {
  const cfg = SAFETY_CFG[level] || SAFETY_CFG.consult;
  return (
    <div className={`rounded-2xl border p-4 ${cfg.border} ${cfg.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className={cfg.text} />
        <span className="text-xs font-bold text-gray-700">{label}</span>
      </div>
      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${cfg.badge}`}>
        {SAFETY_LABEL[level] || "Consult Doctor"}
      </span>
      {advice && <p className="text-[11px] text-gray-600 leading-relaxed">{advice}</p>}
    </div>
  );
}

/* ── FAQ accordion ──────────────────────────────────────────────────────── */
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left py-4 flex items-center justify-between gap-4"
      >
        <span className="text-sm font-semibold text-gray-800">{question}</span>
        {open ? <ChevronUp size={15} className="text-gray-400 shrink-0" /> : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
      </button>
      {open && <p className="pb-4 text-sm text-gray-600 leading-relaxed">{answer}</p>}
    </div>
  );
}

/* ── Section wrapper ────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 p-6">
      <h2 className="text-sm font-extrabold text-gray-900 mb-4 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

/* ── Bullet list ────────────────────────────────────────────────────────── */
function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: "#e73096" }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ── Substitute card ────────────────────────────────────────────────────── */
function SubCard({ p }) {
  const gstPercent = p.adminGstPercent || 0;
  const mrpWithGst = p.mrp && gstPercent > 0 ? p.mrp * (1 + gstPercent / 100) : p.mrp;
  const disc = mrpWithGst && p.price ? Math.round(((mrpWithGst - p.price) / mrpWithGst) * 100) : 0;
  return (
    <Link
      href={`/medicine/${slugify(p.name)}-${p._id}`}
      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 transition-all group"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e73096"; e.currentTarget.style.background = "#fdf0f7"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.background = ""; }}
    >
      <div className="relative w-14 h-14 shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
        {p.image ? (
          <Image
            src={p.image} alt={p.name} fill
            className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
            sizes="56px"
            unoptimized={p.image?.startsWith("data:")}
          />
        ) : (
          <Package size={22} className="text-gray-200 m-auto mt-3" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate" style={{ color: "inherit" }}>{p.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{p.brand}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-sm font-black text-gray-900">₹{priceWithGst.toFixed(2)}</span>
          {mrpWithGst > priceWithGst && <span className="text-[10px] text-gray-400 line-through">₹{mrpWithGst.toFixed(2)}</span>}
          {disc > 0 && <span className="text-[10px] font-bold text-green-600">{disc}% off</span>}
        </div>
      </div>
    </Link>
  );
}

/* ── Fallback generic content ────────────────────────────────────────────── */
function fallback(product) {
  const name  = product.name  || "This product";
  const brand = product.brand || "the manufacturer";
  const sub   = product.subCategory || product.category || "healthcare";
  const isTopical = ["Skin Care","Face Care","Body Care","Oral Care","Hair Care"].includes(sub);
  return {
    about:       `${name} is a trusted product by ${brand} designed for ${sub.toLowerCase()} needs. It belongs to the ${product.category || "healthcare"} category and is sourced from GMP-certified manufacturers. Each unit is quality-checked to ensure you receive genuine, effective product.`,
    howItWorks:  `${name} works by targeting the underlying causes associated with ${sub.toLowerCase()} conditions. Its active ingredients act synergistically to provide effective relief and care.`,
    uses:        [`Primarily used for ${sub.toLowerCase()} needs.`, `Helps manage symptoms associated with ${sub.toLowerCase()} conditions.`, `Consult a doctor for personalised dosage guidance.`],
    sideEffects: [`Like all medicines, ${name} may cause side effects in some individuals.`, `Common side effects are usually mild and temporary.`, `Discontinue use and consult a doctor if you experience severe reactions.`],
    howToUse:    isTopical
      ? [`Clean and dry the area before application.`, `Apply a thin layer to the affected area.`, `Gently massage until absorbed.`, `Use as directed, typically once or twice daily.`]
      : [`Take exactly as prescribed by your doctor.`, `Swallow with a full glass of water.`, `Do not crush or chew unless directed.`, `Store in a cool, dry place below 30°C.`],
    interactions:[`Always inform your doctor about other medicines you take.`, `Some combinations may reduce effectiveness or increase side effects.`],
    highlights:  isTopical
      ? [`Dermatologically tested`, `Fast-absorbing formula`, `Suitable for daily use`, `GMP certified manufacturing`]
      : [`Same active ingredient as branded version`, `FDA/GMP certified`, `Doctor verified formula`, `Up to ${product.discount || "20%"} savings`, `Genuine medicine from licensed pharmacy`],
  };
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function ProductDetailClient({ product, relatedProducts = [], substitutes = [] }) {
  const router = useRouter();
  const { addToCart, isAuthenticated } = useCart();
  const [quantity,    setQuantity]    = useState(1);
  const [toast,       setToast]       = useState("");
  const [wishlist,    setWishlist]    = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const inStock     = (product.stock ?? 0) > 0;
  
  // Calculate prices with GST applied
  const baseMrp     = product.mrp || 0;
  const gstPercent  = product.adminGstPercent || 0;
  const mrpWithGst  = gstPercent > 0 ? baseMrp * (1 + gstPercent / 100) : baseMrp;
  
  const basePrice   = product.price || 0;
  const priceWithGst = gstPercent > 0 ? basePrice * (1 + gstPercent / 100) : basePrice;
  const gstOnPrice  = gstPercent > 0 ? basePrice * (gstPercent / 100) : 0;
  
  const discountPct = mrpWithGst && priceWithGst
    ? Math.round(((mrpWithGst - priceWithGst) / mrpWithGst) * 100)
    : 0;
  const savings     = mrpWithGst && priceWithGst ? Math.round(mrpWithGst - priceWithGst) : 0;

  const fb     = fallback(product);
  const about       = product.aboutDrug       || fb.about;
  const howItWorks  = product.howItWorks      || fb.howItWorks;
  const uses        = product.usesText?.length    ? product.usesText    : fb.uses;
  const sideEffects = product.sideEffectsText?.length ? product.sideEffectsText : fb.sideEffects;
  const howToUse    = product.howToUseText?.length ? product.howToUseText : fb.howToUse;
  const interactions= product.drugInteractions?.length ? product.drugInteractions : fb.interactions;
  const highlights  = product.highlightsText?.length  ? product.highlightsText  : fb.highlights;
  const faqs        = product.faqs?.length ? product.faqs : [];

  const sa    = product.safetyAdvice || {};
  const SAFETY_ITEMS = [
    { key: "alcohol",   Icon: Wine,     label: "Alcohol"       },
    { key: "pregnancy", Icon: Baby,     label: "Pregnancy"     },
    { key: "lactation", Icon: Droplets, label: "Breastfeeding" },
    { key: "driving",   Icon: Car,      label: "Driving"       },
    { key: "kidney",    Icon: Activity, label: "Kidney"        },
    { key: "liver",     Icon: Zap,      label: "Liver"         },
  ];

  const images = product.images?.length
    ? product.images
    : Array.from({ length: 4 }, () => product.image || "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png");

  const handleAddToCart = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    addToCart(product, quantity);
    setToast("Added to cart!");
    setTimeout(() => setToast(""), 2500);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    addToCart(product, quantity);
    router.push("/cart");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setToast("Link copied!");
      setTimeout(() => setToast(""), 2000);
    }
  };

  const hasSafetyData = SAFETY_ITEMS.some(({ key }) => sa[key]?.advice);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* ── TOP SECTION ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

          {/* LEFT — Image gallery */}
          <div className="p-5 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col items-center bg-gray-50">
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <Image
                src={images[activeImage] || images[0]}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 768px) 100vw, 420px"
                priority
                unoptimized={(images[activeImage] || "").startsWith("data:")}
              />
              {discountPct > 0 && (
                <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                  {discountPct}% OFF
                </span>
              )}
              {product.prescriptionRequired && (
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-lg">
                  Rx
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 mt-4">
              {images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                    activeImage === i ? "shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={activeImage === i ? { borderColor: "#e73096" } : {}}
                >
                  <Image
                    src={img} alt={`View ${i + 1}`} fill
                    className="object-contain p-1.5"
                    sizes="56px"
                    unoptimized={img.startsWith("data:")}
                  />
                </button>
              ))}
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setWishlist((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  wishlist ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Heart size={13} className={wishlist ? "fill-red-500" : ""} />
                {wishlist ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-500 hover:border-gray-300 transition-colors"
              >
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>

          {/* RIGHT — Product details */}
          <div className="p-5 lg:p-8 flex flex-col gap-4">

            {/* Category breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <Link href="/" className="hover:text-[#00a8e1]">Home</Link>
              <ChevronRight size={10} />
              {product.category && (
                <>
                  <Link href={`/categories/${slugify(product.category)}`} className="hover:text-[#00a8e1]">
                    {product.category}
                  </Link>
                  <ChevronRight size={10} />
                </>
              )}
              {product.subCategory && (
                <>
                  <Link
                    href={`/categories/${slugify(product.category)}?sub=${encodeURIComponent(product.subCategory)}`}
                    className="hover:text-[#00a8e1]"
                  >
                    {product.subCategory}
                  </Link>
                  <ChevronRight size={10} />
                </>
              )}
              <span className="text-gray-600 font-medium truncate max-w-[140px]">{product.name}</span>
            </div>

            {/* Title + brand + pack size */}
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug">
                {product.name}
              </h1>
              {product.packSize && (
                <p className="text-xs text-gray-500 mt-0.5">{product.packSize}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                by <span className="font-semibold text-gray-700">{product.brand}</span>
                {product.manufacturer && product.manufacturer !== product.brand && (
                  <span className="text-gray-400"> · Mfr: {product.manufacturer}</span>
                )}
              </p>
              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                {product.subCategory && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: "#fce4f3", color: "#e73096" }}>
                    {product.subCategory}
                  </span>
                )}
                {product.prescriptionRequired && (
                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100">
                    Prescription Required
                  </span>
                )}
              </div>
            </div>

            {/* Rating + stock */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-black px-2 py-0.5 rounded">
                  {Number(product.rating).toFixed(1)} <Star size={9} fill="white" />
                </div>
                {product.reviews && (
                  <span className="text-xs text-gray-400">{Number(product.reviews).toLocaleString()} ratings</span>
                )}
                <span className="text-gray-200">|</span>
                <span className={`text-xs font-bold ${inStock ? "text-green-600" : "text-red-500"}`}>
                  {inStock ? "✓ In Stock" : "✗ Out of Stock"}
                </span>
              </div>
            )}

            {/* Salt composition */}
            {product.saltComposition && (
              <div className="rounded-xl px-4 py-3" style={{ background: "#fce4f3", border: "1px solid #f8b4dd" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#e73096" }}>Salt Composition</p>
                <p className="text-xs font-semibold text-gray-800">{product.saltComposition}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-gray-50 rounded-2xl px-5 py-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-gray-900">₹{priceWithGst.toFixed(2)}</span>
                {mrpWithGst > priceWithGst && (
                  <span className="text-sm text-gray-400 line-through">MRP ₹{mrpWithGst.toFixed(2)}</span>
                )}
                {discountPct > 0 && (
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {discountPct}% off
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-xs text-green-700 font-semibold mt-1">You save ₹{savings} on this order</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">*Price inclusive of all taxes</p>
              
              {/* Selling Price GST Breakdown */}
              {gstPercent > 0 && basePrice && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Base Selling Price:</span>
                    <span className="font-semibold text-gray-900">₹{basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">GST ({gstPercent}%):</span>
                    <span className="font-semibold text-gray-900">₹{gstOnPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-t border-gray-300 pt-1">
                    <span className="text-gray-900">Total with GST:</span>
                    <span className="text-gray-900">₹{priceWithGst.toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              {/* MRP GST Breakdown */}
              {gstPercent > 0 && baseMrp && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700 mb-2">MRP Breakdown:</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Base MRP:</span>
                    <span className="font-semibold text-gray-900">₹{baseMrp.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">GST ({gstPercent}%):</span>
                    <span className="font-semibold text-gray-900">₹{(mrpWithGst - baseMrp).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-t border-gray-300 pt-1">
                    <span className="text-gray-900">Final MRP (with GST):</span>
                    <span className="text-gray-900">₹{mrpWithGst.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Meesho-style trust badges */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: "🏷️", label: "Lowest Price" },
                { icon: "↩️", label: "7 Day Return" },
                { icon: "💵", label: "Cash on Delivery" },
                { icon: "🚚", label: "Free Delivery" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center text-center p-2 rounded-xl border border-gray-100 bg-gray-50">
                  <span className="text-lg mb-0.5">{b.icon}</span>
                  <span className="text-[9px] font-bold text-gray-600 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Key highlights */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Key Highlights</p>
              <div className="flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <span key={h} className="text-[11px] font-medium px-2.5 py-1 rounded-full border" style={{ background: "#fce4f3", color: "#e73096", borderColor: "#f8b4dd" }}>
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Qty + CTAs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Qty:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                    <Minus size={13} className="text-gray-700" />
                  </button>
                  <span className="px-5 py-2 text-sm font-black text-gray-900 border-x-2 border-gray-200">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                    <Plus size={13} className="text-gray-700" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!inStock ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "text-white shadow-md"}`}
                  style={inStock ? { backgroundColor: "#e73096" } : {}}
                  onMouseEnter={(e) => { if (inStock) e.currentTarget.style.backgroundColor = "#c4007a"; }}
                  onMouseLeave={(e) => { if (inStock) e.currentTarget.style.backgroundColor = "#e73096"; }}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={handleBuyNow}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${!inStock ? "border-gray-200 text-gray-400 cursor-not-allowed" : ""}`}
                  style={inStock ? { borderColor: "#e73096", color: "#e73096" } : {}}
                  onMouseEnter={(e) => { if (inStock) e.currentTarget.style.background = "#fce4f3"; }}
                  onMouseLeave={(e) => { if (inStock) e.currentTarget.style.background = ""; }}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Delivery check */}
            <DeliveryCheck />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              {[
                { icon: <ShieldCheck size={15} className="text-green-500" />, label: "100% Genuine",    sub: "Certified medicines"  },
                { icon: <RefreshCw   size={15} style={{ color: "#e73096" }} />, label: "7 Day Returns", sub: "Easy return policy"   },
                { icon: <Truck       size={15} className="text-orange-500"/>, label: "Free Delivery",  sub: "Tamper-proof packing" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl">
                  <div className="mb-1">{b.icon}</div>
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">{b.label}</span>
                  <span className="text-[9px] text-gray-400 leading-tight">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      <Section title={`About ${product.name}`}>
        <p className="text-sm text-gray-700 leading-relaxed">{about}</p>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
            <strong>Disclaimer:</strong> This product information is for general awareness only and is not a substitute for professional medical advice. Always consult a registered healthcare provider before use.
          </p>
        </div>
      </Section>

      {/* ── USES ─────────────────────────────────────────────────────────────── */}
      <Section title={`Uses of ${product.name}`}>
        <BulletList items={uses} />
      </Section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      {howItWorks && (
        <Section title={`How ${product.name} Works`}>
          <p className="text-sm text-gray-700 leading-relaxed">{howItWorks}</p>
        </Section>
      )}

      {/* ── SIDE EFFECTS ─────────────────────────────────────────────────────── */}
      <Section title="Side Effects">
        <BulletList items={sideEffects} />
      </Section>

      {/* ── HOW TO USE ───────────────────────────────────────────────────────── */}
      <Section title="How to Use">
        <BulletList items={howToUse} />
        {product.storageInfo && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3" style={{ background: "#fce4f3", border: "1px solid #f8b4dd" }}>
            <Pill size={14} className="mt-0.5 shrink-0" style={{ color: "#e73096" }} />
            <div>
              <p className="text-xs font-bold text-gray-700 mb-0.5">Storage</p>
              <p className="text-xs text-gray-600">{product.storageInfo}</p>
            </div>
          </div>
        )}
      </Section>

      {/* ── DRUG INTERACTIONS ────────────────────────────────────────────────── */}
      {interactions?.length > 0 && (
        <Section title="Drug Interactions">
          <BulletList items={interactions} />
        </Section>
      )}

      {/* ── SAFETY ADVICE ────────────────────────────────────────────────────── */}
      {(hasSafetyData || true) && (
        <Section title="Safety Advice">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SAFETY_ITEMS.map(({ key, Icon, label }) => (
              <SafetyCard
                key={key}
                Icon={Icon}
                label={label}
                level={sa[key]?.level || "consult"}
                advice={sa[key]?.advice || ""}
              />
            ))}
          </div>
        </Section>
      )}

      {/* ── PRODUCT INFORMATION TABLE ─────────────────────────────────────────── */}
      <Section title="Product Information">
        <div className="divide-y divide-gray-50">
          {[
            { label: "Brand / Marketer",  value: product.brand },
            { label: "Manufacturer",      value: product.manufacturer || product.brand },
            { label: "Category",          value: product.category },
            { label: "Sub-category",      value: product.subCategory },
            { label: "Salt Composition",  value: product.saltComposition },
            { label: "Pack Size",         value: product.packSize },
            { label: "MRP",               value: `₹${product.mrp}` },
            { label: "Selling Price",     value: `₹${product.price}` },
            { label: "Admin GST",         value: product.adminGstPercent !== undefined ? `${product.adminGstPercent}%` : null },
            { label: "Admin CGST",        value: product.adminCgstPercent !== undefined ? `${product.adminCgstPercent}%` : null },
            { label: "You Save",          value: savings > 0 ? `₹${savings} (${discountPct}%)` : null },
            { label: "Availability",      value: inStock ? `In Stock (${product.stock} units)` : "Out of Stock" },
            { label: "Prescription",      value: product.prescriptionRequired ? "Required" : "Not Required" },
            { label: "Storage",           value: product.storageInfo || "Store below 30°C in a cool, dry place" },
          ]
            .filter((f) => f.value && f.value !== "undefined" && f.value !== "₹undefined")
            .map((f) => (
              <div key={f.label} className="flex items-start py-2.5 gap-4">
                <span className="text-xs text-gray-400 font-semibold w-40 shrink-0">{f.label}</span>
                <span className={`text-xs font-bold ${f.label === "Availability" ? (inStock ? "text-green-600" : "text-red-500") : "text-gray-800"}`}>
                  {f.value}
                </span>
              </div>
            ))}
        </div>
      </Section>

      {/* ── SUBSTITUTES (same salt composition) ──────────────────────────────── */}
      {substitutes.length > 0 && (
        <Section title={`Substitutes for ${product.name}`}>
          <p className="text-xs text-gray-500 mb-4">
            Same salt composition · Different brands · Compare prices
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {substitutes.map((s) => (
              <SubCard key={s._id} p={s} />
            ))}
          </div>
        </Section>
      )}

      {/* ── EDITORIAL INFO ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ background: "#fce4f3", color: "#e73096" }}>W</div>
            <div>
              <p className="font-bold text-gray-700">Written by Medical Content Team</p>
              <p className="text-[10px]">Pharmacist reviewed · Updated {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-100" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">R</div>
            <div>
              <p className="font-bold text-gray-700">Reviewed by Licensed Pharmacist</p>
              <p className="text-[10px]">MBBS · 10+ years experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQs ─────────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <Section title="Frequently Asked Questions">
          {faqs.map((f, i) => (
            <FAQItem key={i} question={f.question} answer={f.answer} />
          ))}
        </Section>
      )}

      {/* ── CUSTOMERS ALSO BOUGHT ─────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 p-6 overflow-hidden">
          <h2 className="text-base font-extrabold text-gray-900 mb-4">Customers Also Bought</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {relatedProducts.map((p) => {
              const pDisc = p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
              return (
                <Link
                  key={p._id}
                  href={`/medicine/${slugify(p.name)}-${p._id}`}
                  className="shrink-0 w-36 group"
                >
                  <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mb-2 flex items-center justify-center p-2">
                    {p.image ? (
                      <Image
                        src={p.image} alt={p.name} fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        sizes="144px"
                        unoptimized={p.image?.startsWith("data:")}
                      />
                    ) : (
                      <Package size={28} className="text-gray-200" />
                    )}
                    {pDisc > 0 && (
                      <span className="absolute top-1 left-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                        {pDisc}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.brand}</p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-black text-gray-900">₹{p.price}</span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="text-[9px] text-gray-400 line-through">₹{p.mrp}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
