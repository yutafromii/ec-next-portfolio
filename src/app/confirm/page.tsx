// app/confirm/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import OrderItemList from "@/components/confirm/OrderItemList";
import OrderSummary from "@/components/confirm/OrderSummary";
import OrderDetailsSection from "@/components/confirm/OrderDetailsSection";
import { useEnsureCart } from "@/app/lib/hooks/useEnsureCart";
import { useCartStore } from "@/app/stores/cartStore";
import StepIndicator from "@/components/ui/common/StepIndicator";
import { useAuthGuard } from "@/app/lib/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function CheckoutConfirmPage() {
  const { loading, error } = useEnsureCart();
  const { items } = useCartStore();
  const authed = useAuthGuard();
  const router = useRouter();

  const steps = ["カートの商品", "ご注文内容確認", "完了"];

  // ★ ここでモーダルを親制御
  const [addrOpen, setAddrOpen] = useState(false);
  const [seconds, setSeconds] = useState(2);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // カート空の場合は演出表示→自動で商品一覧へ
  useEffect(() => {
    if (items.length > 0) return;
    try {
      router.prefetch("/products");
    } catch {}
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : s));
    }, 1000);
    timerRef.current = setTimeout(() => {
      router.replace("/products");
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length, router]);

  if (!authed) return null;
  if (loading) {
    return (
      <div className="bg-[#f6f6f6] min-h-screen px-4 py-12">読み込み中...</div>
    );
  }
  if (error) {
    return (
      <div className="bg-[#f6f6f6] min-h-screen px-4 py-12 text-red-500">
        {error}
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="bg-[#f6f6f6] min-h-screen flex flex-col justify-center items-center px-4 py-16 text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-[#222]">
          ご注文ありがとうございます
        </h1>
        <p className="text-gray-600 mb-6">
          ご注文を受け付けました。
          <br />
          ご登録のメールアドレスに確認メールをお送りしました。
        </p>
        <div className="space-y-2 text-sm text-gray-700 mb-10">
          <p>注文番号：</p>
          <p>注文日時：</p>
        </div>
        <p className="text-gray-500 mb-6">
          {seconds}秒後に商品一覧へ戻ります。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f6f6] min-h-screen px-6 py-12 mt-8">
      <h1 className="text-2xl font-semibold text-center mb-8">
        ショッピングカート
      </h1>
      <StepIndicator steps={steps} current={1} />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-10">
        <div className="md:col-span-2 space-y-8">
          <OrderItemList />
          <OrderDetailsSection open={addrOpen} onOpenChange={setAddrOpen} />
        </div>
        <div className="md:col-span-1 space-y-4">
          <OrderSummary onRequireShipping={() => setAddrOpen(true)} />

          {/* お買い物を続ける（/productsへ） */}
          <button
            type="button"
            aria-label="お買い物を続ける"
            className="w-full border border-[#d6d6d6] bg-white py-3 md:py-4 text-base md:text-lg font-bold
                 flex items-center justify-center gap-2
                 hover:bg-gray-50
                 transition-[opacity,background-color] duration-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
            onClick={() => router.push("/products")}
          >
            <span className="text-xl md:text-2xl">◀</span>
            <span>お買い物を続ける</span>
          </button>
        </div>
      </section>
    </div>
  );
}
