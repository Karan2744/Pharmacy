"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/app/admin/Components/sidebar";
import Header from "@/app/admin/Components/Header";
import { Search, Package, Eye, X, FileText, ScanLine } from "lucide-react";

const InvoiceBill = dynamic(() => import("@/components/InvoiceBill"), { ssr: false });
const QRScanner   = dynamic(() => import("@/components/QRScanner"),   { ssr: false });

const STATUS_DOT = {
  Processing: "#3b82f6",
  Dispatched:  "#f59e0b",
  Delivered:   "#10b981",
  Cancelled:   "#ef4444",
};

const STATUS_TEXT = {
  Processing: "text-blue-700",
  Dispatched:  "text-amber-700",
  Delivered:   "text-emerald-700",
  Cancelled:   "text-red-600",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_TEXT[status] || "text-gray-600"}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[status] || "#6b7280" }} />
      {status}
    </span>
  );
}

const STATUS_TABS = ["All", "Processing", "Dispatched", "Delivered", "Cancelled"];

function InlineStatusSelect({ orderId, status, onChange }) {
  const [updating, setUpdating] = useState(false);
  const handleChange = async (e) => {
    const next = e.target.value;
    if (next === status) return;
    setUpdating(true);
    await onChange(orderId, next);
    setUpdating(false);
  };
  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[status] || "#6b7280" }} />
      {updating
        ? <span className="text-xs text-gray-400">Saving…</span>
        : <select
            value={status}
            onChange={handleChange}
            className={`appearance-none bg-transparent text-xs font-medium pr-4 cursor-pointer focus:outline-none ${STATUS_TEXT[status] || "text-gray-600"}`}
          >
            {["Processing","Dispatched","Delivered","Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
      }
      {!updating && (
        <svg className="pointer-events-none absolute right-0 w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
        </svg>
      )}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 border text-sm font-medium rounded-md ${
      toast.type === "success" ? "bg-white border-gray-200 text-gray-800" : "bg-white border-red-200 text-red-700"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
      {toast.message}
    </div>
  );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDetailDrawer({ order, onClose, onStatusChange, onViewInvoice }) {
  if (!order) return null;

  const status        = order.status || "Processing";
  const subtotal      = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxableAmount = order.taxableAmount ?? subtotal;
  const cgst          = order.cgst   ?? parseFloat((taxableAmount * 0.06).toFixed(2));
  const sgst          = order.sgst   ?? parseFloat((taxableAmount * 0.06).toFixed(2));
  const gstTotal      = order.gstTotal ?? cgst + sgst;
  const rateLabel     = taxableAmount > 0 ? Math.round((cgst / taxableAmount) * 100) : 6;

  const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">{children}</p>
  );

  const BillingRow = ({ label, value, total, muted }) => (
    <div className={`flex justify-between py-1.5 text-sm ${total ? "border-t border-gray-200 mt-1 pt-2.5 font-semibold text-gray-900" : muted ? "text-gray-400" : "text-gray-600"}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col border-l border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={16} />
            </button>
            <div>
              <span className="text-xs text-gray-400 mr-2">Order</span>
              <span className="text-sm font-semibold text-gray-900">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <button
              onClick={onViewInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded text-gray-600 hover:bg-gray-50 transition"
            >
              <FileText size={12} /> Invoice
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">

          {/* Customer */}
          <div className="px-5 py-4">
            <SectionLabel>Customer</SectionLabel>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600">
                {(order.user?.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{order.user?.name || "—"}</p>
                {order.user?.email && <p className="text-xs text-gray-400 mt-0.5">{order.user.email}</p>}
                {order.user?.phone && <p className="text-xs text-gray-400">{order.user.phone}</p>}
              </div>
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="px-5 py-4">
              <SectionLabel>Delivery Address</SectionLabel>
              <div className="text-sm text-gray-700 space-y-0.5">
                {order.address.fullName && <p className="font-medium text-gray-900">{order.address.fullName}</p>}
                {order.address.phone   && <p className="text-gray-400 text-xs">{order.address.phone}</p>}
                {order.address.line1   && <p>{order.address.line1}</p>}
                {order.address.line2   && <p>{order.address.line2}</p>}
                {(order.address.city || order.address.state || order.address.pincode) && (
                  <p>{[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")}</p>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-5 py-4">
            <SectionLabel>Items ({order.items.length})</SectionLabel>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-medium text-gray-400 font-normal">Product</th>
                  <th className="text-center pb-2 text-xs font-medium text-gray-400 font-normal">Qty</th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-400 font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-3">
                      <p className="text-gray-900 font-medium leading-tight">{item.name}</p>
                      {item.brand && <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>}
                    </td>
                    <td className="py-2.5 text-center text-gray-500">{item.quantity}</td>
                    <td className="py-2.5 text-right font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Billing */}
          <div className="px-5 py-4">
            <SectionLabel>Billing</SectionLabel>
            <BillingRow label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
            <BillingRow label="Shipping" value={order.shippingFee === 0 ? "Free" : `₹${order.shippingFee}`} />
            <BillingRow label={`CGST (${rateLabel}%)`} value={`₹${cgst.toFixed(2)}`} muted />
            <BillingRow label={`SGST (${rateLabel}%)`} value={`₹${sgst.toFixed(2)}`} muted />
            <BillingRow label="Total GST" value={`₹${gstTotal.toFixed(2)}`} muted />
            <BillingRow label="Grand Total" value={`₹${(order.total || 0).toLocaleString("en-IN")}`} total />
          </div>

          {/* Payment + Date */}
          <div className="px-5 py-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Payment</p>
              <p className="text-sm text-gray-800">{order.paymentMethod || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Date</p>
              <p className="text-sm text-gray-800">
                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Update Status */}
          <div className="px-5 py-4">
            <SectionLabel>Update Status</SectionLabel>
            <div className="flex gap-2 flex-wrap">
              {["Processing","Dispatched","Delivered","Cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(order._id, s)}
                  className={`px-3 py-1.5 text-xs font-medium border rounded transition ${
                    status === s
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder]   = useState(null);
  const [showScanner, setShowScanner]     = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        // Keep the drawer in sync
        setSelectedOrder((prev) =>
          prev?._id === orderId ? { ...prev, status: newStatus } : prev
        );
        setToast({ message: "Order status updated", type: "success" });
      } else {
        setToast({ message: data.message || "Failed to update status", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to update status", type: "error" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Derived stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const processingCount = orders.filter((o) => o.status === "Processing").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const statusCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
    return acc;
  }, {});

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    const matchSearch =
      !search ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      o._id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1">

          {/* Page header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Orders</h1>
              <p className="text-xs text-gray-400 mt-0.5">{orders.length} total · ₹{totalRevenue.toLocaleString("en-IN")} revenue</p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition"
            >
              <ScanLine size={13} /> Scan QR
            </button>
          </div>

          {/* Stats strip */}
          <div className="border-b border-gray-200 flex divide-x divide-gray-200">
            {[
              { label: "Total Orders",  value: orders.length },
              { label: "Processing",    value: processingCount },
              { label: "Delivered",     value: deliveredCount },
              { label: "Revenue",       value: `₹${totalRevenue.toLocaleString("en-IN")}` },
            ].map((s) => (
              <div key={s.label} className="flex-1 px-5 py-3.5">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">{s.label}</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-56">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-gray-400 bg-white"
              />
            </div>
            {/* Status tabs */}
            <div className="flex items-center gap-0 overflow-x-auto">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === tab
                      ? "border-gray-900 text-gray-900 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                  <span className="ml-1.5 text-gray-400">{statusCounts[tab]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading orders…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-sm font-medium text-gray-500">No orders found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {search || statusFilter !== "All" ? "Try adjusting your filters." : "No orders placed yet."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Order","Customer","Items","Amount","Status","Date",""].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const currentStatus = order.status || "Processing";
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">

                        {/* Order */}
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.paymentMethod}</p>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-3">
                          <p className="text-sm text-gray-900">{order.user?.name || "—"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.user?.email || ""}</p>
                        </td>

                        {/* Items */}
                        <td className="px-5 py-3">
                          <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate">
                            {order.items.map((i) => i.name).slice(0, 2).join(", ")}
                            {order.items.length > 2 ? ` +${order.items.length - 2}` : ""}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-gray-900">₹{(order.total || 0).toLocaleString("en-IN")}</p>
                        </td>

                        {/* Status — inline select */}
                        <td className="px-5 py-3">
                          <InlineStatusSelect orderId={order._id} status={currentStatus} onChange={handleStatusChange} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3">
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs text-gray-500 hover:text-gray-900 transition flex items-center gap-1"
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      <Toast toast={toast} />

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
        onViewInvoice={() => setInvoiceOrder(selectedOrder)}
      />

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceBill order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onClose={() => {
            setShowScanner(false);
            // Refresh orders list after a scan-update
            fetch("/api/orders", { cache: "no-store" })
              .then((r) => r.json())
              .then((d) => { if (d.success) setOrders(d.data); })
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
