// app/components/home/ProductPreview.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ProductsAPI } from "@/app/lib/api/products";
import type { Product } from "@/app/interfaces/Product";

export default function ProductPreview() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // いまは一覧 → フロントで4件に絞る
        const list = await ProductsAPI.list();
        if (!mounted) return;
        setItems((list ?? []).slice(0, 4));
        setErr(null);
      } catch (e) {
        if (!mounted) return;
        setErr("商品一覧の取得に失敗しました。");
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-20 px-6 md:px-12 border-b border-[#d6d6d6]">
      <h2 className="text-2xl font-semibold text-center mb-12">
        SELECTION OF THE DAY
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="relative aspect-square bg-[#f0f0f0]" />
              <div className="h-4 bg-[#eee] mt-3" />
            </div>
          ))}
        </div>
      ) : err ? (
        <div className="text-center text-red-500">{err}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {items.map((p) => {
            const image = p.imageUrls?.[0] ?? "/images/no-image.jpg";
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group text-center"
              >
                <div className="relative aspect-square bg-[#f7f7f7]">
                  <Image
                    src={image}
                    alt={p.name}
                    fill
                    className="object-contain transition-opacity duration-200 group-hover:opacity-70"
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-[#222222] truncate">
                  {p.name}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="inline-block px-6 py-2 border border-[#222] text-[#222] hover:bg-[#222] hover:text-white transition"
        >
          VIEW ALL PRODUCTS
        </Link>
      </div>
    </section>
  );
}
