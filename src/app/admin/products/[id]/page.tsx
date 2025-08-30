"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
// import { products } from "@/lib/products";
import Link from "next/link";
import { useFetchData } from "@/app/lib/hooks/useFetchData";
import { useEffect, useState } from "react";
import { Product } from "@/app/interfaces/Product";
import { useCartStore } from "@/app/stores/cartStore";
import { CartAPI } from "@/app/lib/api/carts";
import { useUserStore } from "@/app/stores/userStore";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, error, loading } = useFetchData<Product>(
    `http://localhost:8080/products/${id}`
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const user = useUserStore((state) => state.user);
  const pathname = usePathname();
  useEffect(() => {
    if (data) {
      const fallbackProduct: Product & {
        image: string;
        subImages: string[];
        sizeChart: {
          columns: string[];
          rows: { label: string; values: (string | number)[] }[];
        };
      } = {
        ...data,
        image: data.imageUrls[0] ?? "/fallback.jpg",
        subImages: data.imageUrls.slice(1) ?? [],
        sizeChart: {
          columns: ["Length", "Width"],
          rows: [
            { label: "S", values: [60, 45] },
            { label: "M", values: [65, 50] },
          ],
        },
      };
      setProduct(fallbackProduct);
    }
  }, [data]);
  const { addItem } = useCartStore();

const handleAddToCart = async () => {
  if(!product) return;
  if (!user) {
    router.push(`/login?redirect=/cart`);
    return null;
  }
  try {
    await CartAPI.add({
      productId: product.id,
      quantity: quantity,
    });

    addItem({
      id: Date.now(), // 仮ID（APIから返る場合はそちらを使う）
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      price: product.price,
      quantity: quantity,
      subtotal: product.price * quantity,
    });

    // alert("カートに追加しました！");
    router.push("/cart");
  } catch (error) {
    console.error("カート追加に失敗", error);
    alert("カートへの追加に失敗しました。");
  }
};

  if (loading) return <div className="p-6">Loading...</div>;

  if (error) {
    console.error("商品取得エラー:", error);
    return (
      <div className="p-6 text-red-500">商品情報の取得に失敗しました。</div>
    );
  }

  if (!product)
    return <div className="p-6 text-gray-500">商品が見つかりません。</div>;
  return (
    <>
      <div className="relative w-full h-screen">
        {/* 商品画像（全画面表示） */}
        {/* 商品画像（フェードイン） */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }} // ← お好みで調整
        >
          <Image
            src={product.imageUrls[0] ?? "/images/haerin1.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* 左下：ID・カテゴリ・名前 */}
        <div className="absolute bottom-6 left-6 bg-opacity-80 px-4 py-2 text-[#222] text-sm tracking-wide">
          {/* ←仮のカテゴリ。後ほどproducts.tsに追加予定 */}
          <p className="font-medium text-lg">{product.name} / Jacket</p>
        </div>

        {/* 右下：縦書きの DETAILS + 矢印 */}
        <div className="absolute bottom-6 right-6 flex flex-col items-center text-[#222] cursor-pointer">
          {/* DETAILS（縦書き） */}
          <span
            className="text-sm tracking-widest"
            style={{ writingMode: "vertical-rl" }}
          >
            DETAILS
          </span>

          {/* 縦の下矢印（SVG） */}
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
        <h2 className="text-2xl font-semibold mb-12 tracking-widest">
          {product.name}
        </h2>

        {/* 3カラム構成 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* 左カラム：詳細・サイズ表 */}
          <div className="text-sm space-y-6">
            <p>{product.description}</p>

            {/* サイズ表 */}
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

          {/* 中央カラム：カラー・サイズ・画像・価格 */}
          <div className="space-y-4">
            <div>
              <p className="font-bold text-sm">FABRIC :</p>
              <p className="text-sm">{product.fabric}</p>
            </div>
            <div>
              <p className="font-bold text-sm">PRICE :</p>
              <p className="text-sm">
                {product.price.toLocaleString()}yen (Tax inc.)
              </p>
            </div>
          </div>

          {/* 右カラム：選択フォーム */}
          <div className="space-y-4 lg:border-l lg:pl-10 border-[#d6d6d6]">
            <div>
              <label className="block text-sm mb-1">QTY</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
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
