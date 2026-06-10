"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

export default function ProductCarousel({ items }) {
  const ref = useRef(null);
  const router = useRouter();
  const { addToCart, isAuthenticated } = useCart();

  const scroll = (dir) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir * 280, behavior: "smooth" });
    }
  };

  const handleAdd = (e, item) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    addToCart(item, 1);
  };

  return (
    <div className="relative group/carousel">
      {/* Left Arrow */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-blue-50"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} className="text-gray-700" />
      </button>

      {/* Scroll Container */}
      <div
        ref={ref}
        className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-none w-[160px] md:w-[190px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
          >
            {/* Image */}
            <div className="relative w-full aspect-square bg-gray-50">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-3"
                sizes="200px"
              />
              {(() => {
                const gst = item.adminGstPercent || 0;
                const mrpWithGst = item.mrp && gst > 0 ? item.mrp * (1 + gst / 100) : item.mrp;
                const disc = mrpWithGst && item.price ? Math.round(((mrpWithGst - item.price) / mrpWithGst) * 100) : 0;
                return disc > 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                    {disc}%
                  </div>
                );
              })()}
            </div>

            {/* Details */}
            <div className="p-3 flex flex-col flex-1">
              <h3 className="text-[11px] font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight flex-1">
                {item.name}
              </h3>
              <div className="mt-auto">
                {(() => {
                  const gst = item.adminGstPercent || 0;
                  const mrpWithGst = item.mrp && gst > 0 ? item.mrp * (1 + gst / 100) : item.mrp;
                  const priceWithGst = item.price && gst > 0 ? item.price * (1 + gst / 100) : item.price;
                  const disc = mrpWithGst && priceWithGst ? Math.round(((mrpWithGst - priceWithGst) / mrpWithGst) * 100) : 0;
                  return (
                    <>
                      <span className="text-gray-400 text-[10px] line-through block">MRP ₹{mrpWithGst.toFixed(2)}</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-sm font-black text-gray-900">₹{priceWithGst.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={(e) => handleAdd(e, item)}
                          className="px-2.5 py-1 border-2 border-[#00a8e1] text-[#00a8e1] text-[10px] font-bold rounded-lg hover:bg-[#00a8e1] hover:text-white transition-colors"
                        >
                          ADD
                        </button>
                      </div>
                    </>
                  );
                })()}
                {item.subSave && (
                  <p className="mt-2 pt-2 border-t border-dashed border-gray-100 text-[9px] text-[#00a8e1] font-bold">
                    💊 Save {item.subSave} with Substitute
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-blue-50"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} className="text-gray-700" />
      </button>
    </div>
  );
}
