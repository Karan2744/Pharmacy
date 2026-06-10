import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Truck, CheckCircle } from "lucide-react";

const categories = [
  {
    title: "Medicines",
    description: "Prescription & OTC medicines at lowest prices",
    href: "/categories/medicines",
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698138109947_1.png",
    bgColor: "bg-blue-50",
    textColor: "text-[#e73096]",
    subItems: ["Pain Relief", "Cold & Cough", "Antibiotics", "Heart Care"],
    badge: "Upto 51% off",
    badgeColor: "bg-blue-100 text-[#e73096]",
  },
  {
    title: "Personal Care",
    description: "Skin, hair, oral and daily care essentials",
    href: "/categories/personal-care-1",
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698138109947_1.png",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    subItems: ["Skin Care", "Hair Care", "Oral Care", "Baby Care"],
    badge: "Upto 30% off",
    badgeColor: "bg-pink-100 text-pink-600",
  },
  {
    title: "Health Conditions",
    description: "Targeted products for your health needs",
    href: "/categories/health-conditions",
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698138117087_2.png",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    subItems: ["Diabetes", "Blood Pressure", "Thyroid", "Joint Care"],
    badge: "Doctor verified",
    badgeColor: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Vitamins & Supplements",
    description: "Boost immunity and overall wellness",
    href: "/categories/vitamins-supplements-5",
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698138141109_5.png",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    subItems: ["Multivitamins", "Vitamin D", "Omega-3", "Protein"],
    badge: "Best sellers",
    badgeColor: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Diabetes Care",
    description: "Monitors, strips, and diabetic essentials",
    href: "/categories/diabetes-care-3",
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698138124558_3.png",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    subItems: ["Glucometers", "Test Strips", "Lancets", "Insulin"],
    badge: "Save more",
    badgeColor: "bg-orange-100 text-orange-600",
  },
  {
    title: "Healthcare Devices",
    description: "BP monitors, nebulizers, and more",
    href: "/categories/healthcare-devices-4",
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698138134247_4.png",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    subItems: ["BP Monitors", "Nebulizers", "Thermometers", "Oximeters"],
    badge: "Top brands",
    badgeColor: "bg-purple-100 text-purple-600",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#e73096] transition-colors font-medium">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-semibold">All Categories</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Shop by Categories</h1>
          <p className="text-sm text-gray-500">Choose a category to explore products at the best prices</p>
        </div>

        {/* Trust strip */}
        <div className="bg-[#e8f6fc] rounded-2xl px-5 py-3 mb-8 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: <ShieldCheck size={15} className="text-[#e73096]" />, text: "FDA/GMP Certified" },
            { icon: <CheckCircle size={15} className="text-[#e73096]" />, text: "100% Genuine Medicines" },
            { icon: <Truck size={15} className="text-[#e73096]" />, text: "Free delivery above ₹500" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              {b.icon} {b.text}
            </div>
          ))}
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
            >
              {/* Image + badge */}
              <div className={`relative h-44 ${cat.bgColor} flex items-center justify-center p-6`}>
                <div className="relative w-32 h-32 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-contain"
                    sizes="200px"
                  />
                </div>
                <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full ${cat.badgeColor}`}>
                  {cat.badge}
                </span>
              </div>

              {/* Details */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-extrabold text-gray-900 text-base group-hover:text-[#e73096] transition-colors">
                    {cat.title}
                  </h2>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#e73096] transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mb-4">{cat.description}</p>

                {/* Sub-category chips */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {cat.subItems.map((sub) => (
                    <span key={sub} className="text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular searches */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-extrabold text-gray-900 mb-4 uppercase tracking-wide">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Dolo 650", "Vitamin D3", "Paracetamol", "Metformin", "Atorvastatin",
              "Pantoprazole", "Cetirizine", "Azithromycin", "Amoxicillin", "Omeprazole",
              "Multivitamin", "BP Monitor", "Glucometer", "Sunscreen SPF 50", "Hand Sanitizer",
            ].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-[#e8f6fc] hover:border-[#e73096] hover:text-[#e73096] transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
