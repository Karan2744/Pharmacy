"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authed = isAuthenticated();
    if (!authed && pathname !== "/admin/login") {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  // Show spinner while checking auth (except on the login page itself)
  if (!ready && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
