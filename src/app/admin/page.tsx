"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductsAPI } from "@/app/lib/api/products";
import { http } from "@/app/lib/api/client";
import type { Product } from "@/app/interfaces/Product";
import type { User } from "@/app/interfaces/User";
import {
  CirclePlus,
  Shirt,
  ShoppingCart,
  UserRoundPen,
  UserRoundSearch,
} from "lucide-react";
import AdminNavButton from "@/components/admin/AdminNavButton";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, u] = await Promise.all([
          ProductsAPI.list().catch(() => [] as Product[]),
          http.get<User[]>("/users").catch(() => [] as User[]),
        ]);
        if (!mounted) return;
        setProducts(p ?? []);
        setUsers(u ?? []);
      } catch (e) {
        if (!mounted) return;
        setError("ダッシュボード情報の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive !== false),
    [products]
  );
  const outOfStock = useMemo(
    () => products.filter((p) => (p.stock ?? 0) <= 0),
    [products]
  );
  const recentProducts = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
    return copy.slice(0, 5);
  }, [products]);

  if (loading) return <section className="py-10 px-6">読み込み中...</section>;
  if (error)
    return <section className="py-10 px-6 text-red-500">{error}</section>;

  return (
    <section className="py-8 mt-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
          <p className="text-sm text-gray-500">ユーザーと商品を一元管理</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/orders">
            <Button variant="outline">注文状況を確認</Button>
          </Link>
          <Link href="/admin/products/create">
            <Button>商品を作成</Button>
          </Link>
          <Link href="/admin/users/create">
            <Button variant="outline">ユーザーを作成</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>ユーザー数</CardTitle>
            <CardDescription>登録済みユーザー合計</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {users.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>商品数</CardTitle>
            <CardDescription>登録済み商品合計</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {products.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>公開中</CardTitle>
            <CardDescription>現在公開中の商品</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {activeProducts.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>在庫切れ</CardTitle>
            <CardDescription>在庫0の商品</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {outOfStock.length}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近追加された商品</CardTitle>
            <CardDescription>直近5件</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <p className="text-sm text-gray-500">商品がありません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left w-20">画像</th>
                      <th className="px-3 py-2 text-left">商品名</th>
                      <th className="px-3 py-2 text-right w-24">価格</th>
                      <th className="px-3 py-2 text-right w-20">在庫</th>
                      <th className="px-3 py-2 text-center w-24">状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((p) => {
                      const img = p.imageUrls?.[0] || "/images/no-image.jpg";
                      return (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2">
                            <div className="relative w-12 h-12 border rounded overflow-hidden bg-white">
                              <Image
                                src={img}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              <span className="line-clamp-2">{p.name}</span>
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {typeof p.price === "number"
                              ? `¥${p.price.toLocaleString()}`
                              : "-"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {p.stock ?? 0}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>クイックリンク</CardTitle>
            <CardDescription>よく使う画面へ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AdminNavButton
              href="/admin/orders"
              icon={ShoppingCart}
              label="注文管理"
            />
            <AdminNavButton
              href="/admin/products"
              icon={Shirt}
              label="商品一覧へ"
              variant="outline"
            />
            <AdminNavButton
              href="/admin/products/create"
              icon={CirclePlus}
              label="商品を登録"
            />
            <AdminNavButton
              href="/admin/users"
              icon={UserRoundSearch}
              label="ユーザー一覧へ"
              variant="outline"
            />
            <AdminNavButton
              href="/admin/users/create"
              icon={UserRoundPen}
              label="ユーザーを作成"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
