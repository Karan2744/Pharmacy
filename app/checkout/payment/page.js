"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { ArrowRight, ArrowLeft, Banknote, CreditCard, Smartphone, Shield } from "lucide-react";
import CheckoutSteps from "@/components/CheckoutSteps";

const PRIMARY = "#e73096";
const PRIMARY_DARK = "#c4007a";

const PAYMENT_OPTIONS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay with cash when your order arrives at your door.",
    icon: Banknote,
    available: true,
  },
  {
    id: "upi",
    label: "UPI / Net Banking",
    desc: "Pay via GPay, PhonePe, Paytm or any UPI app.",
    icon: Smartphone,
    available: false,
    badge: "Coming Soon",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, RuPay and more.",
    icon: CreditCard,
    available: false,
    badge: "Coming Soon",
  },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { cartItems, isAuthenticated } = useCart();
  const [selected, setSelected] = useState("cod");
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (cartItems.length === 0) { router.replace("/cart"); return; }
    try {
      const saved = JSON.parse(localStorage.getItem("pharmacy-address") || "null");
      if (!saved) { router.replace("/checkout/address"); return; }
      setAddress(saved);
    } catch { router.replace("/checkout/address"); }
  }, [isAuthenticated, cartItems, router]);

  const handleContinue = () => {
    localStorage.setItem("pharmacy-payment", selected);
    router.push("/checkout/summary");
  };

  if (!address) return null;

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f1f1f2" }}>
      <CheckoutSteps current={3} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Select Payment Method</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">

            {/* Payment options */}
            {PAYMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.id}
                  onClick={() => opt.available && setSelected(opt.id)}
                  className={`bg-white rounded-2xl border-2 p-4 transition-all ${opt.available ? "cursor-pointer hover:shadow-md" : "opacity-60 cursor-not-allowed"}`}
                  style={{ borderColor: selected === opt.id && opt.available ? PRIMARY : "#e5e7eb" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0"
                      style={{ borderColor: selected === opt.id && opt.available ? PRIMARY : "#d1d5db" }}>
                      {selected === opt.id && opt.available && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIMARY }} />
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fce4f3" }}>
                      <Icon size={20} style={{ color: PRIMARY }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{opt.label}</p>
                        {opt.badge && (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{opt.badge}</span>
                        )}
                        {opt.id === "cod" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#23bb75" }}>Available</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Security note */}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <Shield size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                <span className="font-bold text-gray-800">100% Secure.</span> Your payment information is never stored on our servers.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
              style={{ backgroundColor: PRIMARY }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
            >
              Continue to Summary <ArrowRight size={16} />
            </button>
          </div>

          {/* Address recap */}
          <div className="space-y-4 h-fit sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Delivering To</h3>
              <p className="font-bold text-gray-900 text-sm">{address.fullName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{address.phone}</p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}
              </p>
              <Link href="/checkout/address" className="mt-3 flex items-center gap-1 text-xs font-bold transition-colors" style={{ color: PRIMARY }}>
                Change Address
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Order Items</h3>
              <p className="text-sm font-bold text-gray-900">{cartItems.reduce((s, i) => s + (i.quantity || 1), 0)} items</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm font-black text-gray-900">
                <span>Total</span>
                <span>₹{cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0) + 49}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
