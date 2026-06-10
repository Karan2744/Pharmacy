"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { slugify } from "@/lib/slugify";

export default function PopularItemsClient({ items }) {
  const router = useRouter();
  const { addToCart, isAuthenticated } = useCart();

  const handleAdd = (e, item) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/login"); return; }
    addToCart(item, 1);
  };

  const getUrl = (item) => item._id ? `/medicine/${slugify(item.name)}-${item._id}` : "#";

  const ratingColor = (r) => (r > 3.5 ? "#23bb75" : "#f4b619");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {items.map((item) => {
        const rating = item.rating ?? (3.5 + Math.random() * 1.5).toFixed(1);
        const reviews = item.reviews ?? Math.floor(10 + Math.random() * 200);
        return (
          <a
            key={item.id || item._id}
            href={getUrl(item)}
            className="flex flex-col rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "whitesmoke", boxShadow: "rgba(0,0,0,0.16) 0px 1px 4px" }}
          >
            {/* Image */}
            <div className="relative w-full bg-white" style={{ height: "clamp(130px, 22vw, 220px)" }}>
              <Image
                src={item.image || "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png"}
                alt={item.name}
                fill
                className="object-contain p-3 transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 20vw"
              />
              {(() => {
                const gst = item.adminGstPercent || 0;
                const mrpWithGst = item.mrp && gst > 0 ? item.mrp * (1 + gst / 100) : item.mrp;
                const disc = mrpWithGst && item.price ? Math.round(((mrpWithGst - item.price) / mrpWithGst) * 100) : 0;
                return disc > 0 && (
                  <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: "#0070B3" }}>
                    {disc}%
                  </div>
                );
              })()}
            </div>

            {/* Details */}
            <div className="p-2.5 flex flex-col flex-1">
              <p
                className="text-xs md:text-sm font-bold text-gray-500 leading-snug mb-1"
                style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
              >
                {item.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-base md:text-lg font-black text-gray-900">
                  ₹{(() => {
                    const gst = item.adminGstPercent || 0;
                    const priceWithGst = item.price && gst > 0 ? item.price * (1 + gst / 100) : item.price;
                    return priceWithGst.toFixed(2);
                  })()}
                </span>
                <span className="text-gray-400 text-xs">onwards</span>
              </div>

              {/* MRP */}
              {item.mrp && (
                <p className="text-[10px] text-gray-400 line-through">
                  MRP ₹{(() => {
                    const gst = item.adminGstPercent || 0;
                    const mrpWithGst = item.mrp && gst > 0 ? item.mrp * (1 + gst / 100) : item.mrp;
                    return mrpWithGst.toFixed(2);
                  })()}
                </p>
              )}

              {/* Free Delivery */}
              <div className="mt-1.5">
                <span className="text-[10px] font-semibold text-gray-500 border border-gray-300 rounded px-1.5 py-0.5">Free Delivery</span>
              </div>

              {/* Rating + Add */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: ratingColor(parseFloat(rating)) }}>
                    {parseFloat(rating).toFixed(1)} ★
                  </span>
                  <span className="text-[10px] text-gray-400">{reviews}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleAdd(e, item)}
                  className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg border-2 transition-colors"
                  style={{ borderColor: "#0070B3", color: "#0070B3" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#0070B3"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#0070B3"; }}
                >
                  ADD
                </button>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
