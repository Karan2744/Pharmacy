"use client";

import Link from "next/link";
import { Globe, MessageCircle, Camera, Play, Plus, Phone, Mail, MapPin } from "lucide-react";

const M_BLUE = "#0070B3";

export default function Footer() {
  const footerLinks = [
    {
      title: "Contact Us",
      content: (
        <div className="space-y-2.5 text-sm text-gray-500">
          <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" style={{ color: M_BLUE }} /> Maurya Pharmacy Pvt. Ltd., Vasai Virar, Maharashtra — 401209</p>
          <p className="flex items-center gap-2"><Phone size={14} style={{ color: M_BLUE }} /> 09240250346</p>
          <p className="flex items-center gap-2"><Mail size={14} style={{ color: M_BLUE }} /> support@mauryarx.com</p>
          <p className="text-xs text-gray-400 mt-3">Mon–Sat · 9 AM – 9 PM</p>
        </div>
      ),
    },
    {
      title: "Support",
      links: [
        { label: "Help Center",        href: "#" },
        { label: "Order Status",       href: "/account" },
        { label: "Returns & Refunds",  href: "#" },
        { label: "Payments",           href: "#" },
        { label: "Prescription Upload", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy",    href: "#" },
        { label: "Terms of Service",  href: "#" },
        { label: "Cookies Policy",    href: "#" },
        { label: "Law Enforcement",   href: "#" },
        { label: "IP Policy",         href: "#" },
      ],
    },
    {
      title: "Get the App",
      content: (
        <div>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Order medicines in minutes.<br />
            Trusted by 50 Lakh+ Indians.
          </p>
          <div className="flex flex-col gap-2">
            <a href="#" className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors max-w-fit">
              <span className="text-base">▶</span> Get it on Play Store
            </a>
            <a href="#" className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors max-w-fit">
              <span className="text-base">🍎</span> Download on App Store
            </a>
          </div>
        </div>
      ),
    },
  ];

  const socialLinks = [
    { icon: Globe,         href: "#", label: "Facebook" },
    { icon: MessageCircle, href: "#", label: "Twitter" },
    { icon: Camera,        href: "#", label: "Instagram" },
    { icon: Play,          href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">

      {/* Trust bar */}
      <div style={{ backgroundColor: M_BLUE }} className="py-3">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-white text-xs font-medium">
            {[
              "🛡️ 100% Genuine Medicines",
              "🚚 Free Delivery above ₹500",
              "💊 10,000+ Products",
              "✅ Licensed Pharmacy",
            ].map((t) => (
              <span key={t} className="opacity-90">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-gray-800 text-sm mb-4">{section.title}</h3>
              {section.content ?? (
                <ul className="space-y-2.5">
                  {section.links?.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-500 text-sm transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.color = M_BLUE)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: M_BLUE }}>
              <Plus size={14} className="text-white" />
            </div>
            <span className="text-base font-black text-gray-900">
              Maurya<span style={{ color: M_BLUE }}>Rx</span>
            </span>
            <span className="text-gray-400 text-xs ml-2">© {new Date().getFullYear()} All rights reserved</span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-1">Follow us:</span>
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                style={{ backgroundColor: "#f0f0f0" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = M_BLUE; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; e.currentTarget.style.color = ""; }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="#" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
