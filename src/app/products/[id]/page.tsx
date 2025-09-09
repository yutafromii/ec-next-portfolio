// app/products/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { ProductsAPI } from "@/app/lib/api/products";
import { CartAPI } from "@/app/lib/api/carts";
import type { Product } from "@/app/interfaces/Product";
import { useCartStore } from "@/app/stores/cartStore";
import { useUserStore } from "@/app/stores/userStore";

const LIMIT_PER_PERSON = 2;
const yen = (n?: number) =>
  typeof n === "number" ? `${n.toLocaleString()}yen (Tax inc.)` : "";

export default function ProductDetailPage() {
  const params = useParams(); // { id: string }
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  // URLパラメータ
  const productId = useMemo(() => Number(params?.id), [params]);

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カート（Zustand）
  const { items: cartItems, setItems, addItem } = useCartStore();
  const [currentQtyInCart, setCurrentQtyInCart] = useState(0);

  // 商品取得
  useEffect(() => {
    let mounted = true;
    if (!productId || Number.isNaN(productId)) {
      setError("商品IDが不正です。");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await ProductsAPI.byId(productId);
        if (!mounted) return;
        setProduct({
          ...data,
          imageUrls: data.imageUrls ?? [],
        });
        setError(null);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(
          e instanceof Error ? e.message : "商品情報の取得に失敗しました。"
        );
        setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // カートの“現在数量”を把握（ログイン時はサーバ、ゲストはローカル）
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user) {
          const cart = await CartAPI.me();
          if (!mounted) return;
          setItems(cart.items ?? []);
          const q =
            cart.items?.find((i) => i.productId === productId)?.quantity ?? 0;
          setCurrentQtyInCart(q);
        } else {
          const q =
            cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
          setCurrentQtyInCart(q);
        }
      } catch {
        // 失敗時は 0 として扱う
        setCurrentQtyInCart(0);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, productId]);

  // ローカルのカートが変わったら（ゲスト時など）追従
  useEffect(() => {
    const q = cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
    setCurrentQtyInCart(q);
  }, [cartItems, productId]);

  // 上限・残り購入可能数を算出
  const stock = product?.stock ?? 0;
  const maxAllowed = Math.min(LIMIT_PER_PERSON, stock);
  const remaining = Math.max(0, maxAllowed - currentQtyInCart);

  // 残りが減ったら quantity を丸める
  useEffect(() => {
    if (remaining > 0) {
      setQuantity((prev) => Math.min(prev, remaining) || 1);
    }
  }, [remaining]);

  // カート追加
  const handleAddToCart = async () => {
    if (!product) return;

    if (stock <= 0) {
      alert("在庫がありません。");
      return;
    }
    if (remaining <= 0) {
      // ここまで来ない（ボタン disabled）が二重防御
      alert("この商品はすでに上限（2点）までカートに入っています。");
      return;
    }
    if (quantity > remaining) {
      setQuantity(remaining);
      alert(`この商品はあと ${remaining} 点までです。`);
      return;
    }

    if (!user) {
      // ゲスト：ローカルに追加 → カートへ
      addItem({
        id: Date.now(), // 仮ID
        productId: product.id,
        name: product.name, // ★ cart/page.tsx は item.name を参照
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
        imageUrl: product.imageUrls?.[0],
      });
      router.push("/cart");
      return;
    }

    try {
      await CartAPI.add({ productId: product.id, quantity });
      // サーバ側が丸めても、このページでは追加操作は終了してカートへ
      router.push("/cart");
    } catch (e: unknown) {
      console.error("カート追加に失敗", e);
      alert(e instanceof Error ? e.message : "カートへの追加に失敗しました。");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!product)
    return <div className="p-6 text-gray-500">商品が見つかりません。</div>;

  const mainImg = product.imageUrls?.[0] ?? "/images/no-image.jpg";
  const addDisabled = stock <= 0 || remaining <= 0;

  return (
    <>
      <div className="relative w-full h-screen">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src={mainImg}
            alt={product.name}
            fill
            className="object-cover object-top"
            priority
          />
        </motion.div>

        <div className="absolute bottom-3 left-3 bg-opacity-80 px-4 py-2 text-[#222] text-sm tracking-wide">
          <p className="font-medium text-lg">{product.name} / Jacket</p>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col items-center text-[#222] cursor-pointer">
          <span
            className="text-sm tracking-widest"
            style={{ writingMode: "vertical-rl" }}
          >
            DETAILS
          </span>
          <svg
            width="16"
            height="40"
            viewBox="0 0 16 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mt-2"
          >
            <line x1="8" y1="0" x2="8" y2="30" stroke="#222" strokeWidth="2" />
            <polyline
              points="4,26 8,30 12,26"
              fill="none"
              stroke="#222"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <section className="w-full px-6 py-20 bg-[#f8f8f8] text-[#222]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* 左カラム */}
          <div className="text-sm space-y-6">
            <h2 className="text-2xl font-semibold mb-2 tracking-widest">
              {product.name}
            </h2>
            <p>{product.description}</p>

            <div className="mt-4">
              <p className="font-bold text-sm">SIZE CHART :</p>
              <p className="text-sm leading-relaxed">
                S: 着丈 60cm / 身幅 45cm
                <br />
                M: 着丈 65cm / 身幅 50cm
                <br />
                L: 着丈 70cm / 身幅 55cm
              </p>
            </div>
          </div>

          {/* 中央カラム */}
          <div className="space-y-4">
            <div>
              <p className="font-bold text-sm">COLOR :</p>
              <p className="text-sm">BLACK</p>
            </div>
            <div>
              <p className="font-bold text-sm">FABRIC :</p>
              <p className="text-sm">{product.fabric}</p>
            </div>
            <div>
              <p className="font-bold text-sm">PRICE :</p>
              <p className="text-sm">{yen(product.price)}</p>
            </div>
          </div>

          {/* 右カラム：数量とボタン */}
          <div className="space-y-4 lg:border-l lg:pl-10 border-[#d6d6d6]">
            <div>
              <label className="block text-sm mb-1">数量</label>

              {stock <= 0 ? (
                <div className="w-full px-4 py-3 rounded-md bg-[#eaeaea] text-gray-600 text-center">
                  在庫がありません
                </div>
              ) : remaining <= 0 ? (
                <div className="w-full px-4 py-3 rounded-md bg-[#eaeaea] text-gray-600 text-center">
                  この商品はすでにカート上限（2点）に達しています
                </div>
              ) : (
                <>
                  <select
                    className="w-full px-4 py-3 rounded-md bg-[#eaeaea]"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {Array.from({ length: remaining }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      )
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-600">
                    お一人様2点まで（カート内：{currentQtyInCart}点 ）
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full block text-center bg-black text-white py-3 rounded-full tracking-widest mt-10 
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:cursor-pointer hover:opacity-50 
                transition-opacity duration-300 ease-in-out"
              disabled={addDisabled}
            >
              {stock <= 0
                ? "在庫なし"
                : remaining <= 0
                ? "カート上限（2点）です"
                : "カートに追加"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
