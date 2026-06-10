"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar        from "@/app/admin/Components/sidebar";
import Header         from "@/app/admin/Components/Header";
import StatsRow       from "@/app/admin/products/StatsRow";
import ProductToolbar from "@/app/admin/products/ProductToolbar";
import ProductTable   from "@/app/admin/products/productTable";
import TrashTable     from "@/app/admin/products/TrashTable";
import ProductForm    from "@/app/admin/products/addproducts";
import { CheckCircle2, Trash2, Package } from "lucide-react";
import { toCSV, parseCSV } from "@/app/auth/utils/csvUtils";
// ── CSV helpers ────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────

const BLANK = {
  name:"", brand:"", category:"", subCategory:"",
  price:"", mrp:"", adminGstPercent:"", adminCgstPercent:"", stock:"50", image:"", images:[],
  // medicine-specific
  saltComposition:"", packSize:"", prescriptionRequired:false, manufacturer:"", storageInfo:"",
  // drug info
  aboutDrug:"", howItWorks:"",
  usesText:[], sideEffectsText:[], howToUseText:[], drugInteractions:[], highlightsText:[],
  // safety advice
  safetyAdvice:{
    alcohol:   { level:"consult", advice:"" },
    pregnancy: { level:"consult", advice:"" },
    lactation: { level:"consult", advice:"" },
    driving:   { level:"consult", advice:"" },
    kidney:    { level:"consult", advice:"" },
    liver:     { level:"consult", advice:"" },
  },
  // faqs
  faqs:[],
};

export default function AdminProducts() {
  const fileInputRef = useRef(null);

  const [activeTab,     setActiveTab]     = useState("Products");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [innerTab,      setInnerTab]      = useState("active"); // "active" | "trash"

  // Data
  const [products,      setProducts]      = useState([]);
  const [trashProducts, setTrashProducts] = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [subsByCat,     setSubsByCat]     = useState({});
  const [loading,       setLoading]       = useState(true);
  const [trashLoading,  setTrashLoading]  = useState(false);

  // Filters
  const [searchTerm,    setSearchTerm]    = useState("");
  const [selCategory,   setSelCategory]   = useState("All Categories");

  // Form
  const [showForm,      setShowForm]      = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [formData,      setFormData]      = useState(BLANK);

  // UI
  const [importing,     setImporting]     = useState(false);
  const [toast,         setToast]         = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  // Fetch trash when tab is opened
  useEffect(() => { if (innerTab === "trash") fetchTrash(); }, [innerTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const d   = await res.json();
      if (d.success) setProducts(d.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTrash = async () => {
    setTrashLoading(true);
    try {
      const res = await fetch("/api/products?trash=true", { cache: "no-store" });
      const d   = await res.json();
      if (d.success) setTrashProducts(d.data);
    } catch (err) { console.error(err); }
    finally { setTrashLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const d   = await res.json();
      if (!d.success) return;
      setCategories(d.data.map((c) => c.name));
      const m = {};
      d.data.forEach((c) => { m[c.name] = c.subcategories || []; });
      setSubsByCat(m);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const subs = subsByCat[formData.category] || [];
    if (subs.length > 0 && !subs.includes(formData.subCategory))
      setFormData((p) => ({ ...p, subCategory: subs[0] }));
  }, [formData.category, subsByCat]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Add / Edit ─────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setIsEditing(false); setEditingId(null);
    const cat = categories[0] || "";
    setFormData({ ...BLANK, category: cat, subCategory: (subsByCat[cat] || [])[0] || "" });
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setIsEditing(true); setEditingId(product._id);
    setFormData({
      name: product.name||"", brand: product.brand||"",
      category: product.category||categories[0]||"",
      subCategory: product.subCategory||"",
      price: product.price??"", mrp: product.mrp??"", adminGstPercent: product.adminGstPercent ?? "", adminCgstPercent: product.adminCgstPercent ?? "", stock: product.stock??"",
      image: product.image||"", images: product.images||(product.image?[product.image]:[]),
      // medicine-specific
      saltComposition: product.saltComposition||"",
      packSize: product.packSize||"",
      prescriptionRequired: product.prescriptionRequired||false,
      manufacturer: product.manufacturer||"",
      storageInfo: product.storageInfo||"",
      // drug info
      aboutDrug: product.aboutDrug||"",
      howItWorks: product.howItWorks||"",
      usesText: product.usesText||[],
      sideEffectsText: product.sideEffectsText||[],
      howToUseText: product.howToUseText||[],
      drugInteractions: product.drugInteractions||[],
      highlightsText: product.highlightsText||[],
      // safety advice
      safetyAdvice: product.safetyAdvice || {
        alcohol:   { level:"consult", advice:"" },
        pregnancy: { level:"consult", advice:"" },
        lactation: { level:"consult", advice:"" },
        driving:   { level:"consult", advice:"" },
        kidney:    { level:"consult", advice:"" },
        liver:     { level:"consult", advice:"" },
      },
      // faqs
      faqs: product.faqs||[],
    });
    setShowForm(true);
  };

  const handleAddSubcategory = (sub) => {
    if (!sub?.trim()) return;
    const cat = formData.category || categories[0] || "";
    const t   = sub.trim();
    setSubsByCat((prev) => {
      const ex = prev[cat] || [];
      if (ex.includes(t)) return prev;
      return { ...prev, [cat]: [...ex, t] };
    });
    setFormData((p) => ({ ...p, subCategory: t }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url    = isEditing ? `/api/products/${editingId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      const body   = { ...formData, price:Number(formData.price), mrp:Number(formData.mrp), stock:Number(formData.stock) };
      if (!body.image && body.images?.length) body.image = body.images[0];
      const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const d   = await res.json();
      if (d.success) {
        await fetchProducts();
        showToast(isEditing ? "Product updated!" : "Product added!");
        setShowForm(false); setFormData(BLANK);
      } else { showToast(d.message || "Something went wrong.", "error"); }
    } catch (err) { console.error(err); }
  };

  // ── Soft-delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Move this product to trash?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const d   = await res.json();
      if (d.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        if (innerTab === "trash") setTrashProducts((prev) => prev.filter((p) => p._id !== id));
        showToast("Moved to trash.");
      }
    } catch (err) { console.error(err); }
  };

  // ── Restore ────────────────────────────────────────────────────────────────
  const handleRestore = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "PATCH" });
      const d   = await res.json();
      if (d.success) {
        setTrashProducts((prev) => prev.filter((p) => p._id !== id));
        await fetchProducts();
        showToast("Product restored!");
      }
    } catch (err) { console.error(err); }
  };

  // ── Permanent delete ───────────────────────────────────────────────────────
  const handleDeleteForever = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}?force=true`, { method: "DELETE" });
      const d   = await res.json();
      if (d.success) {
        setTrashProducts((prev) => prev.filter((p) => p._id !== id));
        showToast("Permanently deleted.");
      }
    } catch (err) { console.error(err); }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!products.length) return;
    const blob = new Blob([toCSV(products)], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `products_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import CSV ─────────────────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0]; if (!file) return; e.target.value = "";
    setImporting(true);
    try {
      const rows = parseCSV(await file.text());
      if (!rows.length) { showToast("No valid rows found."); return; }
      const res = await fetch("/api/products/bulk", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(rows) });
      const d   = await res.json();
      if (d.success) { await fetchProducts(); showToast(`Imported ${d.count} product${d.count!==1?"s":""}!`); }
      else showToast(d.message||"Import failed.", "error");
    } catch (err) { console.error(err); showToast("Import failed — check CSV format.", "error"); }
    finally { setImporting(false); }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const ms = (p.name?.toLowerCase()||"").includes(searchTerm.toLowerCase());
    const mc = selCategory === "All Categories" || p.category === selCategory;
    return ms && mc;
  });

  const inStock       = products.filter((p) => (p.stock||0) > 0).length;
  const outOfStock    = products.length - inStock;
  const categoryCount = [...new Set(products.map((p) => p.category).filter(Boolean))].length;
  const currentSubs   = subsByCat[formData.category] || [];

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Toolbar — only shown on active tab */}
          {innerTab === "active" && (
            <ProductToolbar
              total={products.length} filtered={filtered.length} loading={loading}
              importing={importing} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              categories={categories} selectedCategory={selCategory} setSelectedCategory={setSelCategory}
              fileInputRef={fileInputRef} onExport={handleExport} onImport={handleImport} onAdd={handleOpenAdd}
            />
          )}

          {/* Trash header */}
          {innerTab === "trash" && (
            <div>
              <h1 className="text-2xl font-black text-gray-900">Trash</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {trashLoading ? "Loading…" : `${trashProducts.length} deleted product${trashProducts.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}

          {/* Stats — only on active tab */}
          {innerTab === "active" && (
            <StatsRow total={products.length} inStock={inStock} outOfStock={outOfStock} categoryCount={categoryCount} />
          )}

          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
            <button
              onClick={() => setInnerTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                innerTab === "active" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Package size={15} />
              Products
              {products.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${innerTab === "active" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {products.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setInnerTab("trash")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                innerTab === "trash" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Trash2 size={15} />
              Trash
              {trashProducts.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${innerTab === "trash" ? "bg-red-400 text-white" : "bg-red-50 text-red-500"}`}>
                  {trashProducts.length}
                </span>
              )}
            </button>
          </div>

          {/* Table */}
          {innerTab === "active" ? (
            <ProductTable
              products={filtered} loading={loading}
              hasFilter={!!(searchTerm || selCategory !== "All Categories")}
              onEdit={handleOpenEdit} onDelete={handleDelete} onAdd={handleOpenAdd}
            />
          ) : (
            <TrashTable
              products={trashProducts} loading={trashLoading}
              onRestore={handleRestore} onDeleteForever={handleDeleteForever}
            />
          )}

        </main>
      </div>

      {/* Modal */}
      <ProductForm
        showForm={showForm} setShowForm={setShowForm} handleSubmit={handleSubmit}
        newProduct={formData} setNewProduct={setFormData} categories={categories}
        subcategories={currentSubs} addSubcategory={handleAddSubcategory} isEditing={isEditing}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-5 py-4 flex items-center gap-3 min-w-[280px]">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${toast.type === "error" ? "bg-red-50" : "bg-green-50"}`}>
              <CheckCircle2 size={18} className={toast.type === "error" ? "text-red-500" : "text-green-500"} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{toast.type === "error" ? "Error" : "Done"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
