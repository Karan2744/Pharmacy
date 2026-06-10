"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, CheckCircle2, Clock, Truck, XCircle, RefreshCw } from "lucide-react";

const PRIMARY = "#e73096";

const STATUS_OPTIONS = ["Processing", "Dispatched", "Delivered", "Cancelled"];

const statusColor = {
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Dispatched:  "bg-amber-50 text-amber-700 border-amber-200",
  Delivered:   "bg-green-50 text-green-700 border-green-200",
  Cancelled:   "bg-red-50 text-red-700 border-red-200",
};

const statusIcon = {
  Processing: <Clock size={14} className="text-blue-500" />,
  Dispatched:  <Truck size={14} className="text-amber-500" />,
  Delivered:   <CheckCircle2 size={14} className="text-green-500" />,
  Cancelled:   <XCircle size={14} className="text-red-500" />,
};

export default function QRScanner({ onClose }) {
  const scannerRef   = useRef(null);
  const instanceRef  = useRef(null);
  const [phase, setPhase]       = useState("scanning"); // scanning | found | updating | done | error
  const [scanned, setScanned]   = useState(null);       // parsed QR data
  const [order, setOrder]       = useState(null);       // full order from API
  const [newStatus, setNewStatus] = useState("");
  const [message, setMessage]   = useState("");

  // Start html5-qrcode scanner
  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5QrCode = new Html5Qrcode("qr-scan-region");
      instanceRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            // Stop scanning immediately on first hit
            try { await html5QrCode.stop(); } catch (_) {}
            handleScan(decodedText);
          },
          () => {} // ignore per-frame errors
        );
      } catch (err) {
        setPhase("error");
        setMessage("Camera access denied. Please allow camera permission and try again.");
      }
    };

    startScanner();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScan = async (text) => {
    try {
      const data = JSON.parse(text);
      if (!data.fullId && !data.orderId) throw new Error("Not a PharmaCare QR");
      setScanned(data);
      setPhase("found");

      // Fetch full order details if we have the fullId
      if (data.fullId) {
        const res = await fetch(`/api/orders/${data.fullId}`);
        const json = await res.json();
        if (json.success) {
          setOrder(json.data);
          setNewStatus(json.data.status || "Processing");
        }
      } else {
        setNewStatus(data.status || "Processing");
      }
    } catch {
      setPhase("error");
      setMessage("Invalid QR code. Please scan a PharmaCare order invoice.");
    }
  };

  const handleUpdate = async () => {
    const id = scanned?.fullId || order?._id;
    if (!id || !newStatus) return;
    setPhase("updating");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPhase("done");
      setMessage(`Order #${scanned?.orderId} status updated to "${newStatus}"`);
    } catch (err) {
      setPhase("error");
      setMessage(err.message || "Failed to update status.");
    }
  };

  const handleRescan = async () => {
    setPhase("scanning");
    setScanned(null);
    setOrder(null);
    setMessage("");

    // Restart scanner
    const { Html5Qrcode } = await import("html5-qrcode");
    const html5QrCode = new Html5Qrcode("qr-scan-region");
    instanceRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          try { await html5QrCode.stop(); } catch (_) {}
          handleScan(decodedText);
        },
        () => {}
      );
    } catch {
      setPhase("error");
      setMessage("Camera access denied.");
    }
  };

  const currentStatus = order?.status || scanned?.status || "Processing";

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#fce4f3" }}>
              <Camera size={16} style={{ color: PRIMARY }} />
            </div>
            <h2 className="font-black text-gray-900 text-base">Scan Order QR</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
            <X size={17} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Camera view — always mounted so html5-qrcode has a DOM target */}
          <div
            id="qr-scan-region"
            ref={scannerRef}
            className={`w-full rounded-2xl overflow-hidden bg-gray-900 ${phase !== "scanning" ? "hidden" : ""}`}
            style={{ minHeight: 280 }}
          />

          {/* Scanning hint */}
          {phase === "scanning" && (
            <p className="text-center text-xs text-gray-400 font-medium">
              Point camera at the QR code on the printed invoice
            </p>
          )}

          {/* Found — show order info + status picker */}
          {(phase === "found" || phase === "updating") && scanned && (
            <div className="space-y-4">

              {/* Order card */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</p>
                    <p className="font-black text-gray-900">#{scanned.orderId}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[currentStatus] || statusColor["Processing"]}`}>
                    {statusIcon[currentStatus]}
                    {currentStatus}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400 font-semibold">Customer</p>
                    <p className="font-bold text-gray-800">{scanned.customer}</p>
                  </div>
                  {scanned.phone && (
                    <div>
                      <p className="text-gray-400 font-semibold">Phone</p>
                      <p className="font-bold text-gray-800">{scanned.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 font-semibold">Total</p>
                    <p className="font-bold text-gray-800">{scanned.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-semibold">Items</p>
                    <p className="font-bold text-gray-800">{scanned.items}</p>
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Update Delivery Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                        newStatus === s
                          ? "border-transparent text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                      style={newStatus === s ? {
                        backgroundColor:
                          s === "Processing" ? "#3b82f6" :
                          s === "Dispatched" ? "#f59e0b" :
                          s === "Delivered"  ? "#22c55e" : "#ef4444"
                      } : {}}
                    >
                      {statusIcon[s]}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUpdate}
                disabled={phase === "updating" || newStatus === currentStatus}
                className="w-full py-3.5 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: PRIMARY }}
              >
                {phase === "updating" ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating…</>
                ) : (
                  <><CheckCircle2 size={16} /> Confirm Status Update</>
                )}
              </button>

              <button onClick={handleRescan} className="w-full py-2.5 text-gray-500 font-semibold text-sm flex items-center justify-center gap-2 hover:text-gray-700 transition-colors">
                <RefreshCw size={14} /> Scan Another
              </button>
            </div>
          )}

          {/* Done */}
          {phase === "done" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-base">Status Updated!</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleRescan} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Scan Another
                </button>
                <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors" style={{ backgroundColor: PRIMARY }}>
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle size={32} className="text-red-500" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-base">Scan Failed</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <button onClick={handleRescan} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors" style={{ backgroundColor: PRIMARY }}>
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
