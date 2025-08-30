// app/confirm/page.tsx
"use client";

import OrderItemList from "@/components/confirm/OrderItemList";
import OrderSummary from "@/components/confirm/OrderSummary";
import OrderDetailsSection from "@/components/confirm/OrderDetailsSection";
import { useEnsureCart } from "@/app/lib/hooks/useEnsureCart";
import { useCartStore } from "@/app/stores/cartStore";
import StepIndicator from "@/components/ui/common/StepIndicator";

export default function CheckoutConfirmPage() {
  const { loading, error } = useEnsureCart();
  const { items } = useCartStore();

  const steps = ["カートの商品", "ご注文内容確認", "完了"];

  if (loading) {
    return <div className="bg-[#f6f6f6] min-h-screen px-4 py-12">読み込み中...</div>;
  }
  if (error) {
    return <div className="bg-[#f6f6f6] min-h-screen px-4 py-12 text-red-500">{error}</div>;
  }
  if (!items.length) {
    return <div className="bg-[#f6f6f6] min-h-screen px-4 py-12">カートが空です。</div>;
  }

  return (
    <div className="bg-[#f6f6f6] min-h-screen px-4 py-12">
      <h1 className="text-2xl font-semibold text-center mb-8">ショッピングカート</h1>
      <StepIndicator steps={steps} current={1} />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-10">
        <div className="md:col-span-2 space-y-8">
          <OrderItemList />
          <OrderDetailsSection />
        </div>
        <div className="md:col-span-1">
          <OrderSummary />
        </div>
      </section>
    </div>
  );
}
