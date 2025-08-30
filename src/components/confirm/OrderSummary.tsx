// components/confirm/OrderSummary.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/cartStore";
import { OrdersAPI } from "@/app/lib/api/orders";
import { CartAPI } from "@/app/lib/api/carts"; // ★追加

export default function OrderSummary() {
  const { items: cartItems, clearCart } = useCartStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.subtotal ?? item.price * item.quantity), 0),
    [cartItems]
  );
  const fee = 220;
  const shipping = 550;
  const total = subtotal + fee + shipping;

  const handleToComplete = async () => {
    if (!cartItems.length || submitting) return;
    setSubmitting(true);
    try {
      const payload = cartItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      }));

      // 1) 注文作成
      const order = await OrdersAPI.create(payload);

      // 2) サーバ側のカートも明示クリア（バックエンドがやっていても二重で問題なし）
      try {
        await CartAPI.clear();
      } catch {
        // サーバ側クリアに失敗してもUIは空にする（後で再同期すればOK）
      }

      // 3) UI即時反映
      clearCart();

      // 4) 完了へ遷移（必要なら注文番号をクエリで渡す）
      // router.push(`/complete?orderId=${order.orderId}`);
      router.push("/complete");
    } catch (e) {
      console.error("注文処理に失敗しました", e);
      alert("注文処理に失敗しました。再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartItems.length) return <div className="text-center py-20">カートが空です。</div>;

  return (
    <div className="bg-white p-6 shadow-md space-y-4">
      <div className="space-y-2 text-sm text-base">
        <div className="flex justify-between">
          <span>小計</span>
          <span className="text-pink-500">{subtotal.toLocaleString()} yen (Tax inc.)</span>
        </div>
        <div className="flex justify-between">
          <span>手数料</span>
          <span>{fee.toLocaleString()} yen (Tax inc.)</span>
        </div>
        <div className="flex justify-between">
          <span>送料</span>
          <span>{shipping.toLocaleString()} yen (Tax inc.)</span>
        </div>
        <hr className="my-2 border-dotted" />
        <div className="flex justify-between font-bold text-lg">
          <span>合計</span>
          <span className="text-pink-500">{total.toLocaleString()} yen (Tax inc.)</span>
        </div>
      </div>

      <button
        className="w-full bg-black text-white py-3 font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleToComplete}
        disabled={submitting}
      >
        {submitting ? "送信中..." : "注文する"}
      </button>
    </div>
  );
}
