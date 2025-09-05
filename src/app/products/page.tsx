// app/products/page.tsx 
"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Product } from "@/app/interfaces/Product";
import { ProductsAPI } from "@/app/lib/api/products";

function ProductListPageInner() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  type Category = "all" | "jacket" | "pants" | "shirt";
  type StockFilter = "all" | "in" | "coming";

  const [category, setCategory] = useState<Category>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  // 一覧取得（新クライアント）
  // /app/products/page.tsx の一覧取得部分
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const data = await ProductsAPI.list();
      if (!mounted) return;

      // ★ 保険：作成日の新しい順（降順）。同一なら ID 降順
      const sorted = [...data].sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        if (tb !== ta) return tb - ta;

        const ia = typeof a.id === "number" ? a.id : Number(a.id) || 0;
        const ib = typeof b.id === "number" ? b.id : Number(b.id) || 0;
        return ib - ia;
      });

      setProducts(sorted);
    } catch (e: unknown) {
      if (!mounted) return;
      setError(e instanceof Error ? e.message : "商品一覧の取得に失敗しました。");
    } finally {
      if (mounted) setLoading(false);
    }
  })();
  return () => { mounted = false; };
}, []);


  // 検索パラメータから初期状態を復元
  useEffect(() => {
    const spCategory = (searchParams.get("category") || "all").toLowerCase();
    const spStock = (searchParams.get("stock") || "all").toLowerCase();
    if (["all", "jacket", "pants", "shirt"].includes(spCategory)) {
      setCategory(spCategory as Category);
    }
    if (["all", "in", "coming"].includes(spStock)) {
      setStockFilter(spStock as StockFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // カテゴリ判定（暫定：商品名にキーワードを含むかで分類）
  const detectCategory = (p: Product): Category => {
    const explicit = (p.category || "").toLowerCase();
    if (explicit === "jacket" || explicit === "pants" || explicit === "shirt") {
      return explicit as Category;
    }
    const name = (p.name || "").toLowerCase();
    if (name.includes("jacket")) return "jacket";
    if (name.includes("pants")) return "pants";
    if (name.includes("shirt")) return "shirt";
    return "all";
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = detectCategory(p);
      const matchCategory = category === "all" ? true : cat === category;
      const stock = p.stock ?? 0;
      const isInStock = stock > 0;
      const isComing = !isInStock; // 在庫0または未設定を Coming Soon とみなす
      const matchStock =
        stockFilter === "all" ? true : stockFilter === "in" ? isInStock : isComing;
      return matchCategory && matchStock;
    });
  }, [products, category, stockFilter]);

  const categoryLabel: Record<Category, string> = {
    all: "All Items",
    jacket: "Jacket",
    pants: "Pants",
    shirt: "Shirt",
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as Category;
    setCategory(v);
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("category", v);
    router.replace(`?${sp.toString()}`);
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as StockFilter;
    setStockFilter(v);
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("stock", v);
    router.replace(`?${sp.toString()}`);
  };

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
          <span>{categoryLabel[category]}</span>
          <span className="mx-2 h-4 w-px bg-[#d6d6d6]"></span>
          <span>{filteredProducts.length} items</span>
        </div>

        {/* 右側：セレクトボックス（実装） */}
        <div className="flex flex-row gap-6 items-center">
          <div className="flex items-center gap-2 text-[#222222]">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={category}
              onChange={handleCategoryChange}
              className="border border-gray-300 px-4 py-1 w-40 bg-white tracking-wide rounded-2xl"
            >
              <option value="all">All Items</option>
              <option value="jacket">Jacket</option>
              <option value="pants">Pants</option>
              <option value="shirt">Shirt</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[#222222]">
            <label htmlFor="filter">Filter:</label>
            <select
              id="filter"
              value={stockFilter}
              onChange={handleStockChange}
              className="border border-gray-300 w-40 px-4 py-1 bg-white tracking-wide rounded-2xl"
            >
              <option value="all">All</option>
              <option value="in">In Stock</option>
              <option value="coming">Coming Soon</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block group"
          >
            <div className="relative aspect-square w-full border">
              <Image
                src={product.imageUrls?.[0] || "/images/no-image.jpg"}
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

export default function ProductListPage() {
  return (
    <Suspense fallback={<section className="py-20">読み込み中...</section>}>
      <ProductListPageInner />
    </Suspense>
  );
}
