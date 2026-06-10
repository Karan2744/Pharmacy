"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Truck, Star, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone, isAuthenticated } = useCart();

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  // Start 30-second resend countdown when OTP step begins
  useEffect(() => {
    if (step !== 2) return;
    setResendCountdown(30);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreed) { setError("Please accept the Terms & Privacy Policy."); return; }
    if (mobileNumber.length !== 10) { setError("Enter a valid 10-digit mobile number."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mobileNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const entered = otp.join("");
    if (entered.length !== 6) { setError("Enter the 6-digit OTP."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mobileNumber, code: entered }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      // Store JWT token for future authenticated requests
      if (typeof window !== "undefined") {
        localStorage.setItem("customerToken", data.token);
      }

      loginWithPhone(data.customer);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      const res = await fetch("/api/customer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mobileNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP.");
      setResendCountdown(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById("otp-" + (index + 1))?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById("otp-" + (index - 1))?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left promo panel */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-b from-[#00a8e1] to-[#0076b0] p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-28 -translate-y-28" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 translate-y-36" />
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl">💊</div>
              <span className="text-white text-xl font-black">MauryaRx</span>
            </Link>
            <h2 className="text-white text-4xl font-black leading-tight mb-2">Save up to</h2>
            <p className="text-7xl font-black text-yellow-300 mb-4">51%</p>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              on medicines with FDA and GMP certified generic substitutes. Same formula, fraction of the cost.
            </p>
            <div className="space-y-3">
              {[
                { Icon: ShieldCheck, text: "FDA / GMP Certified Medicines" },
                { Icon: CheckCircle2, text: "Same salt composition as branded" },
                { Icon: Truck, text: "Free delivery on orders above Rs.500" },
                { Icon: Star, text: "5M+ happy customers across India" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-blue-50 text-xs font-semibold">
                  <Icon size={15} className="text-yellow-300 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-8 bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white text-sm font-bold mb-1">India&apos;s #1 Online Pharmacy</p>
            <p className="text-blue-100 text-xs">Over Rs.300 Cr+ saved by 1 Cr+ users</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <Link href="/" className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-9 h-9 bg-[#00a8e1] rounded-xl flex items-center justify-center text-xl">💊</div>
            <span className="text-xl font-black text-gray-900">MauryaRx</span>
          </Link>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
            {step === 1 ? "Login / Sign up" : "Verify OTP"}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {step === 1
              ? "Enter your mobile number to continue"
              : "OTP sent to +91 " + mobileNumber}
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleGetOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#00a8e1] transition-colors bg-white">
                  <div className="flex items-center gap-2 px-4 border-r border-gray-200 py-3.5 bg-gray-50 shrink-0">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 py-3.5 outline-none text-sm font-medium text-gray-900 bg-white"
                    autoFocus
                    maxLength={10}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer" onClick={() => setAgreed(!agreed)}>
                <div className={"mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors " + (agreed ? "bg-[#00a8e1] border-[#00a8e1]" : "border-gray-300")}>
                  {agreed && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{" "}
                  <Link href="#" className="text-[#00a8e1] font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Terms and Conditions</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-[#00a8e1] font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#00a8e1] hover:bg-[#008ec4] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                  : <>Get OTP <ArrowRight size={16} /></>}
              </button>

              <div className="pt-1 text-center">
                <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Back to home</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Enter 6-digit OTP</label>
                <div className="flex gap-2 md:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={"otp-" + index}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength={1}
                      autoFocus={index === 0}
                      className="flex-1 aspect-square text-center text-xl font-black border-2 border-gray-200 rounded-xl focus:border-[#00a8e1] focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    Didn&apos;t receive?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCountdown > 0 || loading}
                      className="text-[#00a8e1] font-bold hover:underline disabled:text-gray-400 disabled:no-underline inline-flex items-center gap-1"
                    >
                      {loading
                        ? <RefreshCw size={12} className="animate-spin" />
                        : resendCountdown > 0
                          ? `Resend in ${resendCountdown}s`
                          : "Resend OTP"}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setError(""); }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Change number
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#00a8e1] hover:bg-[#008ec4] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                  : <>Verify and Login <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            {[{ e: "🔒", l: "100% Secure" }, { e: "💊", l: "Genuine Meds" }, { e: "🚚", l: "Fast Delivery" }].map((b) => (
              <div key={b.l}>
                <span className="text-2xl">{b.e}</span>
                <p className="text-[10px] font-bold text-gray-500 mt-1">{b.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
