"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Banknote, Truck, Tag } from "lucide-react";
import CheckoutSteps from "@/components/CheckoutSteps";
import { calcGst } from "@/utils/gst";

const PRIMARY = "#0070B3";
const PRIMARY_DARK = "#005A92";
const FREE_DELIVERY_MIN = 500;

export default function CheckoutSummaryPage() {
  const router = useRouter();
  const { cartItems, isAuthenticated, totalItems, totalPrice, clearCart, user } = useCart();
  const [address, setAddress] = useState(null);
  const [payment, setPayment] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (cartItems.length === 0) { router.replace("/cart"); return; }
    try {
      const addr = JSON.parse(localStorage.getItem("pharmacy-address") || "null");
      if (!addr) { router.replace("/checkout/address"); return; }
      setAddress(addr);
      setPayment(localStorage.getItem("pharmacy-payment") || "cod");
    } catch { router.replace("/checkout/address"); }
  }, [isAuthenticated, cartItems, router]);

  const shippingFee   = totalPrice >= FREE_DELIVERY_MIN ? 0 : 49;
  const totalMrp      = cartItems.reduce((s, i) => s + (i.mrp || i.price) * (i.quantity || 1), 0);
  const savings       = totalMrp - totalPrice;
  const taxableAmount = totalPrice;
  const uniqueCount   = cartItems.length;
  const { cgst, sgst, gstTotal, rateLabel } = calcGst(taxableAmount, uniqueCount);
  const grandTotal    = taxableAmount + gstTotal + shippingFee;

  const placeOrder = async () => {
    setError(""); setPlacing(true);
    try {
      const res  = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          user: { name: user?.name || "Guest", email: user?.email || "", phone: user?.phone || "" },
          address,
          items: cartItems.map((item) => ({
            productId: item._id || item.id,
            name:      item.name,
            brand:     item.brand,
            price:     item.price,
            mrp:       item.mrp,
            quantity:  item.quantity || 1,
            image:     item.image,
          })),
          total:         grandTotal,
          shippingFee:   shippingFee,
          taxableAmount: taxableAmount,
          cgst:          cgst,
          sgst:          sgst,
          gstTotal:      gstTotal,
          paymentMethod: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Order failed");

      clearCart();
      localStorage.removeItem("pharmacy-payment");
      const orderId = data.data?._id || data.orderId || "";
      router.push(`/checkout/success${orderId ? `?orderId=${orderId}` : ""}`);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!address) return null;

  const paymentLabel = payment === "cod" ? "Cash on Delivery" : payment.toUpperCase();

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f1f1f2" }}>
      <CheckoutSteps current={4} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EBF5FF" }}>
                    <MapPin size={14} style={{ color: PRIMARY }} />
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm">Delivery Address</h2>
                </div>
                <Link href="/checkout/address" className="text-xs font-bold transition-colors" style={{ color: PRIMARY }}>Change</Link>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                <p className="font-bold text-gray-900">{address.fullName}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><Phone size={10} /> {address.phone}</p>
                <p className="mt-1 text-xs">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}</p>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EBF5FF" }}>
                    <Banknote size={14} style={{ color: PRIMARY }} />
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm">Payment Method</h2>
                </div>
                <Link href="/checkout/payment" className="text-xs font-bold transition-colors" style={{ color: PRIMARY }}>Change</Link>
              </div>
              <p className="text-sm font-semibold text-gray-700">{paymentLabel}</p>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 text-sm mb-4">Items ({totalItems})</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id || item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img src={item.image || ""} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.brand} · Qty: {item.quantity || 1}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-gray-900">₹{item.price * (item.quantity || 1)}</p>
                      {item.mrp && item.mrp > item.price && (
                        <p className="text-[10px] text-gray-400 line-through">₹{item.mrp * (item.quantity || 1)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price details + CTA */}
          <div className="space-y-4 h-fit sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Price Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({totalItems} items)</span>
                  <span>₹{totalMrp.toFixed(0)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between font-bold text-green-600">
                    <span className="flex items-center gap-1"><Tag size={12} /> Discount</span>
                    <span>− ₹{savings.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1"><Truck size={12} /> Delivery</span>
                  {shippingFee === 0
                    ? <span className="font-bold text-green-600">FREE</span>
                    : <span>₹{shippingFee}</span>}
                </div>

                {/* GST Breakdown */}
                <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    GST ({uniqueCount > 1 ? "18%" : "12%"} — {uniqueCount > 1 ? "multiple products" : "single product"})
                  </p>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Taxable Amount</span>
                    <span>₹{taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>CGST ({rateLabel}%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>SGST ({rateLabel}%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-3 mt-1">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>
              {savings > 0 && (
                <div className="mt-3 rounded-xl px-3 py-2 text-xs font-bold text-green-700 bg-green-50">
                  🎉 You save ₹{savings.toFixed(0)} on this order!
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">{error}</div>
            )}

            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-60"
              style={{ backgroundColor: PRIMARY }}
              onMouseEnter={(e) => { if (!placing) e.currentTarget.style.backgroundColor = PRIMARY_DARK; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
            >
              {placing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing order…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Place Order
                </>
              )}
            </button>

            <Link href="/cart" className="flex items-center justify-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft size={14} /> Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
