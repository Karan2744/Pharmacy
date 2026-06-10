"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Filter, ChevronDown, Star, X, Search } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { slugify } from "@/lib/slugify";

function MedicinesContent() {
  const searchParams = useSearchParams();
  const subQuery = searchParams.get("sub");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedSubCats, setSelectedSubCats] = useState(subQuery ? [subQuery] : []);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState("Popularity");
  const [toast, setToast] = useState("");
  const router = useRouter();
  const { addToCart, isAuthenticated } = useCart();

  const getProductUrl = (product) => {
    const slug = slugify(product.name);
    return `/medicine/${slug}-${product._id}`;
  };

  useEffect(() => {
    if (subQuery) {
      setSelectedSubCats([subQuery]);
    }
  }, [subQuery]);

  const subCategories = [
    { name: "Pain Relief", count: 380 },
    { name: "Vitamins & Supplements", count: 290 },
    { name: "Cold & Flu", count: 210 },
    { name: "Antibiotics", count: 150 },
    { name: "Diabetes Care", count: 180 },
    { name: "Heart & BP", count: 130 },
    { name: "Stomach Care", count: 165 },
    { name: "Skin Conditions", count: 95 },
  ];

  const brandOptions = ["Sun Pharma", "Cipla", "Dr. Reddy's", "Himalaya", "Dabur", "Zydus", "Lupin", "Abbott"];

  const filters = [
    { name: "Brand", options: brandOptions },
    { name: "Discount", options: ["10% and above", "20% and above", "30% and above", "50% and above"] },
    { name: "Price", options: ["Below ₹100", "₹100 - ₹500", "₹500 - ₹1000", "Above ₹1000"] },
    { name: "Rating", options: ["4★ & above", "3★ & above", "2★ & above"] },
  ];

  const mockProducts = [
    { _id: "m1", name: "Dolo 650 Paracetamol Tablet (15 tabs)", brand: "Micro Labs", price: 30, mrp: 35, discount: "14%", rating: 4.8, reviews: 5200, image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png", stock: 500, subCategory: "Pain Relief", category: "Medicines" },
    { _id: "m2", name: "Vitamin C 1000mg Tablet (60 tabs)", brand: "Himalaya", price: 299, mrp: 399, discount: "25%", rating: 4.6, reviews: 1800, image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png", stock: 200, subCategory: "Vitamins & Supplements", category: "Medicines" },
    { _id: "m3", name: "Allegra 120mg Tablet (10 tabs)", brand: "Sanofi", price: 198, mrp: 220, discount: "10%", rating: 4.5, reviews: 920, image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png", stock: 150, subCategory: "Cold & Flu", category: "Medicines" },
    { _id: "m4", name: "Omez 20mg Capsule (15 caps)", brand: "Dr. Reddy's", price: 85, mrp: 100, discount: "15%", rating: 4.7, reviews: 3100, image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png", stock: 300, subCategory: "Stomach Care", category: "Medicines" },
    { _id: "m5", name: "Metformin 500mg Tablet (20 tabs)", brand: "Sun Pharma", price: 45, mrp: 55, discount: "18%", rating: 4.4, reviews: 2200, image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png", stock: 400, subCategory: "Diabetes Care", category: "Medicines" },
    { _id: "m6", name: "Livogen Z Tablet (30 tabs)", brand: "Merck", price: 165, mrp: 190, discount: "13%", rating: 4.6, reviews: 1450, image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png", stock: 180, subCategory: "Vitamins & Supplements", category: "Medicines" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products?category=Medicines", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setProducts(data.data);
          setFilteredProducts(data.data);
        } else {
          setProducts(mockProducts);
          setFilteredProducts(mockProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (selectedSubCats.length > 0) {
      result = result.filter((p) => selectedSubCats.includes(p.subCategory));
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Discount") {
      result.sort((a, b) => parseInt(b.discount) - parseInt(a.discount));
    }

    setFilteredProducts(result);
  }, [selectedSubCats, selectedBrands, products, sortBy]);

  const toggleSubCat = (name) => {
    setSelectedSubCats((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleBrand = (name) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    addToCart(product, 1);
    setToast(`Added ${product.name} to cart`);
    window.setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <a href="/" className="hover:text-blue-600">Home</a>
        <ChevronRight size={12} />
        <a href="/categories" className="hover:text-blue-600">Categories</a>
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">Medicines</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-20">
        {toast && (
          <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800 shadow-sm">
            {toast}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
              </div>

              {/* Sub Categories */}
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wider">Sub Categories</h3>
                <div className="space-y-3">
                  {subCategories.map((sub) => (
                    <label key={sub.name} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSubCats.includes(sub.name)}
                          onChange={() => toggleSubCat(sub.name)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm transition-colors ${selectedSubCats.includes(sub.name) ? "text-blue-600 font-bold" : "text-gray-600 group-hover:text-blue-600"}`}>
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{sub.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Filters */}
              {filters.map((filter) => (
                <div key={filter.name} className="p-6 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-4 cursor-pointer">
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{filter.name}</h3>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {filter.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 group cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filter.name === "Brand" ? selectedBrands.includes(opt) : false}
                          onChange={() => filter.name === "Brand" && toggleBrand(opt)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm transition-colors ${filter.name === "Brand" && selectedBrands.includes(opt) ? "text-blue-600 font-bold" : "text-gray-600 group-hover:text-blue-600"}`}>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sub-categories horizontal scroll (Mobile) */}
            <div className="lg:hidden flex overflow-x-auto gap-3 pb-6 no-scrollbar -mx-4 px-4">
              {subCategories.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => toggleSubCat(sub.name)}
                  className={`shrink-0 px-4 py-2 border rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSubCats.includes(sub.name)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-700 active:bg-blue-50"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Medicines</h1>
                <p className="text-sm text-gray-500">
                  Showing 1 - {filteredProducts.length} of {products.length} products
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 active:bg-gray-50 transition-colors"
                >
                  <Filter size={18} /> Filters
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm">
                  <span className="text-gray-500">Sort by:</span>
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
            <div className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${showMobileFilters ? "opacity-100 visible" : "opacity-0 invisible"}`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)}></div>
              <div className={`absolute inset-y-0 right-0 w-[320px] bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${showMobileFilters ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
                  <div>
                    <h3 className="font-bold text-gray-800 text-xs mb-4 uppercase tracking-widest">Sub Categories</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {subCategories.map((sub) => (
                        <label key={sub.name} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedSubCats.includes(sub.name)}
                              onChange={() => toggleSubCat(sub.name)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-600">{sub.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">{sub.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {filters.map((filter) => (
                    <div key={filter.name}>
                      <h3 className="font-bold text-gray-800 text-xs mb-4 uppercase tracking-widest">{filter.name}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {filter.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filter.name === "Brand" ? selectedBrands.includes(opt) : false}
                              onChange={() => filter.name === "Brand" && toggleBrand(opt)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-600">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3">
                  <button
                    onClick={() => { setSelectedSubCats([]); setSelectedBrands([]); setShowMobileFilters(false); }}
                    className="flex-1 py-3 border-2 border-gray-100 font-bold rounded-xl"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-10">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-[300px] md:h-[350px]">
                    <div className="bg-gray-100 rounded-xl aspect-square mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters to find what you are looking for.</p>
                  <button
                    onClick={() => { setSelectedSubCats([]); setSelectedBrands([]); }}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <a
                    key={product._id}
                    href={getProductUrl(product)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 hover:shadow-xl transition-all group cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-square mb-3 md:mb-4 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2 md:p-4">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg">
                        {product.discount} OFF
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-1 md:mb-2">
                      <div className="flex items-center gap-0.5 bg-green-50 px-1 py-0.5 rounded text-green-700 font-bold text-[9px] md:text-[10px]">
                        {product.rating} <Star size={10} fill="currentColor" />
                      </div>
                      <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">({product.reviews})</span>
                    </div>

                    <h3 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors h-8 md:h-10 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-400 mb-3 md:mb-4">{product.brand}</p>

                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 text-[10px] md:text-xs line-through">₹{product.mrp}</span>
                        {(product.stock || 0) <= 0 && (
                          <span className="text-red-500 text-[10px] font-bold uppercase ml-auto">Out of Stock</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base md:text-lg font-black text-gray-900">₹{product.price}</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleAddToCart(product);
                          }}
                          disabled={(product.stock || 0) <= 0}
                          className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                            (product.stock || 0) > 0
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {(product.stock || 0) > 0 ? "ADD" : "SOLD OUT"}
                        </button>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="mt-8 md:mt-12 flex justify-center pb-10">
              <button className="w-full md:w-auto px-10 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all text-sm">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MedicinesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold">Loading Medicines...</p>
          </div>
        </div>
      }
    >
      <MedicinesContent />
    </Suspense>
  );
}
