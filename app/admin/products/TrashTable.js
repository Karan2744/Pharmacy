"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, Trash2, RotateCcw } from "lucide-react";

function EmptyTrash() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Trash2 size={28} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-500">Trash is empty</p>
      <p className="text-xs text-gray-400">Deleted products will appear here</p>
    </div>
  );
}

export default function TrashTable({ products = [], loading = false, onRestore, onDeleteForever }) {
  const [selected, setSelected] = useState([]);

  const toggleOne = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p) => p._id));

  const allChecked  = products.length > 0 && selected.length === products.length;
  const someChecked = selected.length > 0 && !allChecked;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-100">
          <p className="text-sm font-semibold text-amber-700">
            {selected.length} product{selected.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { selected.forEach((id) => onRestore(id)); setSelected([]); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
            >
              <RotateCcw size={13} />Restore All
            </button>
            <button
              onClick={() => { if (confirm(`Permanently delete ${selected.length} product(s)? This cannot be undone.`)) { selected.forEach((id) => onDeleteForever(id)); setSelected([]); } }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={13} />Delete Forever
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-red-300 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading trash…</p>
        </div>
      ) : products.length === 0 ? <EmptyTrash /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-red-50/50 border-b border-red-100">
                <th className="px-5 py-3.5 w-10">
                  <input type="checkbox" checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll} className="w-4 h-4 accent-red-500 cursor-pointer" />
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product, idx) => {
                const isSelected = selected.includes(product._id);
                return (
                  <tr key={product._id} className={`transition-colors hover:bg-red-50/30 ${isSelected ? "bg-red-50/40" : ""}`}>
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(product._id)}
                        className="w-4 h-4 accent-red-500 cursor-pointer" />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 font-medium">{idx + 1}</td>

                    {/* Product - greyed out to indicate deleted state */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 opacity-60">
                        <div className="w-11 h-11 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image
                            ? <Image src={product.image} alt={product.name} width={40} height={40} className="object-contain grayscale" />
                            : <Package size={18} className="text-gray-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-600 truncate max-w-[200px] line-through decoration-gray-400">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 opacity-60">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-semibold">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 opacity-60">
                      <span className="text-sm font-bold text-gray-500">₹{product.price}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onRestore(product._id)} title="Restore product"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                          <RotateCcw size={13} />Restore
                        </button>
                        <button onClick={() => { if (confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) onDeleteForever(product._id); }}
                          title="Delete forever"
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
