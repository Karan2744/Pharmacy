"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { Phone, CheckCircle2, AlertCircle, ArrowRight, X } from "lucide-react";

export default function LoginModal({ isOpen, onClose }) {
  const router = useRouter();
  const { login, isAuthenticated } = useCart();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
      router.push("/");
    }
  }, [isAuthenticated, isOpen, onClose, router]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMobileNumber("");
      setOtp(["", "", "", "", "", ""]);
      setStep(1);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleGetOtp = (e) => {
    e.preventDefault();
    setError("");
    if (mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const result = login("user@mauryapharmacy.com", "password123");
      if (result.success) {
        onClose();
      }
    }, 1500);
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`modal-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-200 max-w-250 z-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="hidden md:block md:w-2/5 bg-gradient-to-b from-blue-600 to-blue-700 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 -translate-y-24"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 translate-y-32"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                  Save <br /><span className="text-6xl md:text-7xl font-black">Upto 51%</span>
                </h2>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💊</span>
                  </div>
                  <p className="text-white text-lg font-semibold">
                    on medicines with <span className="font-bold">Branded Substitutes</span>
                  </p>
                </div>
              </div>

              <div className="flex items-end">
                <img 
                  src="https://images.pexels.com/photos/6129681/pexels-photo-6129681.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Doctor" 
                  className="w-full h-72 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 relative">
            <div className="flex items-center justify-end mb-8">
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0070B3] to-[#005A92] rounded-xl flex items-center justify-center text-white">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Maurya<span className="text-[#0070B3]">Rx</span>
                </h1>
                <p className="text-xs text-gray-400">Maurya Pharmacy</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {step === 1 ? "Login / Sign up" : "Verify OTP"}
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleGetOtp} className="space-y-6">
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Phone size={18} className="text-gray-400" />
                      <span className="text-gray-700 font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, "").slice(0,10))}
                      placeholder="Enter your 10-digit mobile number"
className="w-full pl-24 pr-4 py-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none"                      maxLength={10}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : "Get OTP"}
                </button>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="mt-1">
                    <div className="w-5 h-5 border-2 border-blue-600 rounded bg-blue-600 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  </div>
                  <p>
                    By signing up, I agree to the{" "}
                    <Link href="#" className="text-blue-600 font-semibold">Terms and Conditions</Link> and{" "}
                    <Link href="#" className="text-blue-600 font-semibold">Privacy Policy</Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <p className="text-gray-600">
                    We have sent a 6-digit OTP to <span className="font-bold text-gray-900">+91 {mobileNumber}</span>
                  </p>
                  <div className="flex gap-3 justify-between">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`modal-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        maxLength={1}
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Didn't receive OTP? <button type="button" className="text-blue-600 font-semibold hover:text-blue-700">Resend OTP</button>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : "Verify & Proceed"}
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-blue-600 font-semibold hover:text-blue-700"
                >
                  Change Number
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
