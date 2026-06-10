"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSearch({ phone }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-lg h-[52px] border-2 border-white focus-within:border-blue-200 transition-all">
        <Search className="ml-4 text-gray-400 shrink-0" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search medicines, brands, health products…"
          className="flex-1 h-full px-3 outline-none text-sm font-medium text-gray-800"
        />
        <button
          onClick={handleSearch}
          className="bg-[#00a8e1] text-white px-6 h-full font-bold text-sm hover:bg-[#008ec4] transition-colors"
        >
          SEARCH
        </button>
      </div>
      <p className="mt-3 text-xs text-blue-100">
        Or call us:{" "}
        <a href={`tel:${phone}`} className="font-black text-white hover:underline">
          {phone}
        </a>
      </p>
    </div>
  );
}
