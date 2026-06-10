"use client";
import Link from "next/link";
import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "CART",          href: "/cart" },
  { num: 2, label: "ADDRESS",        href: "/checkout/address" },
  { num: 3, label: "PAYMENT",        href: "/checkout/payment" },
  { num: 4, label: "ORDER SUMMARY",  href: "/checkout/summary" },
];

export default function CheckoutSteps({ current }) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, idx) => {
            const done   = step.num < current;
            const active = step.num === current;
            return (
              <div key={step.num} className="flex items-center">
                {/* Step pill */}
                {done ? (
                  <Link href={step.href} className="flex items-center gap-1.5 group">
                    <span
                      className="flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: "#e73096" }}
                    >
                      <Check size={11} />
                    </span>
                    <span className="text-[11px] font-bold hidden sm:block" style={{ color: "#e73096" }}>
                      {step.label}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold flex-shrink-0"
                      style={{
                        backgroundColor: active ? "#e73096" : "#f0f0f0",
                        color: active ? "#fff" : "#9ca3af",
                      }}
                    >
                      {step.num}
                    </span>
                    <span
                      className="text-[11px] font-bold hidden sm:block"
                      style={{ color: active ? "#e73096" : "#9ca3af" }}
                    >
                      {step.label}
                    </span>
                  </div>
                )}

                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <span className="mx-2 md:mx-3 text-gray-300 text-xs font-bold select-none">›</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
