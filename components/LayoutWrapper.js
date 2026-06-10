"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CartProvider } from "./CartContext";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  const isAdminPath = pathname.startsWith("/admin");

  if (isAdminPath) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </CartProvider>
  );
}
