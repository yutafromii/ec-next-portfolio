// app/lib/hooks/useMyOrders.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { OrdersAPI } from "@/app/lib/api/orders";
import { ProductsAPI } from "@/app/lib/api/products";
import type { Product } from "@/app/interfaces/Product";
import { OrderResponse } from "@/app/interfaces/Orders";
import { ApiError } from "@/app/lib/api/client";


export function useMyOrders(enabled = true) {
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);

  // 1) 注文履歴（履歴APIがあれば一覧、無ければ最新1件）
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    (async () => {
      try {
        // まず履歴エンドポイントを試す
        let list: OrderResponse[] = [];
        try {
          const history = await OrdersAPI.history();
          list = Array.isArray(history) ? history : [];
        } catch (e) {
          // 未実装や403/404なら最新1件へフォールバック
          if (e instanceof ApiError && (e.status === 404 || e.status === 403 || e.status === 501)) {
            const single = await OrdersAPI.current();
            list = single ? [single as unknown as OrderResponse] : [];
          } else {
            throw e;
          }
        }
        if (!mounted) return;
        setOrders(list);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setOrders([]);
        setError("注文履歴の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [enabled]);

  // 2) 画像補完（productId をまとめて取得）
  const productIds = useMemo(() => {
    if (!orders?.length) return [] as number[];
    const s = new Set<number>();
    for (const o of orders) for (const it of o.items) s.add(it.productId);
    return [...s];
  }, [orders]);

  useEffect(() => {
    let mounted = true;
    if (!productIds.length) { setProductMap({}); return; }
    (async () => {
      setProductsLoading(true);
      try {
        const products = await ProductsAPI.byIds(productIds);
        if (!mounted) return;
        const map: Record<number, Product> = {};
        products.forEach((p) => (map[p.id] = p));
        setProductMap(map);
      } catch {
        if (!mounted) return;
        // 補完失敗しても致命的ではないので空で続行（no-imageフォールバック）
        setProductMap({});
      } finally {
        if (mounted) setProductsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productIds]);

  return { orders, productMap, loading, productsLoading, error };
}
