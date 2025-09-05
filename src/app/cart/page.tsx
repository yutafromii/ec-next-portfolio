// /app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/app/stores/cartStore";
import { useUserStore } from "@/app/stores/userStore";
import type { Product } from "@/app/interfaces/Product";
import { CartAPI } from "@/app/lib/api/carts";
import { ProductsAPI } from "@/app/lib/api/products";
import StepIndicator from "@/components/ui/common/StepIndicator";

const LIMIT_PER_PERSON = 2;

export default function CartPage() {
  const { items: cartItems, setItems, updateQuantity, removeItem } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});

  const user = useUserStore((s) => s.user);
  const router = useRouter();
  const steps = ["カート", "ご注文内容確認", "完了"];

  // 初期ロード：サーバのカートを取得 → ストアへ反映 → 商品情報取得
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user) {
          const cart = await CartAPI.me();
          if (!mounted) return;
          const items = cart?.items ?? [];
          setItems(items);

          const ids = [...new Set(items.map((i) => i.productId))];
          if (ids.length) {
            const products = await ProductsAPI.byIds(ids);
            if (!mounted) return;
            const map: Record<number, Product> = {};
            products.forEach((p) => (map[p.id] = p));
            setProductMap(map);
          }
        } else {
          // ゲスト：ストア内 ID から必要な商品だけ補完
          const ids = [...new Set(cartItems.map((i) => i.productId))];
          if (ids.length) {
            const products = await ProductsAPI.byIds(ids);
            if (!mounted) return;
            const map: Record<number, Product> = {};
            products.forEach((p) => (map[p.id] = p));
            setProductMap(map);
          }
        }
      } catch (e) {
        console.error("カート取得失敗", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setItems, user]);

  // 数量変更（サーバで“セット”→返り値でストア同期）
  const handleQuantityChange = async (cartItemId: number, productId: number, delta: number) => {
    const item = cartItems.find((it) => it.id === cartItemId);
    if (!item) return;

    const product = productMap[productId];
    const stock = typeof product?.stock === "number" ? product.stock : LIMIT_PER_PERSON;
    const maxAllowed = Math.min(LIMIT_PER_PERSON, stock);

    const desired = Math.max(1, item.quantity + delta); // 0は削除ボタンで対応
    const nextQty = Math.min(desired, maxAllowed);

    if (nextQty === item.quantity) {
      if (desired > nextQty) alert("お一人様2点までです");
      return;
    }

    try {
      if (user) {
        const res = await CartAPI.update({ cartItemId, quantity: nextQty });
        setItems(res.items); // サーバの丸めを必ず反映
      } else {
        // ゲスト：ローカルのみ更新
        updateQuantity(productId, nextQty);
      }
    } catch (e) {
      console.error("数量の更新に失敗しました", e);
    }
  };

  // 行削除
  const handleRemoveItem = async (cartItemId: number) => {
    try {
      if (user) {
        await CartAPI.deleteItem(cartItemId);
        // サーバは void なので、フロント側で削除して整合
      }
      removeItem(cartItemId);
    } catch (e) {
      console.error("商品の削除に失敗しました", e);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, it) => sum + (it.subtotal ?? it.price * it.quantity),
    0
  );

  if (loading) return <div className="text-center py-20">読み込み中...</div>;

  if (!cartItems.length)
    return (
      <div className="px-6 py-12 mx-auto text-[#222] bg-[#f8f8f8] mt-8">
        <h1 className="text-2xl font-semibold text-center mb-8">ショッピングカート</h1>
        <StepIndicator steps={steps} current={0} />

        <section className="bg-[#f6f6f6] px-4 py-12 mt-6">
          <div className="hidden md:grid grid-cols-4 text-center font-bold text-[#222] border-y border-[#222] py-4">
            <div className="col-span-2">商品内容</div>
            <div>数量</div>
            <div>小計</div>
          </div>
          <div className="border-b border-dotted border-[#d6d6d6] py-20 text-center text-gray-600">
            カートに商品が入っていません。
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/products" className="inline-flex">
              <button className="bg-black text-white px-6 py-3 font-semibold hover:opacity-50 hover:cursor-pointer">
                商品一覧へ
              </button>
            </Link>
          </div>
        </section>
      </div>
    );

  const handleToConfirm = () => {
    if (!user) {
      // ゲストカート同期用のペンディング保存
      const payload = cartItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      }));
      try {
        localStorage.setItem("pendingCart", JSON.stringify(payload));
      } catch {}
    }
    router.push(user ? "/confirm" : `/login?redirect=${encodeURIComponent("/confirm")}`);
  };
  const handleToBack = () => router.push("/products");

  return (
    <div className="px-6 py-12 mt-8 mx-auto text-[#222] bg-[#f8f8f8]">
      <h1 className="text-2xl font-semibold text-center mb-8">ショッピングカート</h1>
      <StepIndicator steps={steps} current={0} />

      <div className="text-center my-8 text-base text-[#222]">
        商品の合計金額は{" "}
        <span className="font-bold text-lg">
          {totalPrice.toLocaleString()}yen (Tax inc.)
        </span>{" "}
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
          const stock = typeof product?.stock === "number" ? product.stock : LIMIT_PER_PERSON;
          const maxAllowed = Math.min(LIMIT_PER_PERSON, stock);

          return (
            <div
              key={item.id}
              className="grid md:grid-cols-4 grid-cols-1 border-b border-dotted border-[#d6d6d6] py-6 gap-4"
            >
              {/* 商品詳細 */}
              <div className="md:col-span-2 flex items-start gap-4">
                {product ? (
                  <img
                    src={product.imageUrls?.[0] || "/images/no-image.jpg"}
                    alt={product.name}
                    className="w-32 md:w-36 h-auto object-contain"
                  />
                ) : (
                  <div className="w-32 md:w-36 bg-gray-100">画像なし</div>
                )}
                <div className="text-sm text-[#222] space-y-1">
                  <p className="font-bold text-md text-[#44444f]">{item.name}</p>
                  <p className="font-bold">
                    {item.price.toLocaleString()}yen (Tax inc.)
                  </p>
                </div>
              </div>

              {/* 数量変更 */}
              <div className="flex md:flex-col flex-row justify-between md:items-center items-start gap-4">
                <div className="flex border border-[#d6d6d6] rounded-sm overflow-hidden text-[#222] text-lg">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.productId, -1)}
                    className="w-10 h-10 bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center"
                  >
                    −
                  </button>
                  <div className="w-10 h-10 bg-white flex items-center justify-center font-bold">
                    {item.quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.productId, +1)}
                    className="w-10 h-10 bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={item.quantity >= maxAllowed}
                  >
                    ＋
                  </button>
                </div>
                <div className="text-xs text-gray-600">お一人様2点まで</div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="px-4 py-2 border border-[#222] text-sm hover:cursor-pointer"
                >
                  削除
                </button>
              </div>

              {/* 小計 */}
              <div className="text-center font-bold text-[#222] md:block hidden">
                {(item.subtotal ?? item.price * item.quantity).toLocaleString()}yen (Tax inc.)
              </div>
              <div className="text-right font-bold text-[#222] md:hidden block">
                小計：{(item.subtotal ?? item.price * item.quantity).toLocaleString()}yen (Tax inc.)
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
            className="border border-[#222] py-4 text-lg font-bold flex items-center justify-center gap-2 hover:opacity-50 transition-opacity duration-300 ease-in-out hover:cursor-pointer"
            onClick={() => router.push("/products")}
          >
            <span className="text-2xl">◀</span> お買い物を続ける
          </button>
          <button
            className="bg-[#000] text-white py-4 text-lg font-bold flex items-center justify-center gap-2 hover:opacity-50 transition-opacity duration-300 ease-in-out hover:cursor-pointer"
            onClick={handleToConfirm}
          >
            レジに進む <span className="text-2xl">▶</span>
          </button>
        </div>
      </section>
    </div>
  );
}
