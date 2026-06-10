"use client";

import { useState } from "react";
import {
  X, Package, Tag, Boxes, ChevronDown, Trash2, Plus, Minus,
  Pill, ShieldCheck, FlaskConical, Info, HelpCircle,
  Wine, Baby, Car, Activity, Droplets, Zap,
} from "lucide-react";
import Image from "next/image";

/* ── small shared input styles ───────────────────────────────────────────── */
const inp = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all placeholder:text-gray-400";
const label = "text-xs font-semibold text-gray-500 uppercase tracking-wide";

/* ── reusable array-field (list of strings) ──────────────────────────────── */
function ArrayField({ title, placeholder, value = [], onChange }) {
  const items = value.length ? value : [""];
  const update = (i, v) => { const n = [...items]; n[i] = v; onChange(n.filter((_, j) => j < n.length)); };
  const add    = () => onChange([...items, ""]);
  const remove = (i) => { const n = items.filter((_, j) => j !== i); onChange(n.length ? n : []); };
  return (
    <div className="space-y-2">
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={v}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            className={inp}
          />
          <button type="button" onClick={() => remove(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0">
            <Minus size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-[#00a8e1] hover:text-blue-700 transition-colors mt-1">
        <Plus size={13} /> Add {title}
      </button>
    </div>
  );
}

/* ── safety row ──────────────────────────────────────────────────────────── */
const SAFETY_LEVELS = ["consult", "safe", "moderate", "unsafe"];
const SAFETY_LEVEL_LABELS = { consult: "Consult Doctor", safe: "Safe", moderate: "Moderate", unsafe: "Unsafe" };
const SAFETY_ITEMS = [
  { key: "alcohol",   Icon: Wine,     label: "Alcohol"       },
  { key: "pregnancy", Icon: Baby,     label: "Pregnancy"     },
  { key: "lactation", Icon: Droplets, label: "Breastfeeding" },
  { key: "driving",   Icon: Car,      label: "Driving"       },
  { key: "kidney",    Icon: Activity, label: "Kidney"        },
  { key: "liver",     Icon: Zap,      label: "Liver"         },
];

function SafetyRow({ keyName, Icon, safetyLabel, value = {}, onChange }) {
  const level  = value.level  || "consult";
  const advice = value.advice || "";
  const levelColor = { consult: "text-orange-600", safe: "text-green-600", moderate: "text-yellow-600", unsafe: "text-red-600" }[level];

  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-gray-500" />
        <span className="text-xs font-bold text-gray-700">{safetyLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={label}>Level</label>
          <div className="relative">
            <select
              value={level}
              onChange={(e) => onChange({ ...value, level: e.target.value })}
              className={`${inp} appearance-none pr-9 ${levelColor} font-bold`}
            >
              {SAFETY_LEVELS.map((l) => (
                <option key={l} value={l}>{SAFETY_LEVEL_LABELS[l]}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1">
          <label className={label}>Advice (optional)</label>
          <input
            type="text"
            placeholder="e.g. Avoid during first trimester"
            value={advice}
            onChange={(e) => onChange({ ...value, advice: e.target.value })}
            className={inp}
          />
        </div>
      </div>
    </div>
  );
}

/* ── FAQ pair ────────────────────────────────────────────────────────────── */
function FAQPair({ value, onChange, onRemove }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">FAQ</span>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Question"
        value={value.question || ""}
        onChange={(e) => onChange({ ...value, question: e.target.value })}
        className={inp}
      />
      <textarea
        placeholder="Answer"
        value={value.answer || ""}
        onChange={(e) => onChange({ ...value, answer: e.target.value })}
        rows={2}
        className={`${inp} resize-none`}
      />
    </div>
  );
}

/* ── Tab definitions ─────────────────────────────────────────────────────── */
const TABS = [
  { id: "basic",    label: "Basic",    icon: Package   },
  { id: "medicine", label: "Medicine", icon: Pill       },
  { id: "druginfo", label: "Drug Info",icon: FlaskConical },
  { id: "safety",   label: "Safety",   icon: ShieldCheck },
  { id: "content",  label: "FAQs",     icon: HelpCircle  },
];

/* ── Main form ───────────────────────────────────────────────────────────── */
export default function ProductForm({
  showForm, setShowForm, handleSubmit,
  newProduct, setNewProduct,
  categories, subcategories, addSubcategory,
  isEditing,
}) {
  const [activeTab,     setActiveTab]     = useState("basic");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [imgError,      setImgError]      = useState(false);

  if (!showForm) return null;

  /* helpers */
  const set = (field, val) => setNewProduct((p) => ({ ...p, [field]: val }));
  const setSafety = (key, val) =>
    setNewProduct((p) => ({ ...p, safetyAdvice: { ...(p.safetyAdvice || {}), [key]: val } }));

  const handleFilesChange = async (files) => {
    const selected = Array.from(files).slice(0, 5);
    const readers  = selected.map((file) => new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    }));
    try {
      const urls = await Promise.all(readers);
      setImgError(false);
      setNewProduct((prev) => ({ ...prev, images: urls, image: urls[0] || prev.image }));
    } catch { setImgError(true); }
  };

  const removeImage = (index) => {
    setNewProduct((prev) => {
      const images = [...(prev.images || [])];
      images.splice(index, 1);
      return { ...prev, images, image: images[0] || "" };
    });
  };

  const handleAddSub = () => {
    if (!newSubcategory.trim()) return;
    addSubcategory(newSubcategory.trim());
    setNewSubcategory("");
  };

  const discount = newProduct.mrp && newProduct.price
    ? Math.round(((newProduct.mrp - newProduct.price) / newProduct.mrp) * 100)
    : 0;

  const gstPercent  = Number(newProduct.adminGstPercent)  || 0;
  const cgstPercent = Number(newProduct.adminCgstPercent) || 0;
  const totalTaxPercent      = gstPercent + cgstPercent;
  const gstAmount            = newProduct.price ? +(newProduct.price * gstPercent  / 100).toFixed(2) : 0;
  const cgstAmount           = newProduct.price ? +(newProduct.price * cgstPercent / 100).toFixed(2) : 0;
  const sellingPriceWithTax  = newProduct.price ? +(newProduct.price * (1 + totalTaxPercent / 100)).toFixed(2) : 0;

  const sa = newProduct.safetyAdvice || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Fill in medicine details below</p>
            </div>
          </div>
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 bg-gray-50 flex-shrink-0 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label: tabLabel, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon size={13} />
              {tabLabel}
            </button>
          ))}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">

            {/* ────────────────── TAB: BASIC ────────────────── */}
            {activeTab === "basic" && (
              <>
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className={label}>Product Name *</label>
                  <div className="relative">
                    <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" placeholder="e.g. Paracetamol 500mg Tablet 10s"
                      value={newProduct.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={`${inp} pl-10`} required
                    />
                  </div>
                </div>

                {/* Brand + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={label}>Brand *</label>
                    <input
                      type="text" placeholder="e.g. Sun Pharma"
                      value={newProduct.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      className={inp} required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>Category *</label>
                    <div className="relative">
                      <select
                        value={newProduct.category}
                        onChange={(e) => set("category", e.target.value)}
                        className={`${inp} appearance-none pr-9`}
                      >
                        {(categories || []).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Subcategory */}
                <div className="space-y-1.5">
                  <label className={label}>Subcategory</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={newProduct.subCategory}
                        onChange={(e) => set("subCategory", e.target.value)}
                        className={`${inp} appearance-none pr-9`}
                      >
                        {(subcategories || []).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                      type="text" placeholder="New subcategory…"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSub())}
                      className="w-40 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all placeholder:text-gray-400"
                    />
                    <button type="button" onClick={handleAddSub}
                      className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
                      + Add
                    </button>
                  </div>
                </div>

                {/* Price + MRP + Tax + Stock */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className={label}>Selling Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                      <input
                        type="number" placeholder="0"
                        value={newProduct.price || ""}
                        onChange={(e) => set("price", e.target.value)}
                        className={`${inp} pl-8`} required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>MRP (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                      <input
                        type="number" placeholder="0"
                        value={newProduct.mrp || ""}
                        onChange={(e) => set("mrp", e.target.value)}
                        className={`${inp} pl-8`} required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>Admin GST (%)</label>
                    <input
                      type="number" placeholder="0"
                      value={newProduct.adminGstPercent || ""}
                      onChange={(e) => set("adminGstPercent", e.target.value)}
                      className={inp}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>Admin CGST (%)</label>
                    <input
                      type="number" placeholder="0"
                      value={newProduct.adminCgstPercent || ""}
                      onChange={(e) => set("adminCgstPercent", e.target.value)}
                      className={inp}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={label}>Stock (Units)</label>
                  <div className="relative">
                    <Boxes size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number" placeholder="0"
                      value={newProduct.stock || ""}
                      onChange={(e) => set("stock", e.target.value)}
                      className={`${inp} pl-10`}
                    />
                  </div>
                </div>

                {/* Discount + Tax preview */}
                {(discount > 0 || (newProduct.price && totalTaxPercent > 0)) && (
                  <div className="space-y-2">
                    {discount > 0 && (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-green-50 border border-green-100 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <p className="text-sm text-green-700 font-medium">
                          {discount}% discount — customers save ₹{(newProduct.mrp - newProduct.price).toFixed(2)}
                        </p>
                      </div>
                    )}
                    {newProduct.price && totalTaxPercent > 0 && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl overflow-hidden">
                        <p className="px-3.5 py-2 text-xs font-bold text-blue-700 border-b border-blue-100">
                          Price Breakdown (incl. Tax)
                        </p>
                        <table className="w-full text-xs">
                          <tbody>
                            <tr className="border-b border-blue-100">
                              <td className="px-3.5 py-1.5 text-gray-600">Base Selling Price</td>
                              <td className="px-3.5 py-1.5 text-right font-semibold text-gray-800">₹{Number(newProduct.price).toFixed(2)}</td>
                            </tr>
                            {gstPercent > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="px-3.5 py-1.5 text-gray-600">GST ({gstPercent}%)</td>
                                <td className="px-3.5 py-1.5 text-right font-semibold text-blue-700">+ ₹{gstAmount.toFixed(2)}</td>
                              </tr>
                            )}
                            {cgstPercent > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="px-3.5 py-1.5 text-gray-600">CGST ({cgstPercent}%)</td>
                                <td className="px-3.5 py-1.5 text-right font-semibold text-blue-700">+ ₹{cgstAmount.toFixed(2)}</td>
                              </tr>
                            )}
                            <tr className="bg-blue-100/60">
                              <td className="px-3.5 py-2 font-bold text-blue-800">Total Selling Price</td>
                              <td className="px-3.5 py-2 text-right font-black text-blue-900">₹{sellingPriceWithTax.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Product photos */}
                <div className="space-y-2">
                  <label className={label}>Product Photos</label>
                  <p className="text-xs text-gray-400">Upload up to 5 images. First image is the main thumbnail.</p>
                  <input
                    type="file" accept="image/*" multiple
                    onChange={(e) => handleFilesChange(e.target.files)}
                    className="w-full text-sm text-gray-700 file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded-xl file:border-0"
                  />
                  {newProduct.images?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {newProduct.images.slice(0, 5).map((src, i) => (
                        <div key={src + i} className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                          <Image src={src} alt={`Photo ${i + 1}`} width={150} height={150} className="w-full h-28 object-cover" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-red-600 shadow-sm">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                      No photos selected yet.
                    </div>
                  )}
                  {imgError && <p className="text-xs text-red-500">Failed to read image files.</p>}
                </div>
              </>
            )}

            {/* ────────────────── TAB: MEDICINE ────────────────── */}
            {activeTab === "medicine" && (
              <>
                <div className="space-y-1.5">
                  <label className={label}>Salt / Active Composition</label>
                  <p className="text-xs text-gray-400">e.g. Glucosamine (500mg) + Chondroitin Sulphate (400mg)</p>
                  <input
                    type="text" placeholder="Salt composition…"
                    value={newProduct.saltComposition || ""}
                    onChange={(e) => set("saltComposition", e.target.value)}
                    className={inp}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={label}>Pack Size</label>
                    <input
                      type="text" placeholder="e.g. Strip of 10 Tablets"
                      value={newProduct.packSize || ""}
                      onChange={(e) => set("packSize", e.target.value)}
                      className={inp}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>Manufacturer</label>
                    <input
                      type="text" placeholder="e.g. Cipla Ltd."
                      value={newProduct.manufacturer || ""}
                      onChange={(e) => set("manufacturer", e.target.value)}
                      className={inp}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={label}>Storage Instructions</label>
                  <input
                    type="text" placeholder="e.g. Store below 30°C in a cool, dry place"
                    value={newProduct.storageInfo || ""}
                    onChange={(e) => set("storageInfo", e.target.value)}
                    className={inp}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="prescriptionRequired"
                    checked={!!newProduct.prescriptionRequired}
                    onChange={(e) => set("prescriptionRequired", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="prescriptionRequired" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Prescription Required (Rx)
                  </label>
                </div>

                <div className="space-y-2">
                  <label className={label}>Key Highlights</label>
                  <p className="text-xs text-gray-400">Short bullet points shown on the product page.</p>
                  <ArrayField
                    title="highlight"
                    placeholder="e.g. GMP certified manufacturing"
                    value={newProduct.highlightsText || []}
                    onChange={(v) => set("highlightsText", v)}
                  />
                </div>
              </>
            )}

            {/* ────────────────── TAB: DRUG INFO ────────────────── */}
            {activeTab === "druginfo" && (
              <>
                <div className="space-y-1.5">
                  <label className={label}>About This Drug</label>
                  <textarea
                    placeholder="Brief overview of what this medicine is and what it is used for…"
                    value={newProduct.aboutDrug || ""}
                    onChange={(e) => set("aboutDrug", e.target.value)}
                    rows={4}
                    className={`${inp} resize-none`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={label}>How It Works</label>
                  <textarea
                    placeholder="Mechanism of action…"
                    value={newProduct.howItWorks || ""}
                    onChange={(e) => set("howItWorks", e.target.value)}
                    rows={3}
                    className={`${inp} resize-none`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={label}>Uses</label>
                  <ArrayField
                    title="use"
                    placeholder="e.g. Treatment of joint pain"
                    value={newProduct.usesText || []}
                    onChange={(v) => set("usesText", v)}
                  />
                </div>

                <div className="space-y-2">
                  <label className={label}>Side Effects</label>
                  <ArrayField
                    title="side effect"
                    placeholder="e.g. Nausea, stomach upset"
                    value={newProduct.sideEffectsText || []}
                    onChange={(v) => set("sideEffectsText", v)}
                  />
                </div>

                <div className="space-y-2">
                  <label className={label}>How to Use</label>
                  <ArrayField
                    title="instruction"
                    placeholder="e.g. Take one tablet after meals"
                    value={newProduct.howToUseText || []}
                    onChange={(v) => set("howToUseText", v)}
                  />
                </div>

                <div className="space-y-2">
                  <label className={label}>Drug Interactions</label>
                  <ArrayField
                    title="interaction"
                    placeholder="e.g. May interact with blood thinners"
                    value={newProduct.drugInteractions || []}
                    onChange={(v) => set("drugInteractions", v)}
                  />
                </div>
              </>
            )}

            {/* ────────────────── TAB: SAFETY ────────────────── */}
            {activeTab === "safety" && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-700 font-medium">
                    Set the safety level and optional advisory text for each category. These appear as coloured cards on the product page.
                  </p>
                </div>
                {SAFETY_ITEMS.map(({ key, Icon, label: safetyLabel }) => (
                  <SafetyRow
                    key={key}
                    keyName={key}
                    Icon={Icon}
                    safetyLabel={safetyLabel}
                    value={sa[key] || {}}
                    onChange={(v) => setSafety(key, v)}
                  />
                ))}
              </div>
            )}

            {/* ────────────────── TAB: FAQs ────────────────── */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <div>
                  <label className={label}>Frequently Asked Questions</label>
                  <p className="text-xs text-gray-400 mt-0.5">These appear in an expandable FAQ section on the product page.</p>
                </div>
                {(newProduct.faqs || []).map((faq, i) => (
                  <FAQPair
                    key={i}
                    value={faq}
                    onChange={(v) => {
                      const arr = [...(newProduct.faqs || [])];
                      arr[i] = v;
                      set("faqs", arr);
                    }}
                    onRemove={() => {
                      const arr = (newProduct.faqs || []).filter((_, j) => j !== i);
                      set("faqs", arr);
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => set("faqs", [...(newProduct.faqs || []), { question: "", answer: "" }])}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors w-full justify-center"
                >
                  <Plus size={14} /> Add FAQ
                </button>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <div className="flex gap-1.5">
              {TABS.map(({ id, label: tabLabel }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`w-2 h-2 rounded-full transition-all ${activeTab === id ? "bg-blue-600 w-5" : "bg-gray-300 hover:bg-gray-400"}`}
                  title={tabLabel}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-blue-200"
              >
                {isEditing ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
