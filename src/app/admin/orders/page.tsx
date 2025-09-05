"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { orders as mockOrders } from "@/lib/orders";
import { http, ApiError } from "@/app/lib/api/client";
import { AdminOrdersAPI } from "@/app/lib/api/adminOrders";
import type { User } from "@/app/interfaces/User";
import { toStatusLabel } from "@/lib/status";
import type { AdminOrder } from "@/app/interfaces/AdminOrder";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type StatusFilter =
  | "all"
  | "受注"
  | "支払い確認"
  | "配送準備中"
  | "発送済み"
  | "キャンセル";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [userFilter, setUserFilter] = useState<number | "all">("all");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [page, setPage] = useState(0); // 0-based
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // まず注文一覧（ページング）
        const pg = await AdminOrdersAPI.page({
          page,
          size,
          status: statusFilter === "all" ? undefined : statusFilter,
          userId: userFilter === "all" ? undefined : userFilter,
        });
        if (!mounted) return;
        setOrders(pg?.content ?? []);
        setTotalPages(pg?.totalPages ?? 0);
        // 次にユーザー一覧（無権限なら 403 になり得るが orders が取れていれば概ねADMIN想定）
        const u = await http.get<User[]>("/users").catch(() => [] as User[]);
        if (!mounted) return;
        setUsers(u ?? []);
      } catch (e) {
        if (!mounted) return;
        if (e instanceof ApiError && e.status === 403) {
          setError("権限がありません（管理者でログインしてください）。");
        } else {
          // バックエンド未実装などのときはモックにフォールバック
          setOrders(
            mockOrders.map((m) => ({
              id: m.id,
              orderId: m.id,
              userId: m.userId,
              total: m.total,
              status: m.status,
              orderedAt: m.date,
              items: m.items.map((it) => ({
                id: Number(it.id),
                productId: 0,
                productName: it.name,
                price: it.price,
                quantity: it.quantity,
              })),
            }))
          );
          setError(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [statusFilter, userFilter, page, size]);

  const filtered = useMemo(() => {
    // 可能ならAPI側でフィルタ済みだが、保険でクライアント側でも適用
    return orders.filter((o) => {
      const sOk =
        statusFilter === "all" || toStatusLabel(o.status) === statusFilter;
      const uOk = userFilter === "all" || o.userId === userFilter;
      return sOk && uOk;
    });
  }, [orders, statusFilter, userFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      byStatus: orders.reduce<Record<string, number>>((acc, o) => {
        const s = toStatusLabel(o.status ?? "");
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {}),
    }),
    [orders]
  );

  const handleChangeStatus = async (id: string, status: string) => {
    setSubmittingId(id);
    setInfo(null);
    setLocalError(null);
    try {
      const numericOrRaw: number | string = /^\d+$/.test(id) ? Number(id) : id;
      await AdminOrdersAPI.updateStatus(numericOrRaw, { status });
      setOrders((prev) =>
        prev.map((o) =>
          String(o.id ?? o.orderId) === id ? { ...o, status } : o
        )
      );
      setInfo("ステータスを更新しました。");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setLocalError("このステータスへの変更は許可されていません。");
      } else {
        setLocalError("ステータス更新に失敗しました。");
      }
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <section className="py-10 px-6">読み込み中...</section>;
  if (error)
    return <section className="py-10 px-6 mt-12 text-red-500">{error}</section>;

  return (
    <section className="py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">注文管理</h1>
          <p className="text-sm text-gray-500">注文一覧と配送状況の更新</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline">管理画面TOPへ</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>注文数</CardTitle>
            <CardDescription>全体</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.total}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>配送準備中</CardTitle>
            <CardDescription>現在の件数</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.byStatus["配送準備中"] ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>発送済み</CardTitle>
            <CardDescription>累計</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.byStatus["発送済み"] ?? 0}
          </CardContent>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="text-gray-600">ステータス:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border rounded px-2 py-1 bg-white"
          >
            <option value="all">すべて</option>
            <option value="受注">受注</option>
            <option value="支払い確認">支払い確認</option>
            <option value="配送準備中">配送準備中</option>
            <option value="発送済み">発送済み</option>
            <option value="キャンセル">キャンセル</option>
          </select>

          <label className="ml-4 text-gray-600">ユーザー:</label>
          <select
            value={String(userFilter)}
            onChange={(e) => {
              const v = e.target.value;
              setUserFilter(v === "all" ? "all" : Number(v));
            }}
            className="border rounded px-2 py-1 bg-white"
          >
            <option value="all">すべて</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} (#{u.id})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="ml-2 border rounded px-2 py-1 bg-white"
            onClick={() => {
              setStatusFilter("all");
              setUserFilter("all");
              setPage(0);
            }}
          >
            条件クリア
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span>表示件数</span>
            <select
              className="border rounded px-2 py-1 bg-white"
              value={size}
              onChange={(e) => {
                setPage(0);
                setSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        {info && (
          <div className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
            {info}
          </div>
        )}
        {localError && (
          <div className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">
            {localError}
          </div>
        )}

        <OrdersTable
          orders={filtered.map((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            return {
              id: String(o.id ?? o.orderId),
              orderNumber: o.orderNumber ? String(o.orderNumber) : undefined,
              userId: o.userId,
              userName: o.userName,
              date: o.orderedAt ?? new Date().toISOString(),
              total: o.total,
              status: toStatusLabel(o.status) || "",
              items: items.map((it) => ({
                id: String(it.id),
                name: it.productName ?? String(it.productId),
                quantity: it.quantity,
                price: it.price,
              })),
            };
          })}
          users={users}
          onChangeStatus={handleChangeStatus}
          submittingId={submittingId}
        />
        {/* Pager */}
        <div className="flex items-center justify-between text-sm mt-2">
          <div>
            ページ {page + 1} / {Math.max(totalPages, 1)}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="border rounded px-3 py-1 bg-white disabled:opacity-50"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              前へ
            </button>
            <button
              className="border rounded px-3 py-1 bg-white disabled:opacity-50"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
