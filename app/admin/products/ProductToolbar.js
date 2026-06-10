"use client";

import { Plus, Download, Upload, Loader2 } from "lucide-react";
import ProductSearch from "@/app/admin/products/ProductSearch";

export default function ProductToolbar({
  total = 0,
  filtered = 0,
  loading = false,
  importing = false,
  searchTerm = "",
  setSearchTerm,
  categories = [],
  selectedCategory = "All Categories",
  setSelectedCategory,
  fileInputRef,
  onExport,
  onImport,
  onAdd,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Product Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? "Loading…" : `${filtered} of ${total} products`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <ProductSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Export */}
        <button
          onClick={onExport}
          disabled={total === 0}
          title="Download all products as CSV"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Download size={16} />
          Export CSV
        </button>

        {/* Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          title="Upload a CSV to import products"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {importing ? "Importing…" : "Import CSV"}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onImport}
        />

        {/* Add Product */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>
    </div>
  );
}
