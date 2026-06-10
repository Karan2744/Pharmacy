"use client";

import { Search } from "lucide-react";

export default function ProductSearch({
  searchTerm = "",
  setSearchTerm = () => {},
  categories = [],
  selectedCategory = "All Categories",
  setSelectedCategory = () => {},
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all placeholder:text-gray-400"
        />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all"
      >
        <option value="All Categories">All Categories</option>
        {categories?.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
