"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck, Home, ShoppingBag, PhoneCall, FileText } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const InvoiceBill = dynamic(() => import("@/components/InvoiceBill"), { ssr: false });

const PRIMARY = "#e73096";

function SuccessContent() {
  const params   = useSearchParams();
  const orderId  = params.get("orderId") || "";
  const displayId = orderId
    ? `#${orderId.slice(-8).toUpperCase()}`
    : `#MRX${Math.floor(100000 + Math.random() * 900000)}`;

  const [order, setOrder]           = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrder(d.data); })
      .catch(() => {});
  }, [orderId]);

  const steps = [
    { icon: <CheckCircle2 size={18} />, label: "Order Placed",     done: true  },
    { icon: <Package size={18} />,      label: "Processing",       done: false },
    { icon: <Truck size={18} />,        label: "Out for Delivery", done: false },
    { icon: <Home size={18} />,         label: "Delivered",        done: false },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f1f1f2" }}>
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Pink header */}
          <div className="relative px-8 py-10 text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #c4007a 100%)` }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 -translate-y-24" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 translate-y-32" />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1">Order Placed! 🎉</h1>
              <p className="text-pink-100 text-sm">Your medicines are on their way!</p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Order ID */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order ID</p>
                <p className="font-black text-gray-900 text-sm mt-0.5">{displayId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Est. Delivery</p>
                <p className="font-black text-gray-900 text-sm mt-0.5">3–5 Business Days</p>
              </div>
            </div>

            {/* Order tracker */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Order Status</p>
              <div className="flex items-center gap-0">
                {steps.map((step, idx) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5"
                        style={{ backgroundColor: step.done ? PRIMARY : "#f3f4f6", color: step.done ? "#fff" : "#9ca3af" }}>
                        {step.icon}
                      </div>
                      <span className="text-[10px] font-bold text-center leading-tight" style={{ color: step.done ? PRIMARY : "#9ca3af" }}>
                        {step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="h-0.5 flex-1 -mt-5 mx-1"
                        style={{ backgroundColor: idx === 0 ? PRIMARY : "#e5e7eb" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 border" style={{ background: "#fce4f3", borderColor: "#f8b4dd" }}>
                <Truck size={18} style={{ color: PRIMARY }} className="mb-1.5" />
                <p className="text-xs font-bold text-gray-800">Free Delivery</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Delivered to your door</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <CheckCircle2 size={18} className="text-green-600 mb-1.5" />
                <p className="text-xs font-bold text-gray-800">Genuine Medicines</p>
                <p className="text-[10px] text-gray-500 mt-0.5">FDA/GMP certified</p>
              </div>
            </div>

            {/* Doctor call note */}
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <PhoneCall size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-800">Our pharmacist will call you</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  We'll verify your prescription and may suggest affordable generic substitutes.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              {order && (
                <button
                  onClick={() => setShowInvoice(true)}
                  className="w-full py-3.5 font-bold rounded-xl text-sm text-center transition-colors border-2 flex items-center justify-center gap-2"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fce4f3"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <FileText size={16} /> View / Print Invoice
                </button>
              )}
              <Link href="/" className="w-full py-3.5 text-white font-bold rounded-xl text-sm text-center transition-colors shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c4007a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}>
                <ShoppingBag size={16} /> Continue Shopping
              </Link>
              <Link href="/account" className="w-full py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm text-center hover:bg-gray-50 transition-colors">
                View My Orders
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Need help? Call us at{" "}
          <a href="tel:09240250346" className="font-bold hover:underline" style={{ color: PRIMARY }}>09240250346</a>
        </p>
      </div>

      {showInvoice && order && (
        <InvoiceBill order={order} onClose={() => setShowInvoice(false)} />
      )}
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#e73096" }} /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
