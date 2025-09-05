"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setUnauthorizedHandler, clearAuthToken } from "@/app/lib/api/client";
import { useUserStore } from "@/app/stores/userStore";

export default function AuthBoundary() {
  const router = useRouter();
  const pathname = usePathname();
  const clearedRef = useRef(false);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    // Install global 401/403 handler
    setUnauthorizedHandler((_status) => {
      if (clearedRef.current) return; // prevent multiple redirects
      clearedRef.current = true;
      try {
        // Clear client auth states
        clearAuthToken();
        clearUser();
        // purge ephemeral checkout shipping selection if any
        try { localStorage.removeItem("checkout.shipping"); } catch {}
      } finally {
        const redirect = encodeURIComponent(pathname || "/");
        router.replace(`/login?redirect=${redirect}`);
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [router, pathname, clearUser]);

  return null;
}
