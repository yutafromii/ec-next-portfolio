// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useCartStore } from "@/app/stores/cartStore";
import { useUserStore } from "@/app/stores/userStore";
import type { Product } from "@/app/interfaces/Product";
import { CartAPI } from "@/app/lib/api/carts";
import { ProductsAPI } from "@/app/lib/api/products";
import StepIndicator from "@/components/ui/common/StepIndicator";

export default function CartPage() {
  const { items: cartItems, setItems, updateQuantity, removeItem } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});

  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  // 初期取得：サーバのカート → ストア → 商品情報
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cart = await CartAPI.me();
        if (!mounted) return;

        const items = cart?.items ?? [];
        setItems(items); // store 側で name/subtotal を正規化

        const ids = [...new Set(items.map((i) => i.productId))];
        const products = await ProductsAPI.byIds(ids);

        if (!mounted) return;
        const map: Record<number, Product> = {};
        products.forEach((p) => (map[p.id] = p));
        setProductMap(map);
      } catch (e) {
        console.error("カート取得失敗", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [setItems]);

  // 数量変更（サーバ更新→ストア更新）
  const handleQuantityChange = async (productId: number, delta: number) => {
    const item = cartItems.find((it) => it.productId === productId);
    if (!item) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const newQuantity = Math.max(1, item.quantity + delta);
    try {
      await CartAPI.add({ productId, quantity: newQuantity }); // 追加/更新兼用
      updateQuantity(productId, newQuantity);                   // storeはproductIdで更新
    } catch (e) {
      console.error("数量の更新に失敗しました", e);
    }
  };

  // 削除（サーバ削除→ストア削除）
  const handleRemoveItem = async (cartItemId: number) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    try {
      await CartAPI.deleteItem(cartItemId);
      removeItem(cartItemId);
    } catch (e) {
      console.error("商品の削除に失敗しました", e);
    }
  };

  const totalPrice = cartItems.reduce((sum, it) => sum + (it.subtotal ?? it.price * it.quantity), 0);

  if (loading) return <div className="text-center py-20">読み込み中...</div>;
  if (!cartItems.length) return <div className="text-center py-20">カートに商品が入っていません。</div>;

  const handleToConfirm = () => router.push("/confirm");
  const handleToBack = () => router.push("/products");

  const steps = ["カート", "ご注文内容確認", "完了"]; // カート=0, 確認=1, 完了=2

  return (
    <div className="px-6 py-12 mx-auto text-[#222] bg-[#f8f8f8]">
      <h1 className="text-2xl font-semibold text-center mb-8">ショッピングカート</h1>

      {/* 共通ステップインジケータ */}
      <StepIndicator steps={steps} current={0} />

      {/* 合計金額 */}
      <div className="text-center my-8 text-base text-[#222]">
        商品の合計金額は{" "}
        <span className="font-bold text-lg">{totalPrice.toLocaleString()}yen (Tax inc.)</span>{" "}
        です。
      </div>

      <section className="bg-[#f6f6f6] px-4 py-12">
        <div className="hidden md:grid grid-cols-4 text-center font-bold text-[#222] border-y border-[#222] py-4">
          <div className="col-span-2">商品内容</div>
          <div>数量</div>
          <div>小計</div>
        </div>

        {cartItems.map((item) => {
          const product = productMap[item.productId];
          return (
            <div
              key={item.id}
              className="grid md:grid-cols-4 grid-cols-1 border-b border-dotted border-[#d6d6d6] py-6 gap-4"
            >
              {/* 商品詳細 */}
              <div className="md:col-span-2 flex items-start gap-4">
                {product ? (
                  <img
                    src={product.imageUrls?.[0] || "/images/no-image.png"}
                    alt={product.name}
                    className="w-32 md:w-36 h-auto object-contain"
                  />
                ) : (
                  <div className="w-32 md:w-36 bg-gray-100">画像なし</div>
                )}

                <div className="text-sm text-[#222] space-y-1">
                  <p className="font-bold text-md text-[#44444f]">{item.name}</p>
                  <p className="font-bold">{item.price.toLocaleString()}yen (Tax inc.)</p>
                </div>
              </div>

              {/* 数量変更 */}
              <div className="flex md:flex-col flex-row justify-between md:items-center items-start gap-4">
                <div className="flex border border-[#d6d6d6] rounded-sm overflow-hidden text-[#222] text-lg">
                  <button
                    onClick={() => handleQuantityChange(item.productId, -1)}
                    className="w-10 h-10 bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center"
                  >
                    −
                  </button>
                  <div className="w-10 h-10 bg-white flex items-center justify-center font-bold">
                    {item.quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(item.productId, 1)}
                    className="w-10 h-10 bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items中心 justify-center"
                  >
                    ＋
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="px-4 py-2 border border-[#222] text-sm hover:cursor-pointer"
                >
                  削除
                </button>
              </div>

              {/* 小計 */}
              <div className="text-center font-bold text-[#222] md:block hidden">
                {item.subtotal.toLocaleString()}yen (Tax inc.)
              </div>
              <div className="text-right font-bold text-[#222] md:hidden block">
                小計：{item.subtotal.toLocaleString()}yen (Tax inc.)
              </div>
            </div>
          );
        })}

        {/* 合計表示 */}
        <div className="flex justify-end mt-10 mb-4 pr-2 text-[#222] text-base">
          <span className="font-semibold mr-2">合計：</span>
          <span className="font-bold text-[#e85f8f] text-lg">
            {totalPrice.toLocaleString()}yen (Tax inc.)
          </span>
        </div>

        {/* アクション */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            className="border border-[#222] py-4 text-lg font-bold flex items-center justify-center gap-2"
            onClick={handleToBack}
          >
            <span className="text-2xl">◀</span> お買い物を続ける
          </button>
          <button
            className="bg-[#000] text-white py-4 text-lg font-bold flex items-center justify-center gap-2"
            onClick={handleToConfirm}
          >
            レジに進む <span className="text-2xl">▶</span>
          </button>
        </div>
      </section>
    </div>
  );
}
