"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, Edit, Trash2, TrendingDown } from "lucide-react";

function StockBadge({ stock }) {
  const qty = Number(stock) || 0;
  if (qty === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Out of Stock
      </span>
    );
  if (qty <= 10)
    return (
      <div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Low Stock
        </span>
        <p className="text-xs text-gray-400 mt-0.5">{qty} units left</p>
      </div>
    );
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />In Stock
      </span>
      <p className="text-xs text-gray-400 mt-0.5">{qty} units</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading products…</p>
    </div>
  );
}

function EmptyState({ hasFilter, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Package size={28} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-500">
        {hasFilter ? "No products match your filters" : "No products yet"}
      </p>
      {!hasFilter && (
        <button onClick={onAdd} className="mt-1 text-sm text-blue-600 font-semibold hover:underline">
          Add your first product
        </button>
      )}
    </div>
  );
}

export default function ProductTable({ products = [], loading = false, hasFilter = false, onEdit, onDelete, onAdd }) {
  const [selected, setSelected] = useState([]);

  const toggleOne = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p) => p._id));

  const allChecked  = products.length > 0 && selected.length === products.length;
  const someChecked = selected.length > 0 && !allChecked;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-blue-50 border-b border-blue-100">
          <p className="text-sm font-semibold text-blue-700">
            {selected.length} product{selected.length > 1 ? "s" : ""} selected
          </p>
          <button
            onClick={() => { if (confirm(`Move ${selected.length} product(s) to trash?`)) { selected.forEach((id) => onDelete(id)); setSelected([]); } }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={13} />Move to Trash
          </button>
        </div>
      )}

      {loading ? <LoadingState /> : products.length === 0 ? <EmptyState hasFilter={hasFilter} onAdd={onAdd} /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[780px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 w-10">
                  <input type="checkbox" checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Selling Price (incl. Tax)</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">GST / CGST</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product, idx) => {
                const discount = product.mrp && product.price && product.mrp > product.price
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
                const isSelected = selected.includes(product._id);
                return (
                  <tr key={product._id} className={`transition-colors hover:bg-gray-50/70 ${isSelected ? "bg-blue-50/40" : ""}`}>
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(product._id)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer" />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image ? <Image src={product.image} alt={product.name} width={40} height={40} className="object-contain" /> : <Package size={18} className="text-gray-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">{product.category}</span>
                      {product.subCategory && <p className="text-xs text-gray-400 mt-1">{product.subCategory}</p>}
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const gst  = Number(product.adminGstPercent)  || 0;
                        const cgst = Number(product.adminCgstPercent) || 0;
                        const total = product.price ? +(product.price * (1 + (gst + cgst) / 100)).toFixed(2) : product.price;
                        return (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-black text-gray-900">₹{Number(total).toFixed(2)}</span>
                              {product.mrp && product.mrp !== product.price && <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">Base: ₹{product.price}</p>
                            {discount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-green-600 font-semibold mt-0.5">
                                <TrendingDown size={11} />{discount}% off
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      {(product.adminGstPercent || product.adminCgstPercent) ? (
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500">GST: <span className="font-semibold text-gray-700">{Number(product.adminGstPercent) || 0}%</span></p>
                          <p className="text-[10px] text-gray-500">CGST: <span className="font-semibold text-gray-700">{Number(product.adminCgstPercent) || 0}%</span></p>
                          <p className="text-[10px] text-gray-500 border-t border-gray-100 pt-0.5">
                            Total Tax: <span className="font-bold text-gray-800">{(Number(product.adminGstPercent || 0) + Number(product.adminCgstPercent || 0))}%</span>
                          </p>
                          <p className="text-[10px] text-blue-600">
                            +₹{+(product.price * (Number(product.adminGstPercent || 0) + Number(product.adminCgstPercent || 0)) / 100).toFixed(2)} tax
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No Tax</span>
                      )}
                    </td>
                    <td className="px-5 py-4"><StockBadge stock={product.stock} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEdit(product)} title="Edit"
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => onDelete(product._id)} title="Move to Trash"
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
