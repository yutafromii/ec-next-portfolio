// components/confirm/OrderSummary.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/cartStore";
import { OrdersAPI } from "@/app/lib/api/orders";
import { CartAPI } from "@/app/lib/api/carts";
import { useHasShipping } from "@/app/lib/hooks/useHasShipping";

export default function OrderSummary({
  onRequireShipping,
}: {
  onRequireShipping?: () => void;
}) {
  const { items: cartItems, clearCart } = useCartStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { needRegistration } = useHasShipping();

  // 次画面を事前フェッチして体感を速く
  useEffect(() => {
    try { router.prefetch("/complete"); } catch {}
  }, [router]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, it) => sum + (it.subtotal ?? it.price * it.quantity),
        0
      ),
    [cartItems]
  );
  const fee = 220;
  const shipping = 550;
  const total = subtotal + fee + shipping;

  const handleRegisterAddress = () => {
    // 可能ならモーダルを開く（フォールバックで従来遷移）
    if (onRequireShipping) {
      onRequireShipping();
      return;
    }
    try {
      sessionStorage.setItem("checkout.returnTo", "/confirm");
    } catch {}
    router.push("/mypage/addresses/new?from=checkout");
  };

  const handleToComplete = async () => {
    if (!cartItems.length || submitting) return;

    // 念のための二重防御：住所未登録はサーバで 400/500 になるため事前制御
    if (needRegistration) {
      alert("配送先住所が未登録です。先に住所を登録してください。");
      return;
    }

    setSubmitting(true);
    try {
      const payload = cartItems.map((it) => ({ productId: it.productId, quantity: it.quantity }));

      // 1) 注文確定（在庫検証含む）
      const order = await OrdersAPI.checkout(payload);

      // 2) UI 即時反映（先に反映して遷移を速く）
      clearCart();
      try {
        sessionStorage.setItem("checkout.completed", "1");
        // 完了画面用の表示データ（必要最小限）
        const orderNumber = order.orderNumber ?? order.orderId;
        const orderedAt = order.orderedAt;
        sessionStorage.setItem("checkout.last", JSON.stringify({ orderNumber, orderedAt }));
      } catch {}

      // 3) 完了へ即時遷移（サーバのカートクリアはバックグラウンド）
      router.replace("/complete");

      // 4) サーバ側のカートクリアは待たない（失敗しても無視）
      void CartAPI.clear().catch(() => {});
    } catch (e) {
      console.error("注文処理に失敗しました", e);
      alert("注文処理に失敗しました。再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartItems.length)
    return <div className="text-center py-20">カートが空です。</div>;

  return (
    <div className="bg-white p-6 shadow-md space-y-4">
      {/* 金額表示 */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>小計</span>
          <span className="text-pink-500">
            {subtotal.toLocaleString()} yen (Tax inc.)
          </span>
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
          <span className="text-pink-500">
            {total.toLocaleString()} yen (Tax inc.)
          </span>
        </div>
      </div>

      {/* アクション */}
      {needRegistration ? (
        <button
          className="w-full bg-gray-200 text-gray-800 py-3 font-semibold hover:bg-gray-300 transition"
          onClick={handleRegisterAddress}
        >
          住所を登録して続行
        </button>
      ) : (
        <button
          className="w-full bg-black text-white py-3 font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleToComplete}
          disabled={submitting}
        >
          {submitting ? "送信中..." : "注文する"}
        </button>
      )}
    </div>
  );
}
