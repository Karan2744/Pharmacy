"use client";

import { Package, CheckCircle2, AlertCircle, Layers } from "lucide-react";

function StatCard({ label, value, icon, colorClass }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function StatsRow({ total = 0, inStock = 0, outOfStock = 0, categoryCount = 0 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Products"
        value={total}
        icon={<Package size={18} />}
        colorClass="bg-blue-50 text-blue-600"
      />
      <StatCard
        label="In Stock"
        value={inStock}
        icon={<CheckCircle2 size={18} />}
        colorClass="bg-green-50 text-green-600"
      />
      <StatCard
        label="Out of Stock"
        value={outOfStock}
        icon={<AlertCircle size={18} />}
        colorClass="bg-red-50 text-red-500"
      />
      <StatCard
        label="Categories"
        value={categoryCount}
        icon={<Layers size={18} />}
        colorClass="bg-purple-50 text-purple-600"
      />
    </div>
  );
}
