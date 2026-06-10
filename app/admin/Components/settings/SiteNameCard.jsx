import { Store } from "lucide-react";

export default function SiteNameCard({ siteName, setSiteName }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Store size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Site Name</h2>
          <p className="text-sm text-gray-500">The name displayed across your store</p>
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
      <input
        type="text"
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
        placeholder="e.g. Maurya Pharmacy"
      />
    </div>
  );
}
