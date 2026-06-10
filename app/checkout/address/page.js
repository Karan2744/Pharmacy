"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { MapPin, Phone, User, ArrowRight, ArrowLeft, Home, Plus } from "lucide-react";
import CheckoutSteps from "@/components/CheckoutSteps";

const PRIMARY = "#0070B3";
const PRIMARY_DARK = "#005A92";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { cartItems, isAuthenticated, user } = useCart();
  const [address, setAddress] = useState({ fullName:"", phone:"", line1:"", line2:"", city:"", state:"", pincode:"" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSaved, setSelectedSaved] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (cartItems.length === 0) { router.replace("/cart"); return; }

    // Load saved address from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("pharmacy-address") || "null");
      if (saved) {
        setAddress(saved);
        setSavedAddresses([saved]);
        setSelectedSaved(0);
        setShowForm(false);
      } else {
        setShowForm(true);
        if (user?.name) setAddress((p) => ({ ...p, fullName: user.name }));
        if (user?.phone) setAddress((p) => ({ ...p, phone: user.phone }));
      }
    } catch { setShowForm(true); }
  }, [isAuthenticated, cartItems, user, router]);

  const handleChange = (field, value) => {
    setAddress((p) => ({ ...p, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
    if (field === "pincode") setPincodeStatus(null);
  };

  const checkPincode = async (pin) => {
    if (!/^\d{6}$/.test(pin)) return;
    setPincodeChecking(true); setPincodeStatus(null);
    try {
      const res  = await fetch(`/api/pincodes/check?pincode=${pin}`);
      const data = await res.json();
      setPincodeStatus(data);
    } catch { setPincodeStatus({ available: false, message: "Could not verify pincode." }); }
    finally { setPincodeChecking(false); }
  };

  const validate = () => {
    const e = {};
    if (!address.fullName.trim()) e.fullName = "Required";
    if (!/^\d{10}$/.test(address.phone.trim())) e.phone = "Enter valid 10-digit number";
    if (!address.line1.trim()) e.line1 = "Required";
    if (!address.city.trim()) e.city = "Required";
    if (!address.state) e.state = "Required";
    if (!/^\d{6}$/.test(address.pincode.trim())) e.pincode = "Enter valid 6-digit pincode";
    return e;
  };

  const handleContinue = async () => {
    // If a saved address is selected, just go to payment
    if (selectedSaved !== null && !showForm) {
      localStorage.setItem("pharmacy-address", JSON.stringify(savedAddresses[selectedSaved]));
      router.push("/checkout/payment");
      return;
    }

    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    // Check pincode
    if (!pincodeStatus) {
      const res  = await fetch(`/api/pincodes/check?pincode=${address.pincode}`);
      const data = await res.json();
      setPincodeStatus(data);
      if (!data.available) return;
    } else if (!pincodeStatus.available) return;

    localStorage.setItem("pharmacy-address", JSON.stringify(address));
    router.push("/checkout/payment");
  };

  const ic = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:border-transparent ${
      fieldErrors[field] ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-200 bg-white hover:border-gray-300 focus:ring-pink-300"
    }`;

  if (!isAuthenticated || cartItems.length === 0) return null;

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f1f1f2" }}>
      <CheckoutSteps current={2} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Select Delivery Address</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">

            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedSaved(idx); setShowForm(false); }}
                    className="bg-white rounded-2xl border-2 cursor-pointer p-4 transition-all"
                    style={{ borderColor: selectedSaved === idx && !showForm ? PRIMARY : "#e5e7eb" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0"
                          style={{ borderColor: selectedSaved === idx && !showForm ? PRIMARY : "#d1d5db" }}>
                          {selectedSaved === idx && !showForm && (
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIMARY }} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Home size={10} /> HOME
                      </span>
                    </div>
                    {selectedSaved === idx && !showForm && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleContinue(); }}
                        className="mt-4 w-full py-3 text-white font-bold rounded-xl text-sm transition-colors"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        Deliver Here
                      </button>
                    )}
                  </div>
                ))}

                {/* Add new address toggle */}
                <button
                  onClick={() => { setShowForm(true); setSelectedSaved(null); }}
                  className="w-full bg-white rounded-2xl border-2 border-dashed p-4 flex items-center gap-3 text-sm font-bold transition-colors hover:bg-pink-50"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                >
                  <Plus size={18} /> Add New Address
                </button>
              </div>
            )}

            {/* Address form */}
            {(showForm || savedAddresses.length === 0) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EBF5FF" }}>
                    <MapPin size={18} style={{ color: PRIMARY }} />
                  </div>
                  <h2 className="font-extrabold text-gray-900">Add Delivery Address</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={address.fullName} onChange={(e) => handleChange("fullName", e.target.value)}
                          placeholder="Your full name" className={`${ic("fullName")} pl-9`} />
                      </div>
                      {fieldErrors.fullName && <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" value={address.phone} onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="10-digit mobile" maxLength={10} className={`${ic("phone")} pl-9`} />
                      </div>
                      {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">House / Flat No., Building *</label>
                    <input type="text" value={address.line1} onChange={(e) => handleChange("line1", e.target.value)}
                      placeholder="House no., building name, street" className={ic("line1")} />
                    {fieldErrors.line1 && <p className="mt-1 text-xs text-red-500">{fieldErrors.line1}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Locality / Area <span className="font-normal normal-case text-gray-400">(optional)</span></label>
                    <input type="text" value={address.line2} onChange={(e) => handleChange("line2", e.target.value)}
                      placeholder="Nearby landmark, colony, area" className={ic("line2")} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">City *</label>
                      <input type="text" value={address.city} onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="City" className={ic("city")} />
                      {fieldErrors.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">State *</label>
                      <select value={address.state} onChange={(e) => handleChange("state", e.target.value)} className={`${ic("state")} cursor-pointer`}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {fieldErrors.state && <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p>}
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Pincode *</label>
                    <div className="flex gap-2">
                      <input type="text" value={address.pincode}
                        onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g,"").slice(0,6))}
                        onBlur={() => address.pincode.length === 6 && checkPincode(address.pincode)}
                        placeholder="6-digit pincode" maxLength={6} className={`${ic("pincode")} font-mono`} />
                      <button type="button" onClick={() => checkPincode(address.pincode)}
                        disabled={pincodeChecking || address.pincode.length !== 6}
                        className="px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-xl disabled:opacity-40 whitespace-nowrap">
                        {pincodeChecking ? "…" : "Check"}
                      </button>
                    </div>
                    {fieldErrors.pincode && <p className="mt-1 text-xs text-red-500">{fieldErrors.pincode}</p>}
                    {pincodeStatus && (
                      <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${pincodeStatus.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        <span>{pincodeStatus.available ? "✅" : "❌"}</span>
                        <span>{pincodeStatus.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!!(pincodeStatus && !pincodeStatus.available)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-xl text-sm transition-colors shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: PRIMARY }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = PRIMARY_DARK; }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                >
                  Save & Continue <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Cart mini summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit sticky top-24">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Order Summary</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400">×{item.quantity || 1}</p>
                  </div>
                  <span className="text-xs font-black text-gray-900 shrink-0">₹{item.price * (item.quantity || 1)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm font-black text-gray-900">
              <span>Total</span>
              <span>₹{cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0) + 49}</span>
            </div>
            <Link href="/cart" className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft size={12} /> Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
