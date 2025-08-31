"use client";

import { useEffect, useState } from "react";
import { http } from "@/app/lib/api/client";
import { useRouter } from "next/navigation";
import { User } from "@/app/interfaces/User";
import Link from "next/link";

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await http.get<User[]>("/users");
      setUsers(res);
    })();
  }, []);

  return (
    <div className="p-4 mt-20">
      <h1 className="text-2xl font-bold mb-6">ユーザー一覧</h1>
      <Link
        href="/admin/users/create"
        className="inline-block mb-4 text-sm text-blue-600 hover:underline"
      >
        ＋新規ユーザー作成
      </Link>

      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">名前</th>
            <th className="p-2 border">メール</th>
            <th className="p-2 border">電話番号</th>
            <th className="p-2 border">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="text-center">
              <td className="p-2 border">{u.id}</td>
              {/* 🔽 名前クリックで詳細ページへ */}
              <td className="p-2 border">
                <Link
                  href={`/admin/users/${u.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {u.name || "未登録"}
                </Link>
              </td>
              <td className="p-2 border">{u.email || "未登録"}</td>
              <td className="p-2 border">{u.phoneNumber || "未登録"}</td>
              <td className="p-2 border">
                <button
                  onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                  className="text-blue-600 hover:underline"
                >
                  編集
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
