"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/app/admin/Components/sidebar";
import Header from "@/app/admin/Components/Header";
import { Users, Search, X, ShoppingBag } from "lucide-react";

// Flat muted initials colors — no gradients
const INIT_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];
function initColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return INIT_COLORS[Math.abs(h) % INIT_COLORS.length];
}

const statusStyle = {
  Processing: "bg-blue-50 text-blue-700",
  Dispatched:  "bg-amber-50 text-amber-700",
  Delivered:   "bg-green-50 text-green-700",
  Cancelled:   "bg-red-50 text-red-700",
};

/* ── Side drawer ─────────────────────────────────────────────────────────── */
function CustomerDrawer({ customer, onClose }) {
  if (!customer) return null;
  const orders = [...customer.orderList].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* scrim */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* panel */}
      <div className="w-full max-w-md bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden shadow-xl">

        {/* drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Customer Detail</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* profile block */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${initColor(customer.email)}`}>
              {customer.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{customer.name || "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{customer.email}</p>
              {customer.phone && <p className="text-xs text-gray-400">{customer.phone}</p>}
            </div>
          </div>

          {/* flat stats row — no cards, just dividers */}
          <div className="flex border-t border-gray-100 pt-4">
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wide">Orders</p>
              <p className="text-xl font-bold text-gray-900">{customer.orders}</p>
            </div>
            <div className="w-px bg-gray-100 mx-4" />
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wide">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">₹{customer.totalSpent.toLocaleString("en-IN")}</p>
            </div>
            <div className="w-px bg-gray-100 mx-4" />
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wide">Last Order</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(customer.lastOrder).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* order list */}
        <div className="px-6 py-3 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Order History
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No orders found.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusStyle[order.status] || statusStyle["Processing"]}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{(order.total || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function AdminCustomersPage() {
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState("Customers");
  const [isSidebarOpen, setIsSidebarOpen]     = useState(false);
  const [search, setSearch]                   = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res  = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (data.success) setOrders(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const customers = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      const email = order.user?.email;
      if (!email) return;
      if (!map[email]) {
        map[email] = {
          name: order.user?.name || "",
          email,
          phone: order.user?.phone || "",
          orders: 0,
          totalSpent: 0,
          lastOrder: order.createdAt,
          orderList: [],
        };
      }
      map[email].orders    += 1;
      map[email].totalSpent += order.total || 0;
      if (new Date(order.createdAt) > new Date(map[email].lastOrder))
        map[email].lastOrder = order.createdAt;
      map[email].orderList.push(order);
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name  || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalRevenue = useMemo(() => customers.reduce((s, c) => s + c.totalSpent, 0), [customers]);
  const totalOrders  = useMemo(() => customers.reduce((s, c) => s + c.orders,     0), [customers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1">

          {/* ── Page header bar ───────────────────────────────────────────── */}
          <div className="bg-white border-b border-gray-200 px-6 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Customers</h1>
                <p className="text-xs text-gray-400 mt-0.5">All customers derived from order history</p>
              </div>

              {/* search — in header, no separate card */}
              <div className="relative w-60">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-blue-400 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* ── Stats strip — flat, no cards ──────────────────────────────── */}
          <div className="bg-white border-b border-gray-200 flex items-stretch">
            <div className="px-8 py-4 border-r border-gray-100">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="px-8 py-4 border-r border-gray-100">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="px-8 py-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* ── Customer table ─────────────────────────────────────────────── */}
          <div className="px-6 md:px-8 py-6">
            <div className="bg-white border border-gray-200 rounded overflow-hidden">

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-gray-400">Loading customers…</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Users size={28} className="text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No customers found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search ? "Try a different search term." : "No orders placed yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[680px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-8">#</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Orders</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Spent</th>
                        <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Last Order</th>
                        <th className="px-5 py-3 w-24" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer, idx) => (
                        <tr
                          key={customer.email}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-xs text-gray-400">{idx + 1}</td>

                          {/* name + avatar */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${initColor(customer.email)}`}>
                                {customer.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {customer.name || "—"}
                              </span>
                            </div>
                          </td>

                          {/* contact — email + phone stacked */}
                          <td className="px-5 py-3.5">
                            <p className="text-xs text-gray-600">{customer.email}</p>
                            {customer.phone && (
                              <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>
                            )}
                          </td>

                          {/* orders */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium text-gray-900">{customer.orders}</span>
                          </td>

                          {/* total spent */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{customer.totalSpent.toLocaleString("en-IN")}
                            </span>
                          </td>

                          {/* last order */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-gray-500">
                              {new Date(customer.lastOrder).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                          </td>

                          {/* action */}
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View orders
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* row count */}
            {!loading && (
              <p className="text-xs text-gray-400 mt-3">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""}
                {search ? " matching your search" : ""}
              </p>
            )}
          </div>
        </main>
      </div>

      {/* side drawer */}
      {selectedCustomer && (
        <CustomerDrawer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
