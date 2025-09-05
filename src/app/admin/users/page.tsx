// /app/admin/users/page.tsx（あなたの AdminUserList コンポーネント）
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@/app/interfaces/User";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminUsersAPI } from "@/app/lib/api/adminUsers"; // ★ここを使う

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pg = await AdminUsersAPI.page({ page, size });
        if (!mounted) return;
        setUsers(pg?.content ?? []);
        setTotalPages(pg?.totalPages ?? 0);
        setError(null);
      } catch {
        if (!mounted) return;
        setError("ユーザー一覧の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, size]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((u) =>
      [u.name, u.email, u.phoneNumber, u.address]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    );
  }, [users, q]);

  const missingPhone = useMemo(() => users.filter((u) => !u.phoneNumber)?.length ?? 0, [users]);
  const missingAddress = useMemo(() => users.filter((u) => !u.address)?.length ?? 0, [users]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) return;
    try {
      await AdminUsersAPI.delete(id);         // ★ /admin/users/:id DELETE
      setUsers((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました。注文履歴やカート等で参照されている可能性があります。");
    }
  };

  if (loading) return <section className="py-10 px-6">読み込み中...</section>;
  if (error) return <section className="max-w-7xl mx-auto py-10 mt-10 text-red-500">{error}</section>;

  return (
    <section className="py-8 mt-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ユーザー管理</h1>
          <p className="text-sm text-gray-500">登録済みユーザーの一覧・検索・編集</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin"><Button variant="outline">管理画面TOPへ</Button></Link>
          <Link href="/admin/users/create"><Button>新規ユーザー作成</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card><CardHeader><CardTitle>ユーザー数</CardTitle><CardDescription>登録済み</CardDescription></CardHeader><CardContent className="text-3xl font-semibold">{users.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>電話未登録</CardTitle><CardDescription>phoneNumber が空</CardDescription></CardHeader><CardContent className="text-3xl font-semibold">{missingPhone}</CardContent></Card>
        <Card><CardHeader><CardTitle>住所未登録</CardTitle><CardDescription>address が空</CardDescription></CardHeader><CardContent className="text-3xl font-semibold">{missingAddress}</CardContent></Card>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 mb-4">
        <input
          type="text"
          placeholder="キーワード検索（名前/メール/電話/住所）"
          className="w-full md:w-96 border rounded-md px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="text-sm text-gray-600 mt-2">該当 {filtered.length} 件（ページ {page+1}/{Math.max(totalPages,1)}）</div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="overflow-x-auto border rounded-md bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left w-20">ID</th>
                <th className="px-3 py-2 text-left">名前</th>
                <th className="px-3 py-2 text-left">メール</th>
                <th className="px-3 py-2 text-left">電話番号</th>
                <th className="px-3 py-2 text-left">住所</th>
                <th className="px-3 py-2 text-center w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:underline">
                      {u.name || "未登録"}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{u.email || "未登録"}</td>
                  <td className="px-3 py-2">{u.phoneNumber || "未登録"}</td>
                  <td className="px-3 py-2">
                    {[u.prefecture, u.city, u.addressLine1, u.addressLine2].filter(Boolean).join(" ") ||
                      u.address || "未登録"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="inline-flex items-center gap-3">
                      <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:underline">詳細</Link>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(Number(u.id))}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
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
