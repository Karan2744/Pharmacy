"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy redirect — new checkout flow starts at /checkout/address
export default function CheckoutRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/checkout/address"); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#e73096" }} />
    </div>
  );
}
