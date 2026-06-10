"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Search, Plus, Minus, Trash2, ShoppingBag,
  User, Phone, FileText, CheckCircle2,
} from "lucide-react";
import { calcGst } from "@/utils/gst";

const PAYMENT_OPTIONS = [
  { value: "cash",  label: "Cash" },
  { value: "card",  label: "Card" },
  { value: "upi",   label: "UPI" },
];

export default function OfflineSaleModal({ onClose, onSuccess }) {
  const [products,    setProducts]    = useState([]);
  const [query,       setQuery]       = useState("");
  const [cart,        setCart]        = useState([]);
  const [customer,    setCustomer]    = useState({ name: "", phone: "" });
  const [payment,     setPayment]     = useState("cash");
  const [note,        setNote]        = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(null); // saved order
  const searchRef = useRef(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(j => setProducts(j.data || []))
      .catch(() => {});
  }, []);

  const filtered = query.trim().length > 0
    ? products.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.brand?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { _id: product._id, name: product.name, brand: product.brand, price: product.price, mrp: product.mrp, image: product.image, qty: 1 }];
    });
    setQuery("");
    searchRef.current?.focus();
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i._id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      .filter(i => i.qty > 0)
    );
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const { cgst, sgst, gstTotal, rateLabel } = calcGst(subtotal, cart.length);
  const grandTotal  = subtotal + gstTotal;

  const handleSave = async () => {
    if (cart.length === 0) { setError("Add at least one product."); return; }
    setError(""); setSaving(true);
    try {
      const body = {
        channel: "offline",
        user: {
          name:  customer.name.trim() || "Walk-in Customer",
          phone: customer.phone.trim(),
          email: "",
        },
        items: cart.map(i => ({
          productId: i._id,
          name:      i.name,
          brand:     i.brand,
          price:     i.price,
          mrp:       i.mrp,
          quantity:  i.qty,
          image:     i.image,
        })),
        total:         grandTotal,
        shippingFee:   0,
        taxableAmount: subtotal,
        cgst,
        sgst,
        gstTotal,
        paymentMethod: payment,
        status:        "Delivered",
        note:          note.trim(),
        address: { fullName: customer.name.trim() || "Walk-in Customer", phone: customer.phone.trim() },
      };

      const res  = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDone(json.data);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to save sale.");
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm border border-gray-200">
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Sale Recorded</p>
              <p className="text-[13px] text-gray-500 mt-1">
                Order <span className="font-mono font-medium">#{String(done._id).slice(-6).toUpperCase()}</span>
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-3">₹{grandTotal.toFixed(2)}</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">
                {payment.toUpperCase()} · GST {rateLabel * 2}% included
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setCart([]); setCustomer({ name: "", phone: "" }); setNote(""); setPayment("cash"); setDone(null); }}
                className="flex-1 py-2.5 border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                New Sale
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-900 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main POS modal ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">New Offline Sale</span>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 uppercase tracking-widest font-medium">Walk-in / POS</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Left: Product search + cart */}
          <div className="flex-1 flex flex-col border-r border-gray-200 overflow-hidden">

            {/* Product search */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products to add…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors bg-gray-50"
                />
              </div>

              {/* Dropdown results */}
              {filtered.length > 0 && (
                <div className="mt-1 border border-gray-200 bg-white divide-y divide-gray-100 max-h-52 overflow-y-auto">
                  {filtered.map(p => (
                    <button
                      key={p._id}
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      {p.image && (
                        <img src={p.image} alt="" className="w-8 h-8 object-contain flex-shrink-0 bg-gray-50" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.brand}</p>
                      </div>
                      <span className="text-[12px] font-medium text-gray-700 flex-shrink-0">₹{p.price}</span>
                      <Plus size={13} className="text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              {query.trim().length > 0 && filtered.length === 0 && (
                <p className="mt-2 text-[12px] text-gray-400 text-center py-2">No products found</p>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2 py-10">
                  <ShoppingBag size={32} />
                  <p className="text-[12px]">No items added yet</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Item</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Qty</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Total</th>
                      <th className="px-2 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cart.map(item => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-medium text-gray-900 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400">₹{item.price} each</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => updateQty(item._id, -1)} className="w-5 h-5 flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors">
                              <Minus size={11} />
                            </button>
                            <span className="text-[13px] font-medium text-gray-900 w-5 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item._id, +1)} className="w-5 h-5 flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors">
                              <Plus size={11} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[13px] font-medium text-gray-900">₹{(item.price * item.qty).toFixed(0)}</span>
                        </td>
                        <td className="px-2 py-3">
                          <button onClick={() => removeItem(item._id)} className="p-1 hover:bg-red-50 rounded transition-colors">
                            <Trash2 size={12} className="text-gray-300 hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right: Customer + billing + payment */}
          <div className="w-64 flex flex-col flex-shrink-0 overflow-y-auto">

            {/* Customer */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Customer</p>
              <div className="space-y-2">
                <div className="relative">
                  <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={customer.name}
                    onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2 text-[12px] border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Phone (optional)"
                    value={customer.phone}
                    onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2 text-[12px] border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Payment</p>
              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPayment(opt.value)}
                    className={`py-2 text-[12px] font-medium border transition-colors ${
                      payment === opt.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Note</p>
              <div className="relative">
                <FileText size={12} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                <textarea
                  rows={2}
                  placeholder="Optional note…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-[12px] border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Bill summary */}
            <div className="p-4 flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Bill</p>
              {cart.length === 0 ? (
                <p className="text-[12px] text-gray-300">No items</p>
              ) : (
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>CGST ({rateLabel}%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>SGST ({rateLabel}%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200 text-[13px]">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error + Save */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              {error && (
                <p className="text-[11px] text-red-600 mb-2">{error}</p>
              )}
              <button
                onClick={handleSave}
                disabled={saving || cart.length === 0}
                className="w-full py-3 bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                {saving ? "Saving…" : `Confirm Sale · ₹${grandTotal.toFixed(0)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
