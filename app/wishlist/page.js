"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { slugify } from "@/lib/slugify";
import { useRouter } from "next/navigation";

const PRIMARY = "#e73096";
const PRIMARY_DARK = "#c4007a";

export default function WishlistPage() {
  const { addToCart, isAuthenticated } = useCart();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      setWishlist(JSON.parse(localStorage.getItem("pharmacy-wishlist") || "[]"));
    } catch { setWishlist([]); }
  }, []);

  const remove = (id) => {
    const updated = wishlist.filter((p) => (p._id || p.id) !== id);
    setWishlist(updated);
    localStorage.setItem("pharmacy-wishlist", JSON.stringify(updated));
  };

  const handleAdd = (item) => {
    if (!isAuthenticated) { router.push("/login"); return; }
    addToCart(item, 1);
  };

  const getUrl = (item) => item._id ? `/medicine/${slugify(item.name)}-${item._id}` : "#";

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f1f1f2" }}>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <h1 className="text-xl font-extrabold text-gray-900">My Wishlist</h1>
          <p className="text-xs text-gray-400 mt-0.5">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#fce4f3" }}>
              <Heart size={36} style={{ color: PRIMARY }} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Save medicines and health products you like.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
              style={{ backgroundColor: PRIMARY }}>
              Browse Products <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {wishlist.map((item) => (
              <div key={item._id || item.id} className="bg-white rounded-xl overflow-hidden flex flex-col"
                style={{ boxShadow: "rgba(0,0,0,0.12) 0px 1px 4px" }}>
                <Link href={getUrl(item)}>
                  <div className="relative w-full bg-gray-50" style={{ paddingBottom: "100%" }}>
                    <img
                      src={item.image || "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png"}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-contain p-2"
                    />
                  </div>
                </Link>
                <div className="p-2.5 flex flex-col flex-1">
                  <Link href={getUrl(item)}>
                    <p className="text-xs font-bold text-gray-700 leading-snug line-clamp-2 mb-1">{item.name}</p>
                  </Link>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-sm font-black text-gray-900">₹{item.price}</span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => handleAdd(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-white rounded-lg transition-colors"
                      style={{ backgroundColor: PRIMARY }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_DARK)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}>
                      <ShoppingCart size={11} /> Add
                    </button>
                    <button onClick={() => remove(item._id || item.id)}
                      className="p-1.5 rounded-lg border-2 border-gray-200 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
