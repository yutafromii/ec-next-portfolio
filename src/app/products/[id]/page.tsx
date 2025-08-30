// app/products/[id]/page.tsx （ファイルパスは現状に合わせて）
"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { ProductsAPI } from "@/app/lib/api/products";
import { CartAPI } from "@/app/lib/api/carts";
import type { Product } from "@/app/interfaces/Product";
import { useCartStore } from "@/app/stores/cartStore";
import { useUserStore } from "@/app/stores/userStore";

// 表示ユーティリティ（任意）
const yen = (n?: number) => (typeof n === "number" ? `${n.toLocaleString()}yen (Tax inc.)` : "");

export default function ProductDetailPage() {
  const params = useParams(); // { id: string }
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);

  // URLパラメータを数値に（無効値は NaN）
  const productId = useMemo(() => Number(params?.id), [params]);

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const { addItem } = useCartStore();

  // ===== 商品取得（共通化：ProductsAPI.byId） =====
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

        // 既存UIが期待するフォールバックをここで用意
        const fallbackProduct: Product & {
          image: string;
          subImages: string[];
          sizeChart: {
            columns: string[];
            rows: { label: string; values: (string | number)[] }[];
          };
        } = {
          ...data,
          image: data.imageUrls?.[0] ?? "/images/no-image.png",
          subImages: data.imageUrls?.slice(1) ?? [],
          sizeChart: {
            columns: ["Length", "Width"],
            rows: [
              { label: "S", values: [60, 45] },
              { label: "M", values: [65, 50] },
            ],
          },
        };

        setProduct(fallbackProduct);
        setError(null);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "商品情報の取得に失敗しました。");
        setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // ===== カート追加（共通化：CartAPI.add） =====
  const handleAddToCart = async () => {
    if (!product) return;

    // 未ログイン → pendingActionを保存してログインへ
    if (!user) {
      const pendingAction = {
        type: "addToCart" as const,
        timestamp: Date.now(),
        data: {
          productId: product.id,
          quantity,
        },
        redirectTo: "/cart",
        from: pathname,
      };
      localStorage.setItem("pendingAction", JSON.stringify(pendingAction));
      router.push(`/login?redirect=/cart`);
      return;
    }

    try {
      // サーバー側のカートに反映
      await CartAPI.add({ productId: product.id, quantity });

      // ローカルのZustandも更新（UI即時反映）
      addItem({
        id: Date.now(), // 仮ID（サーバが返すIDを使えるならそちらを）
        productId: product.id,
        productName: product.name, // interfaces/cart.ts に合わせて name を使うならここをnameに
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
        imageUrl: product.imageUrls?.[0],
      });

      router.push("/cart");
    } catch (e: unknown) {
      console.error("カート追加に失敗", e);
      alert(e instanceof Error ? e.message : "カートへの追加に失敗しました。");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error)   return <div className="p-6 text-red-500">{error}</div>;
  if (!product) return <div className="p-6 text-gray-500">商品が見つかりません。</div>;

  return (
    <>
      <div className="relative w-full h-screen">
        {/* 商品画像（フェードイン） */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src={product.imageUrls?.[0] ?? "/images/no-image.png"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* 左下：ID・カテゴリ・名前（カテゴリは仮） */}
        <div className="absolute bottom-6 left-6 bg-opacity-80 px-4 py-2 text-[#222] text-sm tracking-wide">
          <p className="font-medium text-lg">{product.name} / Jacket</p>
        </div>

        {/* 右下：縦書きDETAILS */}
        <div className="absolute bottom-6 right-6 flex flex-col items-center text-[#222] cursor-pointer">
          <span className="text-sm tracking-widest" style={{ writingMode: "vertical-rl" }}>
            DETAILS
          </span>
          <svg width="16" height="40" viewBox="0 0 16 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2">
            <line x1="8" y1="0" x2="8" y2="30" stroke="#222" strokeWidth="2" />
            <polyline points="4,26 8,30 12,26" fill="none" stroke="#222" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <section className="w-full px-6 py-20 bg-[#f8f8f8] text-[#222]">
        <h2 className="text-2xl font-semibold mb-12 ml-4 tracking-widest">{product.name}</h2>

        {/* 3カラム構成 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* 左：詳細・サイズ表 */}
          <div className="text-sm space-y-6">
            <p>{product.description}</p>
            <div>
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

          {/* 中央：素材・価格 */}
          <div className="space-y-4">
            <div>
              <p className="font-bold text-sm">FABRIC :</p>
              <p className="text-sm">{product.fabric}</p>
            </div>
            <div>
              <p className="font-bold text-sm">PRICE :</p>
              <p className="text-sm">{yen(product.price)}</p>
            </div>
          </div>

          {/* 右：数量とカートボタン */}
          <div className="space-y-4 lg:border-l lg:pl-10 border-[#d6d6d6]">
            <div>
              <label className="block text-sm mb-1">QTY</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-md bg-[#eaeaea]"
                min={1}
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full block text-center bg-[#000] text-white py-3 rounded-full tracking-widest mt-10"
            >
              カートに追加
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
