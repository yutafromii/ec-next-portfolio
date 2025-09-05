"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminOrdersAPI } from "@/app/lib/api/adminOrders";
import { ApiError } from "@/app/lib/api/client";
import type { AdminOrder } from "@/app/interfaces/AdminOrder";
import { toStatusLabel } from "@/lib/status";
import Image from "next/image";
import { ProductsAPI } from "@/app/lib/api/products";
import type { Product } from "@/app/interfaces/Product";

const STATUSES = ["受注", "支払い確認", "配送準備中", "発送済み", "キャンセル"] as const;
function allowedStatuses(current: string) {
  if (current === "発送済み") return new Set(["発送済み"]);
  if (current === "キャンセル") return new Set(["キャンセル"]);
  return new Set(STATUSES);
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<string>("");
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await AdminOrdersAPI.detail(String(id));
        if (!mounted) return;
        setOrder(data);
        setDraftStatus(toStatusLabel(data.status) || "受注");
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError("注文の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const items = useMemo(() => order?.items ?? [], [order]);
  const itemsCount = useMemo(() => items.reduce((s, it) => s + (it.quantity ?? 0), 0), [items]);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});

  // 画像用に商品情報を補完
  useEffect(() => {
    let mounted = true;
    (async () => {
      const ids = Array.from(new Set(items.map((it) => it.productId))).filter((v): v is number => typeof v === "number");
      if (!ids.length) { setProductMap({}); return; }
      try {
        const products = await ProductsAPI.byIds(ids);
        if (!mounted) return;
        const map: Record<number, Product> = {};
        products.forEach((p) => { map[p.id] = p; });
        setProductMap(map);
      } catch {
        if (!mounted) return;
        setProductMap({});
      }
    })();
    return () => { mounted = false; };
  }, [items]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    setSaving(true);
    setInfo(null);
    setError(null);
    try {
      const updated = await AdminOrdersAPI.updateStatus(order.id ?? order.orderId!, { status });
      setOrder(updated ?? { ...order, status });
      setInfo("ステータスを更新しました。");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError("このステータスへの変更は許可されていません。");
      } else {
        setError("ステータス更新に失敗しました。");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="py-10 px-6">読み込み中...</section>;
  if (error && !order) return <section className="py-10 px-6 text-red-500">{error}</section>;
  if (!order) return <section className="py-10 px-6">注文が見つかりません。</section>;

  return (
    <section className="py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">注文詳細</h1>
          <p className="text-sm text-gray-500">注文番号: {order.orderNumber ?? order.id}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders"><Button variant="outline">一覧へ戻る</Button></Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左：基本情報 + 明細 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>購入情報と明細</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {/* 基本 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-gray-500">注文日</div>
                <div>{order.orderedAt ? new Date(order.orderedAt).toLocaleString() : "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">ユーザーID</div>
                <div>#{order.userId}</div>
              </div>
              <div>
                <div className="text-gray-500">合計</div>
                <div>¥{order.total.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">点数</div>
                <div>{itemsCount}</div>
              </div>
            </div>

            {/* 明細 */}
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left w-20">画像</th>
                    <th className="px-3 py-2 text-left">商品</th>
                    <th className="px-3 py-2 text-right w-24">数量</th>
                    <th className="px-3 py-2 text-right w-28">単価</th>
                    <th className="px-3 py-2 text-right w-28">小計</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const subtotal = (it.subtotal ?? (it.price * it.quantity));
                    const p = productMap[it.productId];
                    const img = p?.imageUrls?.[0] || "/images/no-image.jpg";
                    return (
                      <tr key={it.id} className="border-t">
                        <td className="px-3 py-2">
                          <div className="w-16 h-16 border bg-white overflow-hidden relative">
                            <Image src={img} alt={it.productName ?? p?.name ?? "product"} fill className="object-cover" unoptimized />
                          </div>
                        </td>
                        <td className="px-3 py-2">{it.productName ?? p?.name ?? `#${it.productId}`}</td>
                        <td className="px-3 py-2 text-right">{it.quantity}</td>
                        <td className="px-3 py-2 text-right">¥{it.price.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">¥{subtotal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 右：ステータス操作 */}
        <Card>
          <CardHeader>
            <CardTitle>配送状況</CardTitle>
            <CardDescription>現在: {toStatusLabel(order.status) || "—"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="block text-gray-600">ステータスを変更</label>
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              className="border rounded px-3 py-2 bg-white w-full"
              disabled={saving}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} disabled={!allowedStatuses(toStatusLabel(order.status) || "").has(s)}>{s}</option>
              ))}
            </select>
            <div className="flex justify-end">
              <Button
                disabled={saving || draftStatus === toStatusLabel(order.status)}
                onClick={() => updateStatus(draftStatus)}
              >
                {saving ? "更新中..." : "更新"}
              </Button>
            </div>
            {info && <div className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{info}</div>}
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
