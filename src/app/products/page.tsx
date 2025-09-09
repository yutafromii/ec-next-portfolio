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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await ProductsAPI.list();
        if (!mounted) return;

        const sorted = [...data].sort((a, b) => {
          const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
          const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
          if (tb !== ta) return tb - ta;
          const ia = typeof a.id === "number" ? a.id : Number(a.id) || 0;
          const ib = typeof b.id === "number" ? b.id : Number(b.id) || 0;
          return ib - ia;
        });
        setProducts(sorted);
      } catch (e) {
        if (!mounted) return;
        setError(
          e instanceof Error ? e.message : "商品一覧の取得に失敗しました。"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const spCategory = (searchParams.get("category") || "all").toLowerCase();
    const spStock = (searchParams.get("stock") || "all").toLowerCase();
    if (["all", "jacket", "pants", "shirt"].includes(spCategory)) {
      setCategory(spCategory as Category);
    }
    if (["all", "in", "coming"].includes(spStock)) {
      setStockFilter(spStock as StockFilter);
    }
  }, [searchParams]);

  const detectCategory = (p: Product): Category => {
    const explicit = (p.category || "").toLowerCase();
    if (explicit === "jacket" || explicit === "pants" || explicit === "shirt")
      return explicit as Category;
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
      const isComing = !isInStock;
      const matchStock =
        stockFilter === "all"
          ? true
          : stockFilter === "in"
          ? isInStock
          : isComing;
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

  if (loading) return <section className="py-20">読み込み中...</section>;
  if (error) return <section className="py-20 text-red-500">{error}</section>;

  return (
    <section className="py-20">
      <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-10 tracking-widest">
        ALL PRODUCTS
      </h1>

      {/* コントロールバー：モバイルは縦積み、PCは元の横並びに戻す */}
      <div className="mb-10 px-4 sm:px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 左：カテゴリ名 + 件数（PCはそのまま） */}
          <div className="flex items-center justify-between md:justify-start gap-2 text-[#222222] tracking-wide flex-wrap">
            <span className="whitespace-nowrap">{categoryLabel[category]}</span>
            <span className="hidden sm:inline mx-2 h-4 w-px bg-[#d6d6d6]" />
            <span className="text-sm text-[#555]">
              {filteredProducts.length} items
            </span>
          </div>

          {/* 右：セレクト。md以上は元の見た目（横並び/固定幅/小さめ高さ） */}
          <div className="flex w-full md:w-auto flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2 text-[#222222] w-full md:w-auto">
              <label htmlFor="category" className="whitespace-nowrap">
                Category:
              </label>
              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                className="
                  border border-gray-300 bg-white tracking-wide rounded-2xl
                  px-3 py-2 w-full
                  md:px-4 md:py-1 md:w-40  /* ← PC: 元のサイズ/幅 */
                "
              >
                <option value="all">All Items</option>
                <option value="jacket">Jacket</option>
                <option value="pants">Pants</option>
                <option value="shirt">Shirt</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-[#222222] w-full md:w-auto">
              <label htmlFor="filter" className="whitespace-nowrap">
                Filter:
              </label>
              <select
                id="filter"
                value={stockFilter}
                onChange={handleStockChange}
                className="
                  border border-gray-300 bg-white tracking-wide rounded-2xl
                  px-3 py-2 w-full
                  md:px-4 md:py-1 md:w-40  /* ← PC: 元のサイズ/幅 */
                "
              >
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="coming">Coming Soon</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-0.5">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
          >
            <div className="relative aspect-square w-full border overflow-hidden">
              <Image
                src={product.imageUrls?.[0] || "/images/no-image.jpg"}
                alt={product.name}
                fill
                sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                className="object-contain transition-opacity duration-300 ease-in-out md:group-hover:opacity-80"
                unoptimized
              />
              <p
                className="absolute bottom-0 inset-x-0 text-center text-xs sm:text-sm font-medium text-[#222222] px-2 py-1 bg-white/80 md:bg-transparent truncate"
                title={product.name}
              >
                {product.name}
              </p>
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
