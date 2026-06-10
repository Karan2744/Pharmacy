import Link from "next/link";
import { Globe, MessageCircle, Camera, Play, Pill } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    {
      title: "Contact Us",
      content: (
        <p className="text-sm text-gray-500 leading-relaxed">
          Maurya Pharmacy Pvt. Ltd.<br />
          Vasai Virar, Maharashtra — 401209<br />
          📞 09240250346<br />
          ✉️ support@mauryarx.com<br />
          © 2024 MauryaRx
        </p>
      ),
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Order Status", href: "/account" },
        { label: "Returns & Refunds", href: "#" },
        { label: "Payments", href: "#" },
        { label: "Community Guidelines", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookies Policy", href: "#" },
        { label: "Law Enforcement", href: "#" },
        { label: "IP Policy", href: "#" },
      ],
    },
    {
      title: "Shop Non-Stop on MauryaRx",
      content: (
        <div>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Trusted by more than 50 Lakh Indians<br />
            Cash on Delivery | Free Delivery
          </p>
          <div className="flex flex-col gap-2">
            <a href="#" className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors max-w-fit">
              <span className="text-lg">▶</span> Get it on Play Store
            </a>
            <a href="#" className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors max-w-fit">
              <span className="text-lg">🍎</span> Download on App Store
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
    <footer className="bg-gray-50 border-t border-gray-200 mt-8">

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
                      <Link href={link.href} className="text-gray-500 text-sm hover:text-[#e73096] transition-colors">
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e73096" }}>
              <Pill size={15} className="text-white" />
            </div>
            <span className="text-base font-black text-gray-900">
              Maurya<span style={{ color: "#e73096" }}>Rx</span>
            </span>
            <span className="text-gray-400 text-xs ml-2">© {new Date().getFullYear()} All rights reserved</span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-1">Reach out to us:</span>
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 transition-colors hover:text-white"
                style={{ backgroundColor: "#f0f0f0" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e73096"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="#" className="hover:text-gray-600">Privacy</Link>
            <Link href="#" className="hover:text-gray-600">Terms</Link>
            <Link href="#" className="hover:text-gray-600">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
