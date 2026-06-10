"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search, Star, ShoppingCart, PackageSearch } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { slugify } from "@/lib/slugify";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, isAuthenticated } = useCart();

  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const getProductUrl = (product) => {
    const slug = slugify(product.name);
    return `/medicine/${slug}-${product._id}`;
  };

  useEffect(() => {
    setInputValue(query);
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl animate-pulse">
          {toast}
        </div>
      )}

      {/* Search Bar Hero */}
      <div className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center border-2 border-[#e73096] rounded-full overflow-hidden bg-white h-[52px] focus-within:ring-4 focus-within:ring-pink-100 transition-all shadow-sm">
            <Search className="ml-4 text-gray-400 shrink-0" size={20} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search medicines, brands, categories…"
              className="flex-1 h-full px-4 outline-none text-sm font-medium bg-transparent"
            />
            <button
              onClick={handleSearch}
              className="bg-[#e73096] text-white px-8 h-full font-bold text-sm hover:bg-[#c4007a] transition-colors"
            >
              SEARCH
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-20">
        {/* Breadcrumb */}
        <div className="py-4 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-500">Search</span>
          {query && (
            <>
              <ChevronRight size={12} />
              <span className="text-gray-900 font-medium">"{query}"</span>
            </>
          )}
        </div>

        {/* Heading */}
        {query && (
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
              Search results for{" "}
              <span className="text-[#e73096]">"{query}"</span>
            </h1>
            {!loading && (
              <p className="text-sm text-gray-500">
                {products.length === 0
                  ? "No products found"
                  : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
              </p>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 animate-pulse h-[300px] md:h-[360px] border border-gray-100"
                >
                  <div className="bg-gray-100 rounded-xl aspect-square mb-4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-100 rounded-lg w-1/4"></div>
                  </div>
                </div>
              ))
            : !query
            ? (
              <div className="col-span-full py-24 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-[#e73096]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-500">Type a medicine name, brand, or category above to find products.</p>
              </div>
            )
            : products.length === 0
            ? (
              <div className="col-span-full py-24 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackageSearch size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results for "{query}"</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  We couldn't find any products matching your search. Try a different keyword.
                </p>
                <Link
                  href="/"
                  className="inline-block px-8 py-3 bg-[#e73096] text-white font-bold rounded-2xl hover:bg-[#c4007a] transition-colors shadow-lg shadow-pink-100"
                >
                  Browse All Products
                </Link>
              </div>
            )
            : products.map((product) => (
                <a
                  key={product._id}
                  href={getProductUrl(product)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 hover:shadow-xl transition-all group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square mb-3 md:mb-4 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2 md:p-4">
                    <Image
                      src={product.image || "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg">
                        {product.discount} OFF
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mb-1 md:mb-2">
                    {product.rating && (
                      <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-green-700 font-bold text-[9px] md:text-[10px]">
                        {product.rating} <Star size={10} fill="currentColor" />
                      </div>
                    )}
                    {product.reviews && (
                      <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">
                        ({product.reviews})
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-400 mb-3">
                    {product.brand}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-1">
                      {product.mrp && (
                        <span className="text-gray-400 text-[10px] md:text-xs line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                      {(product.stock || 0) <= 0 && (
                        <span className="text-red-500 text-[10px] font-bold uppercase ml-auto">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base md:text-lg font-black text-gray-900">
                        ₹{product.price}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={(product.stock || 0) <= 0}
                        className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold border-2 transition-all ${
                          (product.stock || 0) > 0
                            ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {(product.stock || 0) > 0 ? "ADD" : "SOLD OUT"}
                      </button>
                    </div>
                  </div>
                </a>
              ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#e73096] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold">Searching…</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
