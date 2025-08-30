"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/stores/userStore";

export default function MyPageGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login"); // ログインページへリダイレクト
    }
  }, [user]);

  if (!user) return null; // 認証前は何も表示しない

  return <>{children}</>;
}
