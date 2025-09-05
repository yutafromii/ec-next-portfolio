"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["受注", "支払い確認", "配送準備中", "発送済み", "キャンセル"] as const;

function allowedStatuses(current: string) {
  if (current === "発送済み") return new Set(["発送済み"]);
  if (current === "キャンセル") return new Set(["キャンセル"]);
  // それ以外は全て許可（バックエンドポリシーに合わせ柔軟）
  return new Set(STATUSES);
}

type OrderRow = {
  id: string;
  orderNumber?: string;
  userId: number;
  userName?: string;
  date: string;
  total: number;
  status: string;
  items: { id: string; name: string; quantity: number; price: number; imageUrl?: string }[];
};

type UserLite = { id: number; name: string };

type Props = {
  orders: OrderRow[];
  users: UserLite[];
  onChangeStatus: (id: string, status: string) => void;
  submittingId?: string | null;
};

export default function OrdersTable({ orders, users, onChangeStatus, submittingId }: Props) {
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // 同期: 親から渡された status を初期値として保持
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const o of orders) next[o.id] = o.status;
    setDrafts(next);
  }, [orders]);
  if (!orders.length) {
    return <div className="border rounded-md bg-white p-6 text-sm text-gray-500">注文がありません。</div>;
  }

  return (
    <div className="overflow-x-auto border rounded-md bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left w-40">注文番号</th>
            <th className="px-3 py-2 text-left w-32">注文日</th>
            <th className="px-3 py-2 text-left">ユーザー</th>
            <th className="px-3 py-2 text-right w-28">合計</th>
            <th className="px-3 py-2 text-center w-24">点数</th>
            <th className="px-3 py-2 text-left w-44">配送状況</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-3 py-2 font-mono">
                <Link href={`/admin/orders/${encodeURIComponent(o.id)}`} className="text-blue-600 hover:underline">
                  {o.orderNumber ?? o.id}
                </Link>
              </td>
              <td className="px-3 py-2">{new Date(o.date).toLocaleDateString()}</td>
              <td className="px-3 py-2">{o.userName ?? userMap.get(o.userId) ?? `#${o.userId}`}</td>
              <td className="px-3 py-2 text-right">¥{o.total.toLocaleString()}</td>
              <td className="px-3 py-2 text-center">{(o.items?.reduce((s, it) => s + (it.quantity ?? 0), 0)) ?? 0}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                <Select value={drafts[o.id] ?? o.status} onValueChange={(v) => setDrafts((d) => ({ ...d, [o.id]: v }))}>
                  <SelectTrigger size="sm" className="min-w-40">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => {
                      const allow = allowedStatuses(o.status).has(s);
                      return (
                        <SelectItem key={s} value={s} disabled={!allow}>{s}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs bg-white disabled:opacity-50"
                  disabled={submittingId === o.id || (drafts[o.id] ?? o.status) === o.status}
                  onClick={() => onChangeStatus(o.id, drafts[o.id] ?? o.status)}
                >
                  更新
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
