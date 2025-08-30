// app/products/page.tsx など（元ファイル名に合わせて）
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { Product } from "@/app/interfaces/Product";
import { ProductsAPI } from "@/app/lib/api/products";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 一覧取得（新クライアント）
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await ProductsAPI.list();
        if (!mounted) return;
        setProducts(data);
      } catch (e: unknown) {
        if (!mounted) return;
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("商品一覧の取得に失敗しました。");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 削除処理（新クライアント）
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) return;
    try {
      await ProductsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  };

  if (loading) return <section className="py-20">読み込み中...</section>;
  if (error) return <section className="py-20 text-red-500">{error}</section>;

  return (
    <section className="py-20">
      <h1 className="text-3xl font-semibold text-center mb-10 tracking-widest">
        ALL PRODUCTS
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 px-10 gap-4">
        {/* 左側：カテゴリ名 + セパレーター + 件数 */}
        <div className="flex items-center text-[#222222] tracking-wide">
          <span>Jacket</span>
          <span className="mx-2 h-4 w-px bg-[#d6d6d6]"></span>
          <span>{products.length} items</span>
        </div>

        {/* 右側：セレクトボックス（ダミー） */}
        <div className="flex flex-row gap-6 items-center">
          <div className="flex items-center gap-2 text-[#222222]">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              className="border border-gray-300 px-4 py-1 w-32 bg-white tracking-wide rounded-2xl"
            >
              <option>All Items</option>
              <option>Jacket</option>
              <option>Pants</option>
              <option>Shirt</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[#222222]">
            <label htmlFor="filter">Filter:</label>
            <select
              id="filter"
              className="border border-gray-300 w-32 px-4 py-1 bg-white tracking-wide rounded-2xl"
            >
              <option>All</option>
              <option>In Stock</option>
              <option>Coming Soon</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block group"
          >
            <div className="relative aspect-square w-full border">
              <Image
                src={product.imageUrls?.[0] || "/images/no-image.png"}
                alt={product.name}
                fill
                className="p-8 object-contain transition-opacity duration-500 ease-in-out group-hover:opacity-80"
                unoptimized
              />
              <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-medium text-[#222222] px-2 py-1 text-center">
                {product.name}
              </p>

              {/* 管理UIが必要なら削除ボタンを仮配置 */}
              {/* <button
                onClick={(e) => { e.preventDefault(); handleDelete(product.id); }}
                className="absolute top-2 right-2 text-xs border px-2 py-1 bg-white hover:bg-gray-50"
              >
                削除
              </button> */}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
