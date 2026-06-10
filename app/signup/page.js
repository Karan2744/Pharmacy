"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, ArrowRight, Pill, CheckCircle } from "lucide-react";
import { useCart } from "@/components/CartContext";

const PRIMARY = "#e73096";
const PRIMARY_DARK = "#c4007a";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated } = useCart();
  const [step, setStep]         = useState(1); // 1=enter name+phone, 2=OTP
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [otp, setOtp]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  if (isAuthenticated) {
    router.replace("/account");
    return null;
  }

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/^\d{10}$/.test(phone.trim())) { setError("Enter a valid 10-digit phone number."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/customer/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to send OTP");
      setSuccess(`OTP sent to +91 ${phone}`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("Enter the 6-digit OTP."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/customer/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone: phone.trim(), code: otp.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "OTP verification failed");

      // Store token (same as login page)
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("pharmacy-phone", phone.trim());

      // Reload to update CartContext
      window.location.href = "/account";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white hover:border-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f1f1f2" }}>
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: "linear-gradient(135deg, #fce4f3 0%, #fff 100%)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: PRIMARY }}>
              <Pill size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Join MauryaRx for fast medicine delivery</p>
          </div>

          <div className="px-8 py-6">

            {/* Benefits strip */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {["Free Delivery", "Genuine Meds", "Easy Returns"].map((b) => (
                <div key={b} className="flex flex-col items-center gap-1 text-center">
                  <CheckCircle size={14} style={{ color: PRIMARY }} />
                  <span className="text-[10px] font-bold text-gray-500">{b}</span>
                </div>
              ))}
            </div>

            {step === 1 ? (
              <form onSubmit={sendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Your Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Full name" className={`${ic} pl-10`} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">+91</span>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                      placeholder="10-digit mobile number" maxLength={10} className={`${ic} pl-12`} required />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = PRIMARY_DARK; }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}>
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Send OTP <ArrowRight size={15} /></>}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By signing up you agree to our{" "}
                  <Link href="#" className="font-bold" style={{ color: PRIMARY }}>Terms of Service</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 font-medium">
                  ✅ {success}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Enter OTP</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                    placeholder="6-digit OTP" maxLength={6} className={`${ic} text-center text-2xl font-black tracking-[0.5em]`} />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = PRIMARY_DARK; }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}>
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Verify & Create Account <ArrowRight size={15} /></>}
                </button>

                <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }}
                  className="w-full text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                  ← Change phone number
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="font-bold" style={{ color: PRIMARY }}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
