"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Sidebar from "@/app/admin/Components/sidebar";
import Header  from "@/app/admin/Components/Header";
import {
  Package, ShoppingCart, Users, TrendingUp, Eye,
  Globe, Store, Plus,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const OfflineSaleModal = dynamic(() => import("@/app/admin/Components/OfflineSaleModal"), { ssr: false });

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now = new Date();
const last6 = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
  return MONTHS[d.getMonth()];
});

const STATUS_DOT = {
  Pending:    "#f59e0b",
  Processing: "#3b82f6",
  Dispatched: "#8b5cf6",
  Delivered:  "#10b981",
  Cancelled:  "#ef4444",
};

function StatusDot({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-700">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_DOT[status] || "#9ca3af" }} />
      {status || "—"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5].map(i => (
        <td key={i} className="py-3 px-5">
          <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminDashboard() {
  const [stats,          setStats]          = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [onlineStats,    setOnlineStats]    = useState({ orders: 0, revenue: 0 });
  const [offlineStats,   setOfflineStats]   = useState({ orders: 0, revenue: 0 });
  const [todayStats,     setTodayStats]     = useState({ online: 0, offline: 0, revenue: 0 });
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [chartData,      setChartData]      = useState(null);
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);
  const [showPOS,        setShowPOS]        = useState(false);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const todayStr = now.toISOString().slice(0, 10);

  const loadData = () => {
    Promise.all([
      fetch("/api/products?limit=1").then(r => r.json()).catch(() => ({ data: [], total: 0 })),
      fetch("/api/orders").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/customers").then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([prods, ords, custs]) => {
      const allOrders = ords.data || [];

      // channel split
      const online  = allOrders.filter(o => o.channel !== "offline");
      const offline = allOrders.filter(o => o.channel === "offline");

      const onlineRev  = online.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
      const offlineRev = offline.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
      const revenue    = onlineRev + offlineRev;

      // today
      const todayOnline  = online.filter(o => o.createdAt?.slice(0, 10) === todayStr);
      const todayOffline = offline.filter(o => o.createdAt?.slice(0, 10) === todayStr);
      const todayRev     = [...todayOnline, ...todayOffline]
        .filter(o => o.status !== "Cancelled")
        .reduce((s, o) => s + (o.total || 0), 0);

      setStats({
        products:  prods.total || (prods.data?.length || 0),
        orders:    allOrders.length,
        customers: custs.data?.length || 0,
        revenue,
      });
      setOnlineStats({ orders: online.length, revenue: onlineRev });
      setOfflineStats({ orders: offline.length, revenue: offlineRev });
      setTodayStats({ online: todayOnline.length, offline: todayOffline.length, revenue: todayRev });

      // charts
      const monthlyOnline  = Array(6).fill(0);
      const monthlyOffline = Array(6).fill(0);
      allOrders.forEach((o) => {
        if (!o.createdAt || o.status === "Cancelled") return;
        const d    = new Date(o.createdAt);
        const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        const idx  = 5 - diff;
        if (idx < 0 || idx >= 6) return;
        if (o.channel === "offline") monthlyOffline[idx] += o.total || 0;
        else                         monthlyOnline[idx]  += o.total || 0;
      });

      const statusCount = { Processing: 0, Dispatched: 0, Delivered: 0, Cancelled: 0 };
      allOrders.forEach((o) => { if (statusCount[o.status] !== undefined) statusCount[o.status]++; });

      setChartData({ monthlyOnline, monthlyOffline, statusCount });
      setOrders(allOrders.slice(0, 10));
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  // ── Chart configs ────────────────────────────────────────────────────────
  const lineData = chartData ? {
    labels: last6,
    datasets: [
      {
        label:                "Online (₹)",
        data:                 chartData.monthlyOnline,
        borderColor:          "#111827",
        backgroundColor:      "rgba(17,24,39,0.05)",
        fill:                 true,
        tension:              0.3,
        pointBackgroundColor: "#111827",
        pointBorderColor:     "#fff",
        pointBorderWidth:     2,
        pointRadius:          4,
        pointHoverRadius:     6,
      },
      {
        label:                "Offline (₹)",
        data:                 chartData.monthlyOffline,
        borderColor:          "#6366f1",
        backgroundColor:      "rgba(99,102,241,0.05)",
        fill:                 true,
        tension:              0.3,
        pointBackgroundColor: "#6366f1",
        pointBorderColor:     "#fff",
        pointBorderWidth:     2,
        pointRadius:          4,
        pointHoverRadius:     6,
      },
    ],
  } : null;

  const doughnutData = chartData ? {
    labels:   ["Online", "Offline"],
    datasets: [{
      data:            [onlineStats.orders, offlineStats.orders],
      backgroundColor: ["#111827", "#6366f1"],
      borderWidth:     2,
      borderColor:     "#fff",
      hoverOffset:     6,
    }],
  } : null;

  const lineOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: { font: { size: 11 }, usePointStyle: true, pointStyleWidth: 7, padding: 16 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleFont: { size: 11 },
        bodyFont:  { size: 11 },
        padding: 10,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString()}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9ca3af" }, border: { display: false } },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 11 }, color: "#9ca3af", callback: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "K" : v}` },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 14, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 7 },
      },
    },
  };

  const Spinner = () => (
    <div className="h-44 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeTab="Dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 overflow-y-auto">

          {/* Page header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{dateStr}</p>
              <h1 className="text-[18px] font-semibold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={() => setShowPOS(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} />
              New Offline Sale
            </button>
          </div>

          {/* Today's activity strip */}
          {!loading && (
            <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 border-b border-gray-200 text-[12px]">
              <span className="text-gray-400 text-[10px] uppercase tracking-widest font-medium">Today</span>
              <div className="flex items-center gap-1.5 text-gray-700">
                <Globe size={12} className="text-gray-400" />
                <span>{todayStats.online} online</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-700">
                <Store size={12} className="text-indigo-500" />
                <span>{todayStats.offline} offline</span>
              </div>
              <div className="text-gray-700">
                <span className="text-gray-400 mr-1">Revenue</span>
                <span className="font-medium">₹{todayStats.revenue.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Main stats strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200 border-b border-gray-200">
            {[
              { label: "Total Products", value: stats.products,   icon: Package },
              { label: "Total Orders",   value: stats.orders,     icon: ShoppingCart },
              { label: "Customers",      value: stats.customers,  icon: Users },
              { label: "Revenue",        value: `₹${(stats.revenue / 1000).toFixed(1)}K`, icon: TrendingUp },
            ].map(s => (
              <div key={s.label} className="px-6 py-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-[22px] font-semibold text-gray-900 leading-none">
                  {loading
                    ? <span className="inline-block w-14 h-5 bg-gray-100 rounded animate-pulse" />
                    : s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Channel breakdown strip */}
          <div className="flex divide-x divide-gray-200 border-b border-gray-200">
            <div className="flex-1 px-6 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={13} className="text-gray-400" />
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Online Store</p>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[20px] font-semibold text-gray-900">
                  {loading ? <span className="inline-block w-10 h-5 bg-gray-100 rounded animate-pulse" /> : onlineStats.orders}
                </span>
                <span className="text-[11px] text-gray-400">orders</span>
                <span className="text-[13px] font-medium text-gray-700 ml-auto">
                  {loading ? "" : `₹${(onlineStats.revenue / 1000).toFixed(1)}K`}
                </span>
              </div>
            </div>
            <div className="flex-1 px-6 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Store size={13} className="text-indigo-500" />
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Offline Store</p>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[20px] font-semibold text-gray-900">
                  {loading ? <span className="inline-block w-10 h-5 bg-gray-100 rounded animate-pulse" /> : offlineStats.orders}
                </span>
                <span className="text-[11px] text-gray-400">orders</span>
                <span className="text-[13px] font-medium text-gray-700 ml-auto">
                  {loading ? "" : `₹${(offlineStats.revenue / 1000).toFixed(1)}K`}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

              {/* Line chart — online vs offline revenue */}
              <div className="border border-gray-200 p-5">
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Revenue Trend</p>
                  <p className="text-sm font-medium text-gray-900">Online vs Offline · Last 6 months</p>
                </div>
                {lineData && !loading ? (
                  <Line data={lineData} options={lineOptions} height={85} />
                ) : (
                  <Spinner />
                )}
              </div>

              {/* Doughnut — channel split */}
              <div className="border border-gray-200 p-5">
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Channel Split</p>
                  <p className="text-sm font-medium text-gray-900">Orders by channel</p>
                </div>
                {doughnutData && !loading ? (
                  <>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <span className="w-2 h-2 rounded-full bg-gray-900 inline-block" /> Online
                        </span>
                        <span className="font-medium text-gray-900">{onlineStats.orders}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Offline
                        </span>
                        <span className="font-medium text-gray-900">{offlineStats.orders}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <Spinner />
                )}
              </div>
            </div>

            {/* Recent orders */}
            <div className="border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Recent Orders</p>
                  <p className="text-sm font-medium text-gray-900">
                    {loading ? "Loading…" : `Latest ${orders.length} transactions`}
                  </p>
                </div>
                <Link href="/admin/orders" className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                  View all <Eye size={12} />
                </Link>
              </div>

              {loading ? (
                <table className="w-full text-sm">
                  <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
                </table>
              ) : orders.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
                  <ShoppingCart size={28} className="text-gray-200" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2.5 px-5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Order</th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest hidden md:table-cell">Customer</th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Channel</th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="text-right py-2.5 px-5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => {
                        const initials = (order.user?.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                        const isOffline = order.channel === "offline";
                        return (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-5">
                              <span className="font-mono text-[12px] text-gray-800">#{String(order._id).slice(-6).toUpperCase()}</span>
                              {order.createdAt && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 flex-shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-[13px] text-gray-800 leading-tight">{order.user?.name || "—"}</p>
                                  <p className="text-[10px] text-gray-400">{order.user?.phone || ""}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 ${isOffline ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                                {isOffline ? <Store size={10} /> : <Globe size={10} />}
                                {isOffline ? "Offline" : "Online"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <StatusDot status={order.status} />
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="text-[13px] font-medium text-gray-900">₹{order.total?.toLocaleString()}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* POS Modal */}
      {showPOS && (
        <OfflineSaleModal
          onClose={() => setShowPOS(false)}
          onSuccess={() => { setLoading(true); loadData(); }}
        />
      )}
    </div>
  );
}
