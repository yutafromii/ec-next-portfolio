// /app/lib/hooks/useProfile.ts
"use client";

import { useEffect, useState } from "react";
import { UsersAPI, type UserMe, type UpdateUserRequest } from "@/app/lib/api/users";
import { useUserStore } from "@/app/stores/userStore";

export function useProfile() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);

  // 初回ロード（Zustandに無ければ取得）
  useEffect(() => {
    let mounted = true;
    if (user) { setLoading(false); return; }
    (async () => {
      try {
        const me = await UsersAPI.me();
        if (!mounted) return;
        setUser(me);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError("ユーザー情報の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user, setUser]);

  const update = async (input: UpdateUserRequest) => {
    const updated = await UsersAPI.update(input);
    setUser(updated);
    return updated;
  };

  return { user, loading, error, update };
}
