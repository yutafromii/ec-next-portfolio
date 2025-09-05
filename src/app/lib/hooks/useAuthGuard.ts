"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/app/stores/userStore";

/**
 * Redirects to /login if not authenticated.
 * Returns true when user is present; false otherwise.
 */
export function useAuthGuard(redirectWhenUnauthed?: string) {
  const { user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      if (redirectWhenUnauthed) {
        router.replace(redirectWhenUnauthed);
      } else {
        const redirect = encodeURIComponent(pathname || "/");
        router.replace(`/login?redirect=${redirect}`);
      }
    }
  }, [user, router, pathname, redirectWhenUnauthed]);

  return !!user;
}
