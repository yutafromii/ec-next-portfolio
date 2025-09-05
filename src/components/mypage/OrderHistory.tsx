// app/components/mypage/OrderHistory.tsx
"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/stores/userStore";
import { useMyOrders } from "@/app/lib/hooks/useMyOrders";
import StatusBadge from "@/components/ui/StatusBadge";

export default function OrderHistory() {
  const { user } = useUserStore();
  const router = useRouter();

  // 未ログインはログインへ
  useEffect(() => {
    if (!user) router.push("/login?redirect=/mypage");
  }, [user, router]);

  const { orders, productMap, loading, productsLoading, error } = useMyOrders(!!user);

  if (!user) return <p className="mt-6 text-base">ログイン情報を確認できません。</p>;
  if (loading) return <div className="p-6">読み込み中...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!orders || orders.length === 0) {
    return <div className="p-6 text-gray-600">注文履歴はありません。</div>;
  }

  return (
    <div className="space-y-12 mt-6 px-30">
      <h2 className="text-lg font-semibold mb-2">{user.name} さんの注文履歴</h2>

      {productsLoading && (
        <div className="text-sm text-muted-foreground">商品情報を読み込み中…</div>
      )}

      {orders.map((o) => (
        <div key={o.orderId} className="border-t border-b border-gray-200 py-6">
          {/* 注文情報 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-1">
            <div className="text-sm text-muted-foreground">
              注文日: {o.orderedAt ? new Date(o.orderedAt).toLocaleDateString() : "—"} / 注文番号: {o.orderNumber ?? o.orderId}
            </div>
            <div className="text-sm font-medium text-right sm:text-left">
              <StatusBadge value={o.status} />
            </div>
          </div>

          {/* 商品リスト */}
          <div className="space-y-4">
            {o.items.map((it) => {
              const p = productMap[it.productId];
              const imageUrl = p?.imageUrls?.[0] || "/images/no-image.jpg";
              const lineTotal = it.subtotal ?? it.price * it.quantity;
              return (
                <div key={it.id} className="flex flex-col sm:flex-row gap-4 sm:items-start">
                  <Image
                    src={imageUrl}
                    alt={it.productName ?? p?.name ?? "product"}
                    width={80}
                    height={80}
                    className="object-cover border w-20 h-20 bg-white"
                  />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{it.productName ?? p?.name ?? "商品名"}</p>
                    <p className="text-muted-foreground">
                      数量: {it.quantity} / ¥{it.price.toLocaleString()}
                    </p>
                    <p className="font-semibold">小計: ¥{lineTotal.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 合計 */}
          <div className="text-right text-sm font-semibold mt-4">
            合計: ¥{o.total.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
