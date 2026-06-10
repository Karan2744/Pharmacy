"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle, Truck, Tag, ArrowRight } from "lucide-react";
import CheckoutSteps from "@/components/CheckoutSteps";
import { calcGst } from "@/utils/gst";

const FREE_DELIVERY_MIN = 500;
const PRIMARY = "#e73096";
const PRIMARY_DARK = "#c4007a";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, isAuthenticated, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const [removeId, setRemoveId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) router.prefetch("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#fce4f3" }}>
            <ShoppingBag size={28} style={{ color: PRIMARY }} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Login to view cart</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to access your saved items.</p>
          <Link href="/login" className="block w-full py-3.5 text-white font-bold rounded-xl text-sm text-center transition-colors shadow-lg"
            style={{ backgroundColor: PRIMARY }}>
            Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const totalMrp = cartItems.reduce((sum, item) => sum + (item.mrp || item.price) * (item.quantity || 1), 0);
  const totalSavings = totalMrp - totalPrice;
  const shippingFee = totalPrice >= FREE_DELIVERY_MIN ? 0 : 49;
  const progressPct = Math.min((totalPrice / FREE_DELIVERY_MIN) * 100, 100);
  const amountToFreeDelivery = FREE_DELIVERY_MIN - totalPrice;
  const uniqueCount = cartItems.length;
  const { cgst, sgst, gstTotal, rateLabel } = calcGst(totalPrice, uniqueCount);
  const grandTotal = totalPrice + gstTotal + shippingFee;

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f1f1f2" }}>
      {/* Meesho checkout step bar */}
      <CheckoutSteps current={1} />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">My Cart</h1>
            <p className="text-xs text-gray-400 mt-0.5">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
              <Trash2 size={13} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#fce4f3" }}>
              <ShoppingBag size={36} style={{ color: PRIMARY }} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Add medicines or health products to your cart.</p>
            <Link href="/" className="inline-block px-8 py-3.5 text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
              style={{ backgroundColor: PRIMARY }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

            {/* ── Cart Items ── */}
            <div className="space-y-4">

              {/* Free delivery progress */}
              {totalPrice < FREE_DELIVERY_MIN ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={15} style={{ color: PRIMARY }} />
                    <p className="text-xs font-bold text-gray-700">
                      Add <span style={{ color: PRIMARY }}>₹{amountToFreeDelivery}</span> more for FREE delivery
                    </p>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: PRIMARY }} />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl px-5 py-3 flex items-center gap-2" style={{ background: "#fce4f3", border: "1px solid #f8b4dd" }}>
                  <Truck size={15} style={{ color: PRIMARY }} />
                  <p className="text-xs font-bold" style={{ color: PRIMARY }}>🎉 You've unlocked FREE delivery!</p>
                </div>
              )}

              {/* Generic substitute banner */}
              <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: "#fce4f3", border: "1px solid #f8b4dd" }}>
                <CheckCircle size={18} style={{ color: PRIMARY }} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Save more with Generic Substitutes</p>
                  <p className="text-xs text-gray-500 mt-0.5">Same formula, FDA certified — up to 51% cheaper.</p>
                </div>
              </div>

              {/* Items */}
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                      <img
                        src={item.image || "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png"}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-0.5">{item.name}</h2>
                      <p className="text-xs text-gray-400 mb-2">{item.brand}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base font-black text-gray-900">₹{item.price}</span>
                        {item.mrp && item.mrp !== item.price && (
                          <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                        )}
                        {item.mrp && item.mrp > item.price && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% off
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button onClick={() => updateQuantity(item._id || item.id, (item.quantity || 1) - 1)}
                            className="px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700"><Minus size={13} /></button>
                          <span className="px-4 py-1.5 text-sm font-black text-gray-900 border-x-2 border-gray-200">{item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(item._id || item.id, (item.quantity || 1) + 1)}
                            className="px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700"><Plus size={13} /></button>
                        </div>
                        <button onClick={() => setRemoveId(item._id || item.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition-colors">
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <Link href="/" className="block w-full py-3 font-bold rounded-xl text-sm text-center transition-colors border-2"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}>
                  + Add More Items
                </Link>
              </div>
            </div>

            {/* ── Price Details Sidebar ── */}
            <div className="space-y-4 h-fit lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Price Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Price ({totalItems} items)</span>
                    <span>₹{totalMrp.toFixed(0)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between font-bold text-green-600">
                      <span className="flex items-center gap-1"><Tag size={13} /> Discount</span>
                      <span>− ₹{totalSavings.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1"><Truck size={13} /> Delivery Charges</span>
                    {shippingFee === 0
                      ? <span className="font-bold text-green-600">FREE</span>
                      : <span>₹{shippingFee}</span>}
                  </div>

                  {/* GST Breakdown */}
                  <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      GST ({uniqueCount > 1 ? "18%" : "12%"} — {uniqueCount > 1 ? "multiple products" : "single product"})
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Taxable Amount</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>CGST ({rateLabel}%)</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>SGST ({rateLabel}%)</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-3 mt-1">
                    <span>Total Amount</span>
                    <span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                {totalSavings > 0 && (
                  <div className="mt-3 rounded-xl px-3 py-2 text-xs font-bold text-green-700 bg-green-50">
                    🎉 You save ₹{totalSavings.toFixed(0)} on this order!
                  </div>
                )}

                <button
                  onClick={() => router.push("/checkout/address")}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
                  style={{ backgroundColor: PRIMARY }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                >
                  Proceed to Buy <ArrowRight size={16} />
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-3">Safe & secure · Cash on Delivery available</p>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-3 gap-3 text-center">
                {[{ icon: "🔒", label: "Secure Pay" }, { icon: "💊", label: "Genuine Meds" }, { icon: "📞", label: "24×7 Support" }].map((b) => (
                  <div key={b.label}>
                    <span className="text-xl">{b.icon}</span>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Remove Modal */}
      {removeId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setRemoveId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Remove item?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveId(null)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                Keep
              </button>
              <button onClick={() => { removeFromCart(removeId); setRemoveId(null); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: PRIMARY }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
