"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/app/admin/Components/sidebar";
import Header  from "@/app/admin/Components/Header";
import {
  Package, ShoppingCart, Users, TrendingUp, Eye,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

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
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: STATUS_DOT[status] || "#9ca3af" }}
      />
      {status || "—"}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4].map(i => (
        <td key={i} className="py-3 px-5">
          <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminDashboard() {
  const [stats,     setStats]     = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [chartData, setChartData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=1").then(r => r.json()).catch(() => ({ data: [], total: 0 })),
      fetch("/api/orders").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("/api/customers").then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([prods, ords, custs]) => {
      const allOrders = ords.data || [];
      const revenue   = allOrders
        .filter(o => o.status !== "Cancelled")
        .reduce((s, o) => s + (o.total || 0), 0);

      setStats({
        products:  prods.total || (prods.data?.length || 0),
        orders:    allOrders.length,
        customers: custs.data?.length || 0,
        revenue,
      });

      const monthlyRevenue = Array(6).fill(0);
      allOrders.forEach((o) => {
        if (!o.createdAt || o.status === "Cancelled") return;
        const d    = new Date(o.createdAt);
        const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        const idx  = 5 - diff;
        if (idx >= 0 && idx < 6) monthlyRevenue[idx] += o.total || 0;
      });

      const statusCount = { Pending: 0, Processing: 0, Dispatched: 0, Delivered: 0, Cancelled: 0 };
      allOrders.forEach((o) => { if (statusCount[o.status] !== undefined) statusCount[o.status]++; });

      setChartData({ monthlyRevenue, statusCount });
      setOrders(allOrders.slice(0, 10));
      setLoading(false);
    });
  }, []);

  const statItems = [
    { label: "Products",  value: stats.products,                          icon: Package },
    { label: "Orders",    value: stats.orders,                            icon: ShoppingCart },
    { label: "Customers", value: stats.customers,                         icon: Users },
    { label: "Revenue",   value: `₹${(stats.revenue / 1000).toFixed(1)}K`, icon: TrendingUp },
  ];

  const lineData = chartData ? {
    labels: last6,
    datasets: [{
      label:                "Revenue (₹)",
      data:                 chartData.monthlyRevenue,
      borderColor:          "#111827",
      backgroundColor:      "rgba(17,24,39,0.04)",
      fill:                 true,
      tension:              0.3,
      pointBackgroundColor: "#111827",
      pointBorderColor:     "#fff",
      pointBorderWidth:     2,
      pointRadius:          4,
      pointHoverRadius:     6,
    }],
  } : null;

  const doughnutData = chartData ? {
    labels:   Object.keys(chartData.statusCount),
    datasets: [{
      data:            Object.values(chartData.statusCount),
      backgroundColor: ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"],
      borderWidth:     2,
      borderColor:     "#fff",
      hoverOffset:     6,
    }],
  } : null;

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index", intersect: false,
        backgroundColor: "#111827",
        titleFont: { size: 11 },
        bodyFont:  { size: 11 },
        padding: 10,
        callbacks: { label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString()}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#9ca3af" },
        border: { display: false },
      },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: {
          font: { size: 11 }, color: "#9ca3af",
          callback: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "K" : v}`,
        },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 12, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 7 },
      },
    },
  };

  const Spinner = () => (
    <div className="h-44 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeTab="Dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 overflow-y-auto">

          {/* Page header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{dateStr}</p>
            <h1 className="text-[18px] font-semibold text-gray-900">Dashboard</h1>
          </div>

          {/* Stats strip */}
          <div className="flex divide-x divide-gray-200 border-b border-gray-200 overflow-x-auto">
            {statItems.map((s) => (
              <div key={s.label} className="flex-1 min-w-[120px] px-6 py-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-[22px] font-semibold text-gray-900 leading-none">
                  {loading
                    ? <span className="inline-block w-14 h-5 bg-gray-100 rounded animate-pulse" />
                    : s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 space-y-5">

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

              {/* Line chart */}
              <div className="border border-gray-200 p-5">
                <div className="mb-5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Revenue Trend</p>
                  <p className="text-sm font-medium text-gray-900">Last 6 months</p>
                </div>
                {lineData && !loading ? (
                  <Line data={lineData} options={lineOptions} height={80} />
                ) : (
                  <Spinner />
                )}
              </div>

              {/* Doughnut */}
              <div className="border border-gray-200 p-5">
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Order Status</p>
                  <p className="text-sm font-medium text-gray-900">Distribution</p>
                </div>
                {doughnutData && !loading ? (
                  <>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="mt-3 text-center border-t border-gray-100 pt-3">
                      <p className="text-xl font-semibold text-gray-900">{stats.orders}</p>
                      <p className="text-[11px] text-gray-400">Total Orders</p>
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
                <Link
                  href="/admin/orders"
                  className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  View all <Eye size={12} />
                </Link>
              </div>

              {loading ? (
                <table className="w-full text-sm">
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                  </tbody>
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
                        <th className="text-left py-2.5 px-5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                          Order
                        </th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest hidden md:table-cell">
                          Customer
                        </th>
                        <th className="text-left py-2.5 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="text-right py-2.5 px-5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => {
                        const initials = (order.user?.name || "?")
                          .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                        return (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-5">
                              <span className="font-mono text-[12px] text-gray-800">
                                #{String(order._id).slice(-6).toUpperCase()}
                              </span>
                              {order.createdAt && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short",
                                  })}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 flex-shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-[13px] text-gray-800 leading-tight">
                                    {order.user?.name || "—"}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {order.user?.phone || ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusDot status={order.status} />
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="text-[13px] font-medium text-gray-900">
                                ₹{order.total?.toLocaleString()}
                              </span>
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
    </div>
  );
}
