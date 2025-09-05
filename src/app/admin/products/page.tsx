"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/app/interfaces/Product";
import { AdminProductsAPI } from "@/app/lib/api/adminProducts";
import { Button } from "@/components/ui/button";

type Category = "all" | "jacket" | "pants" | "shirt";
type StockFilter = "all" | "in" | "coming";
type ActiveFilter = "all" | "active" | "inactive";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [active, setActive] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let mounted = true;
    const h = setTimeout(async () => {
      try {
        const pg = await AdminProductsAPI.page({ page, size, q: q.trim() || undefined, includeInactive: active !== "active" });
        if (!mounted) return;
        setProducts(pg?.content ?? []);
        setTotalPages(pg?.totalPages ?? 0);
        setError(null);
      } catch {
        if (!mounted) return;
        setError("商品一覧の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    }, 300); // q デバウンス
    return () => {
      mounted = false;
      clearTimeout(h);
    };
  }, [page, size, q, active]);

  const detectCategory = (p: Product): Category => {
    const c = (p.category || "").toLowerCase();
    if (c === "jacket" || c === "pants" || c === "shirt") return c as Category;
    const name = (p.name || "").toLowerCase();
    if (name.includes("jacket")) return "jacket";
    if (name.includes("pants")) return "pants";
    if (name.includes("shirt")) return "shirt";
    return "all";
  };

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ = !keyword
        ? true
        : (p.name || "").toLowerCase().includes(keyword) ||
          (p.description || "").toLowerCase().includes(keyword);
      const cat = detectCategory(p);
      const matchCategory = category === "all" ? true : cat === category;
      const stock = p.stock ?? 0;
      const isInStock = stock > 0;
      const matchStock =
        stockFilter === "all"
          ? true
          : stockFilter === "in"
          ? isInStock
          : !isInStock;
      const isActive = p.isActive ?? true;
      const matchActive =
        active === "all" ? true : active === "active" ? isActive : !isActive;
      return matchQ && matchCategory && matchStock && matchActive;
    });
  }, [products, q, category, stockFilter, active]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) return;
    try {
      await AdminProductsAPI.delete(id);
      setProducts((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };

  const formatPrice = (v?: number) =>
    typeof v === "number" ? `¥${v.toLocaleString()}` : "-";
  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "-";

  if (loading) return <section className="py-20">読み込み中...</section>;
  if (error) return <section className="py-20 text-red-500">{error}</section>;

  return (
    <section className="py-10 mt-12">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">商品管理</h1>
          <p className="text-sm text-gray-500">
            登録済み商品の一覧・検索・編集
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline">管理画面TOPへ</Button>
          </Link>
          <Link href="/admin/products/create">
            <Button className="w-full">新規作成</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="キーワード検索（商品名/説明）"
            className="md:col-span-2 border rounded-md px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border rounded-md px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="all">全カテゴリ</option>
            <option value="jacket">Jacket</option>
            <option value="pants">Pants</option>
            <option value="shirt">Shirt</option>
          </select>
          <select
            className="border rounded-md px-3 py-2"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          >
            <option value="all">在庫すべて</option>
            <option value="in">在庫あり</option>
            <option value="coming">在庫なし</option>
          </select>
          <select
            className="border rounded-md px-3 py-2"
            value={active}
            onChange={(e) => setActive(e.target.value as ActiveFilter)}
          >
            <option value="all">公開/非公開 すべて</option>
            <option value="active">公開のみ</option>
            <option value="inactive">非公開のみ</option>
          </select>
        </div>
        <div className="text-sm text-gray-600 mt-2">該当 {filtered.length} 件（ページ {page+1}/{Math.max(totalPages,1)}）</div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="overflow-x-auto border rounded-md bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left w-24">画像</th>
                <th className="px-3 py-2 text-left">商品名</th>
                <th className="px-3 py-2 text-left w-28">カテゴリ</th>
                <th className="px-3 py-2 text-right w-28">価格</th>
                <th className="px-3 py-2 text-right w-24">在庫</th>
                <th className="px-3 py-2 text-center w-24">公開</th>
                <th className="px-3 py-2 text-left w-32">作成日</th>
                <th className="px-3 py-2 text-center w-40">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const firstImg = p.imageUrls?.[0] || "/images/no-image.jpg";
                const inStock = (p.stock ?? 0) > 0;
                const cat = (p.category || "-").toString();
                return (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="relative w-16 h-16 rounded-sm overflow-hidden border bg-white">
                        <Image
                          src={firstImg}
                          alt={p.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 line-clamp-2">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {p.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 capitalize">{cat}</td>
                    <td className="px-3 py-2 text-right">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                          inStock
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                          p.isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.isActive ? "公開" : "非公開"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatDate(p.createdAt)}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          詳細
                        </Link>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(Number(p.id))}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-sm mt-3">
          <div className="flex items-center gap-2">
            <span>表示件数</span>
            <select className="border rounded px-2 py-1 bg-white" value={size} onChange={(e)=>{setPage(0); setSize(Number(e.target.value));}}>
              {[10,20,30,50].map(n=> <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="border rounded px-3 py-1 bg-white disabled:opacity-50" disabled={page<=0} onClick={()=>setPage(p=>Math.max(0,p-1))}>前へ</button>
            <button className="border rounded px-3 py-1 bg-white disabled:opacity-50" disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)}>次へ</button>
          </div>
        </div>
      </div>
    </section>
  );
}
