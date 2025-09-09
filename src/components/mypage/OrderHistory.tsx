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

  const { orders, productMap, loading, productsLoading, error } = useMyOrders(
    !!user
  );

  if (!user)
    return <p className="mt-6 text-base">ログイン情報を確認できません。</p>;
  if (loading) return <div className="p-6">読み込み中...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!orders || orders.length === 0) {
    return <div className="p-6 text-gray-600">注文履歴はありません。</div>;
  }

  return (
    <div className="mt-6 space-y-10 px-4 sm:px-6 md:px-10">
      <h2 className="text-base sm:text-lg font-semibold mb-2">
        {user.name} さんの注文履歴
      </h2>

      {productsLoading && (
        <div className="text-xs sm:text-sm text-muted-foreground">
          商品情報を読み込み中…
        </div>
      )}

      {orders.map((o) => (
        <div
          key={o.orderId}
          className="border-y border-gray-200 py-6 space-y-4"
        >
          {/* 注文情報行（モバイル1列、sm以上2列） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 items-start">
            <div className="text-xs sm:text-sm text-muted-foreground">
              <span className="whitespace-nowrap">
                注文日:{" "}
                {o.orderedAt ? new Date(o.orderedAt).toLocaleDateString() : "—"}
              </span>
              <span className="mx-2 hidden sm:inline">/</span>
              <span className="block sm:inline">
                注文番号: {o.orderNumber ?? o.orderId}
              </span>
            </div>
            <div className="sm:justify-self-end">
              <StatusBadge value={o.status} />
            </div>
          </div>

          {/* 商品リスト */}
          <div className="space-y-5">
            {o.items.map((it) => {
              const p = productMap[it.productId];
              const imageUrl = p?.imageUrls?.[0] || "/images/no-image.jpg";
              const lineTotal = it.subtotal ?? it.price * it.quantity;

              return (
                <div
                  key={it.id}
                  className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
                >
                  <div className="shrink-0">
                    <Image
                      src={imageUrl}
                      alt={it.productName ?? p?.name ?? "product"}
                      width={88}
                      height={88}
                      sizes="(min-width: 640px) 88px, 72px"
                      className="object-cover border bg-white w-[72px] h-[72px] sm:w-22 sm:h-22"
                    />
                  </div>

                  <div className="min-w-0 text-sm">
                    <p
                      className="font-medium truncate"
                      title={it.productName ?? p?.name}
                    >
                      {it.productName ?? p?.name ?? "商品名"}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      数量: {it.quantity} / ¥{it.price.toLocaleString()}
                    </p>
                    <p className="font-semibold">
                      小計: ¥{lineTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 合計 */}
          <div className="text-right text-sm font-semibold pt-2">
            合計: ¥{o.total.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
