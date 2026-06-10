"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/app/admin/Components/sidebar";
import Header  from "@/app/admin/Components/Header";
import { downloadCSV } from "@/utils/csvDownloads";
import { parseCSV } from "@/lib/csvUtils";
import PincodeForm from "@/app/admin/pincodes/components/singlePincode";

import { handleAddPincode } from "@/Controllers/pincodeController";
import {
  MapPin, Plus, Trash2, Search, CheckCircle2, XCircle,
  AlertCircle, Loader2, ToggleLeft, ToggleRight, Upload,
  Download, RefreshCw,
} from "lucide-react";

/* ── Toast ─────────────────────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type !== "error";
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border min-w-[260px] ${ok ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
        {ok ? <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : <XCircle size={18} className="text-red-500 shrink-0" />}
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────────── */
export default function PincodeManagementPage() {
  const [activeTab,      setActiveTab]      = useState("Pincodes");
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);

  const [pincodes,       setPincodes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [toast,          setToast]          = useState(null);

  // Single add
  const [pincode,        setPincode]        = useState("");
  const [city,           setCity]           = useState("");
  const [state,          setState]          = useState("");
  const [deliveryDays,   setDeliveryDays]   = useState("2");
  const [note,           setNote]           = useState("");
  const [adding,         setAdding]         = useState(false);

  // Bulk add
  const [bulkText,       setBulkText]       = useState("");
  const [bulkAdding,     setBulkAdding]     = useState(false);
  const [showBulk,       setShowBulk]       = useState(false);
  const [importing,      setImporting]      = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const fetchPincodes = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/pincodes", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setPincodes(data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPincodes();
  }, []);

  /* ── Derived ──────────────────────────────────────────────────────────── */
  const filtered = pincodes.filter(
    (p) =>
      p.pincode.includes(search) ||
      (p.city  || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.state || "").toLowerCase().includes(search.toLowerCase())
  );
  const activeCount   = pincodes.filter((p) =>  p.isActive).length;
  const inactiveCount = pincodes.filter((p) => !p.isActive).length;

  /* ── Add single ───────────────────────────────────────────────────────── */
  const handleAdd = async (e) => {
    e.preventDefault();
    const data = await handleAddPincode({
      pincode: pincode.trim(),
      city: city.trim(),
      state: state.trim(),
      deliveryDays: Number(deliveryDays),
      note: note.trim(),
    });

    if (data.success) {
      setPincodes((prev) => [data.data, ...prev]);
      setPincode("");
      setCity("");
      setState("");
      setDeliveryDays("2");
    }
  };

  /* ── Bulk add ─────────────────────────────────────────────────────────── */
  const handleBulkAdd = async () => {
    const pins = bulkText.split(/[\s,;\n]+/).map((p) => p.trim()).filter((p) => /^\d{6}$/.test(p));
    if (!pins.length) { showToast("No valid 6-digit pincodes found.", "error"); return; }
    setBulkAdding(true);
    try {
      const res  = await fetch("/api/pincodes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pincodes: pins }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPincodes();
        setBulkText(""); setShowBulk(false);
        showToast(data.message);
      } else {
        showToast(data.message, "error");
      }
    } catch { showToast("Bulk add failed.", "error"); }
    finally { setBulkAdding(false); }
  };

  /* ── Delete ───────────────────────────────────────────────────────────── */
  const handleDelete = async (id, pin) => {
    if (!confirm(`Delete pincode ${pin}?`)) return;
    try {
      const res  = await fetch(`/api/pincodes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPincodes((p) => p.filter((x) => x._id !== id));
        showToast(`Pincode ${pin} deleted.`);
      } else {
        showToast(data.message, "error");
      }
    } catch { showToast("Failed to delete.", "error"); }
  };

  /* ── Import CSV ─────────────────────────────────────────────────────────── */
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);

    try {
      const rows = parseCSV(await file.text());
      if (!rows.length) {
        showToast("No valid rows found in the CSV.", "error");
        return;
      }

      const payload = rows.map((row) => ({
        pincode: String(row.pincode || row.pin || row.code || "").trim(),
        city: String(row.city || "").trim(),
        state: String(row.state || "").trim(),
        deliveryDays: Number(row.deliverydays || row.delivery || row["delivery days"] || 2),
        note: String(row.note || "").trim(),
      })).filter((row) => /^\d{6}$/.test(row.pincode));

      if (!payload.length) {
        showToast("No valid 6-digit pincodes found in CSV.", "error");
        return;
      }

      const res  = await fetch("/api/pincodes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pincodes: payload }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPincodes();
        showToast(`Imported ${payload.length} pincodes.`);
      } else {
        showToast(data.message || "Import failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Import failed — check CSV format.", "error");
    } finally {
      setImporting(false);
    }
  };

  /* ── Toggle isActive ──────────────────────────────────────────────────── */
  const handleToggle = async (id, current) => {
    try {
      const res  = await fetch(`/api/pincodes/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setPincodes((p) => p.map((x) => x._id === id ? data.data : x));
        showToast(`Pincode ${!current ? "activated" : "deactivated"}.`);
      }
    } catch { showToast("Failed to toggle.", "error"); }
  };

  /* ── Export CSV ───────────────────────────────────────────────────────── */
  const handleExport = () => {
    if (!filtered.length) {
      showToast("No pincodes available to export.", "error");
      return;
    }
    downloadCSV(filtered, "pincodes.csv");
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Pincode Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">Control which pincodes are eligible for delivery.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchPincodes} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors" title="Refresh">
                <RefreshCw size={16} />
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
                title="Export CSV"
              >
                <Download size={16} />
                Export CSV
              </button>
              <label className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer" title="Import CSV">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImport}
                />
                <Upload size={16} />
                {importing ? "Importing…" : "Bulk Add"}
              </label>
              {/* <button
                onClick={() => setShowBulk((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
              >
                <Upload size={14} /> 
              </button> */}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Pincodes",    value: pincodes.length, color: "text-blue-600",   bg: "bg-blue-50"  },
              { label: "Active (Delivery)", value: activeCount,     color: "text-green-600",  bg: "bg-green-50" },
              { label: "Inactive",          value: inactiveCount,   color: "text-red-500",    bg: "bg-red-50"   },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <MapPin size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Add Panel */}
          {showBulk && (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-1">Bulk Add Pincodes</h3>
              <p className="text-xs text-gray-400 mb-3">
                Paste pincodes separated by commas, spaces, or new lines. Example: <span className="font-mono text-gray-600">401209, 401210, 400001</span>
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={4}
                placeholder="401209&#10;401210&#10;400001, 400002"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {bulkText.split(/[\s,;\n]+/).filter((p) => /^\d{6}$/.test(p.trim())).length} valid pincodes detected
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowBulk(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button
                    onClick={handleBulkAdd}
                    disabled={bulkAdding}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-60 transition-all"
                  >
                    {bulkAdding ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {bulkAdding ? "Adding…" : "Add All"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* ── Add Single Pincode Form ── */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <PincodeForm
                  pincode={pincode}
                  setPincode={setPincode}
                  city={city}
                  setCity={setCity}
                  state={state}
                  setState={setState}
                  deliveryDays={deliveryDays}
                  setDeliveryDays={setDeliveryDays}
                  note={note}
                  setNote={setNote}
                  handleAdd={handleAdd}
                  adding={adding}
                />

                {/* Quick test */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <PincodeChecker />
                </div>
              </div>
            </div>

            {/* ── Pincode Table ── */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Search */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by pincode, city or state…"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of <span className="font-semibold text-gray-700">{pincodes.length}</span> pincodes
                  </p>
                </div>

                {loading ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <p className="text-sm text-gray-400">Loading pincodes…</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <MapPin className="w-12 h-12 text-gray-200" />
                    <p className="text-sm text-gray-500 font-medium">
                      {pincodes.length === 0 ? "No pincodes added yet." : "No pincodes match your search."}
                    </p>
                    {pincodes.length === 0 && (
                      <p className="text-xs text-gray-400 text-center max-w-xs">
                        Add pincodes using the form on the left. Customers can only order if their pincode is listed here.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {["Pincode", "City / State", "Delivery", "Status", "Note", "Actions"].map((h) => (
                            <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((p) => (
                          <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                            {/* Pincode */}
                            <td className="px-4 py-3.5">
                              <span className="text-sm font-mono font-bold text-gray-900">{p.pincode}</span>
                            </td>

                            {/* City / State */}
                            <td className="px-4 py-3.5">
                              {p.city || p.state ? (
                                <div>
                                  {p.city  && <p className="text-xs font-semibold text-gray-800">{p.city}</p>}
                                  {p.state && <p className="text-[10px] text-gray-400">{p.state}</p>}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>

                            {/* Delivery Days */}
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                {p.deliveryDays}d
                              </span>
                            </td>

                            {/* Status toggle */}
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => handleToggle(p._id, p.isActive)}
                                className="flex items-center gap-1.5"
                              >
                                {p.isActive ? (
                                  <>
                                    <ToggleRight size={22} className="text-green-500" />
                                    <span className="text-[11px] font-semibold text-green-600">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft size={22} className="text-gray-300" />
                                    <span className="text-[11px] font-semibold text-gray-400">Inactive</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Note */}
                            <td className="px-4 py-3.5 max-w-[120px]">
                              <p className="text-[11px] text-gray-400 truncate">{p.note || "—"}</p>
                            </td>

                            {/* Delete */}
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => handleDelete(p._id, p.pincode)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
      <Toast toast={toast} />
    </div>
  );
}

/* ── Inline Pincode Checker ──────────────────────────────────────────────── */
function PincodeChecker() {
  const [pin,    setPin]    = useState("");
  const [result, setResult] = useState(null);
  const [loading,setLoading]= useState(false);

  const check = async () => {
    if (!/^\d{6}$/.test(pin)) return;
    setLoading(true); setResult(null);
    try {
      const res  = await fetch(`/api/pincodes/check?pincode=${pin}`);
      const data = await res.json();
      setResult(data);
    } catch { setResult({ available: false, message: "Error checking pincode." }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Test Pincode</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setResult(null); }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="6-digit pincode"
          maxLength={6}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400"
        />
        <button
          onClick={check}
          disabled={loading || pin.length !== 6}
          className="px-3 py-2 bg-gray-800 text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-all"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Check"}
        </button>
      </div>
      {result && (
        <div className={`mt-2 flex items-start gap-2 p-2.5 rounded-xl text-xs font-medium ${result.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {result.available ? <CheckCircle2 size={13} className="shrink-0 mt-0.5" /> : <XCircle size={13} className="shrink-0 mt-0.5" />}
          {result.message}
        </div>
      )}
    </div>
  );
}
