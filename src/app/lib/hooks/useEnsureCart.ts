"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/app/stores/cartStore";
import { CartAPI } from "@/app/lib/api/carts";

/**
 * 画面入場時にサーバのカートを store に同期するだけの薄いフック
 * - 既に store に入っていれば何もしない（無駄な通信を避ける）
 */
export function useEnsureCart() {
  const { items, setItems } = useCartStore();
  const [loading, setLoading] = useState(items.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (items.length > 0) { setLoading(false); return; }

    (async () => {
      try {
        const cart = await CartAPI.me();
        if (!mounted) return;
        setItems(cart?.items ?? []); // store 側で name/subtotal を正規化
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "カートの取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [items.length, setItems]);

  return { loading, error };
}
