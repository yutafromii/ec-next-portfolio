"use client"

import Link from "next/link";
import Image from "next/image";
// import { products } from "@/lib/products";
import { Product } from "@/app/interfaces/Product";
import { useEffect, useState } from "react";
import { apiDelete } from "@/app/lib/api";
import { useFetchData } from "@/app/lib/hooks/useFetchData";

export default function ProductListPage() {
  const { data, error, loading } = useFetchData<Product[]>(
    "http://localhost:8080/products"
  );
  const [products, setProducts] = useState<Product[]>([]);

  // 初回だけセット
  useEffect(() => {
    if (data) {
      setProducts(data);
    }
  }, [data]);

  // 削除処理（Hook化は不要。動的URLなのでシンプル記述でOK）
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) return;
    try {
      await apiDelete(`http://localhost:8080/products/${id}`);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };
  return (
    <section className="py-20">
      <h1 className="text-3xl font-semibold text-center mb-10 tracking-widest">
        ALL PRODUCTS(管理者画面)
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 px-10 gap-4">
        {/* 左側：カテゴリ名 + セパレーター + 件数 */}
        <div className="flex items-center text-[#222222] tracking-wide">
          <span>Jacket</span>
          <span className="mx-2 h-4 w-px bg-[#d6d6d6]"></span>
          <span>6 items</span>
        </div>

        {/* 右側：セレクトボックス（横並び） */}
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
            className="block"
          >
            <div className="relative aspect-square w-full border">
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                className="p-8 object-contain transition-opacity duration-500 ease-in-out hover:opacity-80"
              />
              <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-medium text-[#222222] px-2 py-1 text-center">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
