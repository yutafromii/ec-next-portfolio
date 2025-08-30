"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/app/stores/cartStore";
import { ProductsAPI } from "@/app/lib/api/products";
import type { Product } from "@/app/interfaces/Product";
import OrderItemCard from "./OrderItemCard";

export default function OrderItemList() {
  const { items } = useCartStore();
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(false);

  // カート内の一意な productId を抽出
  const ids = useMemo(
    () => [...new Set(items.map((i) => i.productId))],
    [items]
  );

  // 画像など不足分をまとめて補完
  useEffect(() => {
    let mounted = true;
    if (!ids.length) {
      setProductMap({});
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const products = await ProductsAPI.byIds(ids);
        if (!mounted) return;
        const map: Record<number, Product> = {};
        products.forEach((p) => (map[p.id] = p));
        setProductMap(map);
      } catch (e) {
        console.error("商品情報の取得に失敗しました", e);
        if (mounted) setProductMap({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ids]);

  if (!items.length) {
    return <div className="text-center py-20">カートが空です。</div>;
  }

  return (
    <div className="space-y-8">
      {loading && (
        <div className="text-sm text-gray-500">商品情報を読み込み中...</div>
      )}
      {items.map((item) => {
        const product = productMap[item.productId];
        const imageUrl =
          item.imageUrl || product?.imageUrls?.[0] || "/images/no-image.png";
        return <OrderItemCard key={item.id} item={item} imageUrl={imageUrl} />;
      })}
    </div>
  );
}
