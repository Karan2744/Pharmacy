"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/app/admin/Components/sidebar";
import Header from "@/app/admin/Components/Header";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Layers,
  Tag,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type !== "error";
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-5 py-4 flex items-center gap-3 min-w-[280px]">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            ok ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {ok ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : (
            <AlertCircle size={18} className="text-red-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{ok ? "Success" : "Error"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState("Categories");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Active inner tab
  const [innerTab, setInnerTab] = useState("categories"); // "categories" | "subcategories"

  // Category form
  const [catName, setCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  // Inline edit for category
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Subcategory form
  const [subCatName, setSubCatName] = useState("");
  const [subCatParent, setSubCatParent] = useState("");
  const [subCatLoading, setSubCatLoading] = useState(false);

  // Inline edit for subcategory
  const [editingSub, setEditingSub] = useState(null); // { catId, index, value }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !subCatParent) {
      const firstActive = categories.find((c) => !c.isDeleted);
      if (firstActive) setSubCatParent(firstActive._id);
    }
  }, [categories, subCatParent]);

  const activeCategories = categories.filter((c) => !c.isDeleted);
  const deletedCategories = categories.filter((c) => c.isDeleted);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Add Category ───────────────────────────────────────────────────────────
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.data]);
        setCatName("");
        showToast(`Category "${data.data.name}" added.`);
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to add category.", "error");
    } finally {
      setCatLoading(false);
    }
  };

  // ── Save Inline Category Edit ──────────────────────────────────────────────
  const handleSaveCatEdit = async (id) => {
    if (!editingCatName.trim()) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.map((c) => (c._id === id ? data.data : c)));
        showToast("Category renamed.");
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to rename category.", "error");
    } finally {
      setEditingCatId(null);
    }
  };

  // ── Delete Category ────────────────────────────────────────────────────────
  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        // API returns the trashed document; update state to reflect soft-delete
        setCategories((prev) => prev.map((c) => (c._id === id ? data.data : c)));
        showToast(`Category "${name}" deleted.`);
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  const handleRestoreCategory = async (id, name) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false, deletedAt: null }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.map((c) => (c._id === id ? data.data : c)));
        showToast(`Category "${name}" restored.`);
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to restore category.", "error");
    }
  };

  const handlePermanentDeleteCategory = async (id, name) => {
    if (!confirm(`Permanently delete category "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        showToast(`Category "${name}" permanently deleted.`);
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to delete permanently.", "error");
    }
  };


  // ── Add Subcategory ────────────────────────────────────────────────────────
  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!subCatName.trim() || !subCatParent) return;
    const parent = categories.find((c) => c._id === subCatParent);
    if (!parent) return;

    if (parent.subcategories.includes(subCatName.trim())) {
      showToast("Subcategory already exists in this category.", "error");
      return;
    }

    setSubCatLoading(true);
    try {
      const newSubs = [...parent.subcategories, subCatName.trim()];
      const res = await fetch(`/api/categories/${subCatParent}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategories: newSubs }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === subCatParent ? data.data : c))
        );
        setSubCatName("");
        showToast(`Subcategory "${subCatName.trim()}" added.`);
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to add subcategory.", "error");
    } finally {
      setSubCatLoading(false);
    }
  };

  // ── Save Subcategory Edit ──────────────────────────────────────────────────
  const handleSaveSubEdit = async () => {
    if (!editingSub || !editingSub.value.trim()) return;
    const parent = categories.find((c) => c._id === editingSub.catId);
    if (!parent) return;

    const newSubs = [...parent.subcategories];
    newSubs[editingSub.index] = editingSub.value.trim();

    try {
      const res = await fetch(`/api/categories/${editingSub.catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategories: newSubs }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === editingSub.catId ? data.data : c))
        );
        showToast("Subcategory updated.");
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to update subcategory.", "error");
    } finally {
      setEditingSub(null);
    }
  };

  // ── Delete Subcategory ─────────────────────────────────────────────────────
  const handleDeleteSubcategory = async (catId, index, subName) => {
    if (!confirm(`Delete subcategory "${subName}"?`)) return;
    const parent = categories.find((c) => c._id === catId);
    if (!parent) return;

    const newSubs = parent.subcategories.filter((_, i) => i !== index);
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategories: newSubs }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === catId ? data.data : c))
        );
        showToast(`Subcategory "${subName}" deleted.`);
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to delete subcategory.", "error");
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const allSubcategories = activeCategories.flatMap((cat) =>
    (cat.subcategories || []).map((sub, i) => ({
      sub,
      catId: cat._id,
      catName: cat.name,
      index: i,
    }))
  );

  const totalSubs = allSubcategories.length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-black text-gray-900">Category Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Organise your pharmacy products with categories and subcategories
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Layers size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{activeCategories.length}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Categories</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Tag size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{totalSubs}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Subcategories</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">
                  {activeCategories.filter((c) => c.subcategories?.length > 0).length}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">With Subcategories</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">
                  {activeCategories.filter((c) => !c.subcategories?.length).length}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Empty Categories</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{deletedCategories.length}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Trashed</p>
              </div>
            </div>
          </div>

          {/* Tab Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab Bar */}
            <div className="flex border-b border-gray-100">
              {[
                { key: "categories",    label: "Categories",    icon: Layers, count: activeCategories.length },
                { key: "subcategories", label: "Subcategories", icon: Tag,    count: totalSubs },
                { key: "trash",         label: "Trash",         icon: Trash2, count: deletedCategories.length },
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setInnerTab(key)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    innerTab === key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      innerTab === key
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── CATEGORIES TAB ───────────────────────────────────────── */}
            {innerTab === "categories" && (
              <div>
                {/* Add Category Form */}
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <form onSubmit={handleAddCategory} className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Layers size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="New category name…"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={catLoading || !catName.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {catLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                      Add Category
                    </button>
                  </form>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <p className="text-sm text-gray-400">Loading categories…</p>
                  </div>
                ) : activeCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Layers size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No categories yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-y border-gray-100">
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">#</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Category Name</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Subcategories</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {activeCategories.map((cat, idx) => (
                          <tr key={cat._id} className="hover:bg-gray-50/70 transition-colors group">

                            {/* # */}
                            <td className="px-5 py-4 text-xs text-gray-400">{idx + 1}</td>

                            {/* Name */}
                            <td className="px-5 py-4">
                              {editingCatId === cat._id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    autoFocus
                                    value={editingCatName}
                                    onChange={(e) => setEditingCatName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveCatEdit(cat._id);
                                      if (e.key === "Escape") setEditingCatId(null);
                                    }}
                                    className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-50 w-48"
                                  />
                                  <button onClick={() => handleSaveCatEdit(cat._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setEditingCatId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Layers size={14} className="text-blue-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                                </div>
                              )}
                            </td>

                            {/* Subcategories preview */}
                            <td className="px-5 py-4">
                              {cat.subcategories?.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                  {cat.subcategories.slice(0, 3).map((sub) => (
                                    <span key={sub} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-xs font-medium">
                                      {sub}
                                    </span>
                                  ))}
                                  {cat.subcategories.length > 3 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">
                                      +{cat.subcategories.length - 3} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No subcategories</span>
                              )}
                            </td>

                            {/* Created */}
                            <td className="px-5 py-4 text-xs text-gray-400">
                              {cat.createdAt
                                ? new Date(cat.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : "—"}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => { setEditingCatId(cat._id); setEditingCatName(cat.name); }}
                                  title="Rename"
                                  className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                  title="Delete"
                                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── TRASH TAB ───────────────────────────────────────── */}
            {innerTab === "trash" && (
              <div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <p className="text-sm text-gray-400">Loading trashed categories…</p>
                  </div>
                ) : deletedCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Trash2 size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No trashed categories</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-y border-gray-100">
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">#</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Category Name</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Subcategories</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Deleted</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {deletedCategories.map((cat, idx) => (
                          <tr key={cat._id} className="hover:bg-gray-50/70 transition-colors group">
                            <td className="px-5 py-4 text-xs text-gray-400">{idx + 1}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                  <Trash2 size={14} className="text-red-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {cat.subcategories?.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                  {cat.subcategories.slice(0, 3).map((sub) => (
                                    <span key={sub} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-xs font-medium">
                                      {sub}
                                    </span>
                                  ))}
                                  {cat.subcategories.length > 3 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">
                                      +{cat.subcategories.length - 3} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No subcategories</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-400">
                              {cat.deletedAt
                                ? new Date(cat.deletedAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleRestoreCategory(cat._id, cat.name)}
                                  title="Restore"
                                  className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePermanentDeleteCategory(cat._id, cat.name)}
                                  title="Delete permanently"
                                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── SUBCATEGORIES TAB ────────────────────────────────────── */}
            {innerTab === "subcategories" && (
              <div>
                {/* Add Subcategory Form */}
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <form onSubmit={handleAddSubcategory} className="flex items-center gap-3 flex-wrap">
                    {/* Parent select */}
                    <div className="relative">
                      <select
                        value={subCatParent}
                        onChange={(e) => setSubCatParent(e.target.value)}
                        className="pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all appearance-none font-medium"
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Name input */}
                    <div className="relative flex-1 max-w-xs">
                      <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="New subcategory name…"
                        value={subCatName}
                        onChange={(e) => setSubCatName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={subCatLoading || !subCatName.trim() || !subCatParent}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {subCatLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                      Add Subcategory
                    </button>
                  </form>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <p className="text-sm text-gray-400">Loading…</p>
                  </div>
                ) : allSubcategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Tag size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No subcategories yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-y border-gray-100">
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">#</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Subcategory Name</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Parent Category</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {allSubcategories.map(({ sub, catId, catName, index }, rowIdx) => (
                          <tr key={`${catId}-${index}`} className="hover:bg-gray-50/70 transition-colors">

                            <td className="px-5 py-4 text-xs text-gray-400">{rowIdx + 1}</td>

                            {/* Subcategory name (inline-editable) */}
                            <td className="px-5 py-4">
                              {editingSub?.catId === catId && editingSub?.index === index ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    autoFocus
                                    value={editingSub.value}
                                    onChange={(e) => setEditingSub((prev) => ({ ...prev, value: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveSubEdit();
                                      if (e.key === "Escape") setEditingSub(null);
                                    }}
                                    className="px-3 py-1.5 border border-purple-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-50 w-44"
                                  />
                                  <button onClick={handleSaveSubEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setEditingSub(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <Tag size={13} className="text-purple-500" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-800">{sub}</span>
                                </div>
                              )}
                            </td>

                            {/* Parent */}
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
                                <Layers size={11} />
                                {catName}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingSub({ catId, index, value: sub })}
                                  title="Edit"
                                  className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(catId, index, sub)}
                                  title="Delete"
                                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
