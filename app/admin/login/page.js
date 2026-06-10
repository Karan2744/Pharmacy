"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, CheckCircle, Shield, Activity, Pill } from "lucide-react";
import { login } from "@/lib/auth";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        login({ username });
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f6fc] flex flex-col md:flex-row">
      {/* Left Side - Advertisement/Info Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#00a8e1] to-[#008ec4] flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <Pill size={36} className="text-[#00a8e1]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">PharmaCare</h1>
              <p className="text-white/80 text-sm">Your Health, Our Priority</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">Admin Portal</h2>
          <p className="text-white/80 text-lg mb-8">
            Manage products, orders, and users from a single, intuitive interface.
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Product Management</h3>
                <p className="text-white/70 text-sm">Add, edit, or remove products with ease</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Order Processing</h3>
                <p className="text-white/70 text-sm">Fulfill and track all customer orders</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
                <p className="text-white/70 text-sm">Monitor sales, revenue, and inventory</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20">
            <p className="text-sm text-white/60">
              Need customer access? 
              <Link href="/login" className="text-white font-semibold hover:underline ml-2">
                Customer Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Sign In</h2>
            <p className="text-gray-500">
              Enter your admin credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock size={16} className="text-red-600" />
                </div>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00a8e1] transition-colors" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 text-gray-700 border-gray-100 focus:border-[#00a8e1] focus:bg-white rounded-2xl outline-none transition-all font-medium shadow-sm hover:border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00a8e1] transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-12 pr-12 py-4 text-gray-700bg-white border-2 border-gray-100 focus:border-[#00a8e1] focus:bg-white rounded-2xl outline-none transition-all font-medium shadow-sm hover:border-gray-200"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00a8e1] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#00a8e1] to-[#008ec4] text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-[#00a8e1]/25 transition-all transform active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>

            <div className="p-4 bg-[#e8f6fc] rounded-2xl border border-[#00a8e1]/20">
              <p className="text-xs text-gray-600 text-center">
                Demo credentials: <strong>Karan1234</strong> / <strong>Karan@1234</strong>
              </p>
            </div>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-xs text-gray-400 font-medium italic">
              "Your health, our priority."
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Not an admin? <Link href="/login" className="text-[#00a8e1] font-semibold">Go to customer login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
