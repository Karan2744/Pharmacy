"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Filter, ChevronDown, Star, X, Search, Package } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { slugify } from "@/lib/slugify";

// ── colour palette for category banners ──────────────────────────────────────
const BG_COLOURS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700",
  "from-rose-500 to-rose-700",
  "from-amber-500 to-amber-700",
  "from-teal-500 to-teal-700",
  "from-indigo-500 to-indigo-700",
  "from-orange-500 to-orange-700",
];

function colourFor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return BG_COLOURS[Math.abs(h) % BG_COLOURS.length];
}

// ── Main content ──────────────────────────────────────────────────────────────
function CategoryContent() {
  const { slug }       = useParams();
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const { addToCart, isAuthenticated } = useCart();

  const subQuery = searchParams.get("sub");

  const [categoryName,    setCategoryName]    = useState("");
  const [subcategories,   setSubcategories]   = useState([]);
  const [products,        setProducts]        = useState([]);
  const [filteredProducts,setFilteredProducts]= useState([]);
  const [loading,         setLoading]         = useState(true);
  const [catLoading,      setCatLoading]      = useState(true);

  const [selectedSubCats, setSelectedSubCats] = useState(subQuery ? [subQuery] : []);
  const [selectedBrands,  setSelectedBrands]  = useState([]);
  const [sortBy,          setSortBy]          = useState("Popularity");
  const [showMobileFilters,setShowMobileFilters]=useState(false);
  const [toast,           setToast]           = useState("");

  // ── Step 1: resolve slug → category name using the categories API ─────────
  useEffect(() => {
    if (!slug) return;
    (async () => {
      setCatLoading(true);
      try {
        const res  = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          const match = data.data.find((c) => slugify(c.name) === slug);
          if (match) {
            setCategoryName(match.name);
            setSubcategories(match.subcategories || []);
          } else {
            // fallback: humanise the slug
            setCategoryName(slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
          }
        }
      } catch {
        setCategoryName(slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      } finally {
        setCatLoading(false);
      }
    })();
  }, [slug]);

  // ── Step 2: fetch products for that category ──────────────────────────────
  useEffect(() => {
    if (!categoryName || catLoading) return;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(
          `/api/products?category=${encodeURIComponent(categoryName)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const list = data.success ? data.data : [];
        setProducts(list);
        setFilteredProducts(list);
      } catch {
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryName, catLoading]);

  // ── Sync URL sub param ────────────────────────────────────────────────────
  useEffect(() => {
    if (subQuery) setSelectedSubCats([subQuery]);
  }, [subQuery]);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...products];
    if (selectedSubCats.length > 0)
      result = result.filter((p) => selectedSubCats.includes(p.subCategory));
    if (selectedBrands.length > 0)
      result = result.filter((p) => selectedBrands.includes(p.brand));
    if (sortBy === "Price: Low to High")  result.sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low")  result.sort((a, b) => b.price - a.price);
    if (sortBy === "Discount")            result.sort((a, b) => parseInt(b.discount) - parseInt(a.discount));
    setFilteredProducts(result);
  }, [selectedSubCats, selectedBrands, products, sortBy]);

  const toggleSubCat = (n) =>
    setSelectedSubCats((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const toggleBrand = (n) =>
    setSelectedBrands((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const allBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  const getProductUrl = (product) => `/medicine/${slugify(product.name)}-${product._id}`;

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/login"); return; }
    addToCart(product, 1);
    setToast(`Added ${product.name} to cart`);
    window.setTimeout(() => setToast(""), 2500);
  };

  const bannerGradient = colourFor(categoryName);

  if (catLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Banner ── */}
      <div className={`bg-gradient-to-r ${bannerGradient} py-10`}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={12} />
            <Link href="/categories" className="hover:text-white">Categories</Link>
            <ChevronRight size={12} />
            <span className="text-white font-semibold">{categoryName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">{categoryName}</h1>
          <p className="text-white/80 mt-1 text-sm">
            {loading ? "Fetching products…" : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
          </p>

          {/* Sub-category chips */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleSubCat(sub)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedSubCats.includes(sub)
                      ? "bg-white text-gray-900"
                      : "bg-white/20 text-white hover:bg-white/30 border border-white/40"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-20 pt-6">
        {toast && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            ✓ {toast}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">Filters</h2>
                {(selectedSubCats.length > 0 || selectedBrands.length > 0) && (
                  <button
                    onClick={() => { setSelectedSubCats([]); setSelectedBrands([]); }}
                    className="text-xs text-blue-600 font-semibold mt-1 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sub Categories */}
              {subcategories.length > 0 && (
                <div className="p-5 border-b border-gray-50">
                  <h3 className="font-bold text-gray-700 text-xs mb-3 uppercase tracking-wider">
                    Sub Categories
                  </h3>
                  <div className="space-y-2.5">
                    {subcategories.map((sub) => (
                      <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedSubCats.includes(sub)}
                          onChange={() => toggleSubCat(sub)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className={`text-sm transition-colors ${selectedSubCats.includes(sub) ? "text-blue-600 font-bold" : "text-gray-600 group-hover:text-blue-600"}`}>
                          {sub}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {allBrands.length > 0 && (
                <div className="p-5">
                  <h3 className="font-bold text-gray-700 text-xs mb-3 uppercase tracking-wider">
                    Brand
                  </h3>
                  <div className="space-y-2.5">
                    {allBrands.slice(0, 8).map((brand) => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? "text-blue-600 font-bold" : "text-gray-600 group-hover:text-blue-600"}`}>
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> of{" "}
                <span className="font-bold text-gray-800">{products.length}</span> products
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold"
                >
                  <Filter size={16} /> Filters
                  {(selectedSubCats.length + selectedBrands.length) > 0 && (
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center">
                      {selectedSubCats.length + selectedBrands.length}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm">
                  <span className="text-gray-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
                  >
                    <option>Popularity</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-[100] lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                <div className="absolute inset-y-0 right-0 w-[300px] bg-white shadow-2xl flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {subcategories.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-700 text-xs mb-3 uppercase tracking-wider">Sub Categories</h3>
                        {subcategories.map((sub) => (
                          <label key={sub} className="flex items-center gap-3 py-2 cursor-pointer">
                            <input type="checkbox" checked={selectedSubCats.includes(sub)} onChange={() => toggleSubCat(sub)} className="w-4 h-4 rounded text-blue-600" />
                            <span className="text-sm text-gray-700">{sub}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {allBrands.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-700 text-xs mb-3 uppercase tracking-wider">Brand</h3>
                        {allBrands.map((b) => (
                          <label key={b} className="flex items-center gap-3 py-2 cursor-pointer">
                            <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="w-4 h-4 rounded text-blue-600" />
                            <span className="text-sm text-gray-700">{b}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t flex gap-3">
                    <button onClick={() => { setSelectedSubCats([]); setSelectedBrands([]); setShowMobileFilters(false); }} className="flex-1 py-2.5 border-2 border-gray-200 font-bold rounded-xl text-sm">Reset</button>
                    <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm">Apply</button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {products.length === 0 ? "No products in this category" : "No products match your filters"}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {products.length === 0
                      ? "Products added to this category will appear here."
                      : "Try removing some filters."}
                  </p>
                  {(selectedSubCats.length > 0 || selectedBrands.length > 0) && (
                    <button
                      onClick={() => { setSelectedSubCats([]); setSelectedBrands([]); }}
                      className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <a
                    key={product._id}
                    href={getProductUrl(product)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 hover:shadow-xl transition-all group flex flex-col"
                  >
                    <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-3">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          unoptimized={product.image?.startsWith("data:")}
                        />
                      ) : (
                        <Package size={40} className="text-gray-200" />
                      )}
                      {product.discount && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          {product.discount} OFF
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      {product.rating && (
                        <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-green-700 font-bold text-[9px]">
                          {product.rating} <Star size={9} fill="currentColor" />
                        </div>
                      )}
                      {product.reviews && (
                        <span className="text-[9px] text-gray-400">({product.reviews})</span>
                      )}
                    </div>

                    <h3 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors leading-tight flex-1">
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-[10px] text-gray-400 mb-3">{product.brand}</p>
                    )}

                    <div className="mt-auto">
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-gray-400 text-[10px] line-through">₹{product.mrp}</span>
                      )}
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-base font-black text-gray-900">₹{product.price}</span>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={(product.stock ?? 0) <= 0}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            (product.stock ?? 0) > 0
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {(product.stock ?? 0) > 0 ? "ADD" : "SOLD OUT"}
                        </button>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
