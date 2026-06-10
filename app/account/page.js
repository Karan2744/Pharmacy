"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  User,
  Heart,
  LogOut,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Edit3,
  ArrowRight,
  Star,
} from "lucide-react";
import { useCart } from "@/components/CartContext";

const STATUS_CONFIG = {
  Pending: {
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  Processing: {
    color: "bg-blue-50 text-blue-700 border border-pink-200",
    dot: "bg-pink-500",
    icon: Clock,
  },
  Dispatched: {
    color: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-500",
    icon: Truck,
  },
  Delivered: {
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Cancelled: {
    color: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

export default function AccountPage() {
  const { user, isAuthenticated, logout, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPhone(localStorage.getItem("pharmacy-phone") || "");
      try {
        setAddress(JSON.parse(localStorage.getItem("pharmacy-address") || "null"));
      } catch {
        setAddress(null);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        setWishlist(JSON.parse(localStorage.getItem("pharmacy-wishlist") || "[]"));
      } catch {
        setWishlist([]);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "orders" || !isAuthenticated) return;
    setOrdersLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const myOrders = data.data.filter((o) => {
            if (user?.phone) {
              return (
                (o.user?.phone && o.user.phone === user.phone) ||
                (o.address?.phone && o.address.phone === user.phone)
              );
            }
            if (user?.email) {
              return o.user?.email && o.user.email === user.email;
            }
            return false;
          });
          setOrders(myOrders);
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [activeTab, isAuthenticated, user?.email]);

  const savePhone = () => {
    localStorage.setItem("pharmacy-phone", phone);
    showToast("Phone number saved!", "success");
  };

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((p) => p._id !== id);
    setWishlist(updated);
    localStorage.setItem("pharmacy-wishlist", JSON.stringify(updated));
  };

  const handleAddToCartFromWishlist = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
    showToast(`${product.name} added to cart`, "success");
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast({ msg: "", type: "success" }), 2500);
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ── Not logged in ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/60 border border-gray-100/80 p-8 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e73096]/20 to-pink-600/20 rounded-full blur-xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#e73096] to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-200">
                <User size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Sign in to access your orders, wishlist, and profile.
            </p>
            <button
              onClick={() => { window.location.href = "/login"; }}
              className="w-full py-3.5 bg-gradient-to-r from-[#e73096] to-pink-600 text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-pink-200 text-sm flex items-center justify-center gap-2"
            >
              Login / Sign Up
              <ArrowRight size={16} />
            </button>
            <Link
              href="/"
              className="block mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = (user?.name || "U").charAt(0).toUpperCase();

  const tabs = [
    { id: "orders", label: "Orders", icon: Package, count: orders.length || null },
    { id: "profile", label: "Profile", icon: User, count: null },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlist.length || null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 pb-24 lg:pb-12">
      {/* Toast */}
      {toast.msg && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center gap-2 transition-all ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          <CheckCircle2 size={16} />
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 lg:pt-10">
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700">My Account</span>
        </nav>

        {/* ── Page title (mobile) ── */}
        <div className="sm:hidden mb-5">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">My Account</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── SIDEBAR ────────────────────────────────────────── */}
          <aside className="lg:w-72 shrink-0 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Profile banner */}
              <div className="relative bg-gradient-to-br from-[#e73096] to-pink-600 p-6 pb-10">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                />
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0 border-2 border-white/30">
                    {initials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-white text-base truncate leading-tight">{user?.name || "User"}</p>
                    <p className="text-blue-100 text-xs truncate mt-0.5">{user?.email || user?.phone || ""}</p>
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-2 -mt-5 mx-4 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 text-center border-r border-gray-100">
                  <p className="text-lg font-black text-gray-900">{orders.length}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Orders</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-lg font-black text-gray-900">{wishlist.length}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Wishlist</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-4 mt-2 space-y-1">
                {tabs.map(({ id, label, icon: Icon, count }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      activeTab === id
                        ? "bg-gradient-to-r from-[#e73096]/10 to-pink-50 text-[#e73096] shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      activeTab === id ? "bg-[#e73096] text-white shadow-md shadow-pink-200" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="flex-1 text-left">{label}</span>
                    {count != null && count > 0 && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === id ? "bg-[#e73096] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {count}
                      </span>
                    )}
                    <ChevronRight size={14} className={`transition-colors ${activeTab === id ? "text-[#e73096]" : "text-gray-300"}`} />
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 active:bg-red-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut size={16} className="text-red-400" />
                  </div>
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ── MY ORDERS ── */}
            {activeTab === "orders" && (
              <section>
                <div className="hidden lg:flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">My Orders</h2>
                  {orders.length > 0 && (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {orders.length} order{orders.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                        <div className="flex justify-between mb-4">
                          <div className="h-4 bg-gray-100 rounded-lg w-28" />
                          <div className="h-6 bg-gray-100 rounded-full w-24" />
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                        <div className="flex justify-between pt-4 border-t border-gray-50">
                          <div className="h-6 bg-gray-100 rounded w-16" />
                          <div className="h-8 bg-gray-100 rounded-xl w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-5">
                      <div className="absolute inset-0 bg-gray-50 rounded-full blur-xl" />
                      <div className="relative w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                        <ShoppingBag size={36} className="text-gray-300" />
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                      Start shopping to see your orders here.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#e73096] to-pink-600 text-white font-bold rounded-2xl text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-pink-200"
                    >
                      Start Shopping
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;
                      const StatusIcon = cfg.icon;
                      const extraItems = (order.items?.length || 0) - 2;
                      return (
                        <div
                          key={order._id}
                          className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                        >
                          {/* Order header */}
                          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                              <p className="font-black text-gray-900 text-sm tracking-wide">
                                #{String(order._id).slice(-8).toUpperCase()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 font-medium hidden sm:block">
                                {formatDate(order.createdAt)}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {order.status || "Processing"}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="px-5 py-4">
                            <div className="space-y-2.5">
                              {(order.items || []).slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full bg-[#e73096]/40 shrink-0" />
                                    <span className="text-sm text-gray-700 font-medium truncate">{item.name}</span>
                                  </div>
                                  <span className="text-sm text-gray-500 font-bold shrink-0 tabular-nums">
                                    ₹{item.price} × {item.quantity}
                                  </span>
                                </div>
                              ))}
                              {extraItems > 0 && (
                                <p className="text-xs text-[#e73096] font-bold pl-4.5">
                                  +{extraItems} more item{extraItems > 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between px-5 py-4 bg-gray-50/60 border-t border-gray-100">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
                              <p className="text-xl font-black text-gray-900 tracking-tight">₹{order.total}</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#e73096]/30 text-[#e73096] font-bold text-xs rounded-xl hover:bg-pink-50 hover:border-[#e73096] active:scale-[0.97] transition-all shadow-sm">
                              <Truck size={14} />
                              Track Order
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ── MY PROFILE ── */}
            {activeTab === "profile" && (
              <section>
                <div className="hidden lg:flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">My Profile</h2>
                </div>

                <div className="space-y-4">
                  {/* Info card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-gray-700">Personal Information</p>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Read-only</span>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Full Name
                      </label>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <User size={15} className="text-[#e73096]" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">{user?.name || "—"}</span>
                      </div>
                    </div>

                    {/* Email */}
                    {user?.email && (
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Mail size={15} className="text-[#e73096]" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 truncate">{user.email}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <p className="text-sm font-black text-gray-700 mb-4">Contact Number</p>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border-2 border-gray-200 focus-within:border-[#e73096] transition-colors flex-1 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                          <Phone size={15} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                          className="bg-transparent outline-none text-sm font-bold text-gray-800 w-full placeholder:text-gray-300"
                        />
                      </div>
                      <button
                        onClick={savePhone}
                        className="px-5 py-3.5 bg-gradient-to-r from-[#e73096] to-pink-600 text-white font-bold text-sm rounded-2xl hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-pink-200 shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Address card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-black text-gray-700">Delivery Address</p>
                      {address && (
                        <Link href="/checkout" className="text-xs text-[#e73096] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                          <Edit3 size={12} />
                          Edit
                        </Link>
                      )}
                    </div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Saved Address
                    </label>
                    {address ? (
                      <div className="flex items-start gap-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl px-4 py-4 border border-blue-100">
                        <div className="w-8 h-8 rounded-xl bg-[#e73096]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={15} className="text-[#e73096]" />
                        </div>
                        <div className="text-sm text-gray-700 font-medium leading-relaxed">
                          <p className="font-bold text-gray-900">{address.street || address.line1}</p>
                          {address.city && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {address.city}{address.state ? `, ${address.state}` : ""}
                              {address.pincode ? ` — ${address.pincode}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3.5 bg-gray-50 rounded-2xl px-4 py-4 border-2 border-dashed border-gray-200">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <MapPin size={15} className="text-gray-300" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 font-medium">No address saved yet</p>
                          <p className="text-xs text-gray-300 mt-0.5">Add one at checkout</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── MY WISHLIST ── */}
            {activeTab === "wishlist" && (
              <section>
                <div className="hidden lg:flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    My Wishlist
                  </h2>
                  {wishlist.length > 0 && (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {wishlist.length} item{wishlist.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {wishlist.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-5">
                      <div className="absolute inset-0 bg-red-50 rounded-full blur-xl opacity-60" />
                      <div className="relative w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                        <Heart size={36} className="text-red-200" />
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Nothing saved yet</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                      Tap the heart icon on any product to save it here.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#e73096] to-pink-600 text-white font-bold rounded-2xl text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-pink-200"
                    >
                      Browse Products
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {wishlist.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
                      >
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                          <Image
                            src={product.image || "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => removeFromWishlist(product._id)}
                            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 active:scale-90 transition-all"
                            title="Remove from wishlist"
                          >
                            <Heart size={14} className="text-red-500" fill="currentColor" />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-3 flex flex-col flex-1">
                          <p className="text-[10px] text-gray-400 font-medium mb-1 truncate">{product.brand}</p>
                          <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-2 flex-1">
                            {product.name}
                          </h3>

                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-base font-black text-gray-900">₹{product.price}</span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-[10px] text-gray-400 line-through font-medium">₹{product.mrp}</span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddToCartFromWishlist(product)}
                            className="w-full py-2 bg-gradient-to-r from-[#e73096] to-pink-600 text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all shadow-sm shadow-blue-100"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-2xl shadow-black/10 px-4 pt-2 pb-safe">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center gap-1 px-5 py-2 relative"
            >
              <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                activeTab === id
                  ? "bg-gradient-to-br from-[#e73096] to-pink-600 shadow-lg shadow-pink-200 scale-110"
                  : "bg-gray-100"
              }`}>
                <Icon size={18} className={activeTab === id ? "text-white" : "text-gray-400"} />
                {count != null && count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold transition-colors ${
                activeTab === id ? "text-[#e73096]" : "text-gray-400"
              }`}>
                {label}
              </span>
            </button>
          ))}

          {/* Logout in mobile tab bar */}
          <button
            onClick={() => logout()}
            className="flex flex-col items-center gap-1 px-5 py-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <LogOut size={18} className="text-red-400" />
            </div>
            <span className="text-[10px] font-bold text-red-400">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
