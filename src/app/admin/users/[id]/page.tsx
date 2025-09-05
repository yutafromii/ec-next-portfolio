"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminUsersAPI } from "@/app/lib/api/adminUsers";

import { UserForm, UserFormValues } from "@/components/admin/users/UserForm";

export default function AdminUserEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initial, setInitial] = useState<UserFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await AdminUsersAPI.byId(String(id));
        if (!mounted) return;
        const init: UserFormValues = {
          name: u.name ?? "",
          email: u.email ?? "",
          phoneNumber: u.phoneNumber ?? "",
          postalCode: u.postalCode ?? "",
          prefecture: u.prefecture ?? "",
          city: u.city ?? "",
          addressLine1: u.addressLine1 ?? "",
          addressLine2: u.addressLine2 ?? "",
          role: (u.role as "USER" | "ADMIN") ?? "USER",
          password: "", // 編集時は空で表示、空で送ればサーバ側で無視ルールでもOK
        };
        setInitial(init);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("ユーザー情報の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onSubmit = async (values: UserFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      // パスワード空は送ってOK（サーバ側で無視）、気になるならここで削除しても可
      const payload = { ...values };
      if (!payload.password) delete (payload as Partial<UserFormValues>).password;

      await AdminUsersAPI.update(String(id), payload);
      router.refresh(); // 反映
    } catch (e) {
      console.error(e);
      setError("保存に失敗しました。入力内容をご確認ください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <section className="py-10 px-6">読み込み中...</section>;
  if (error && !initial) return <section className="py-10 px-6 text-red-500">{error}</section>;
  if (!initial) return <section className="py-10 px-6 text-gray-500">ユーザーが見つかりません。</section>;

  return (
    <section className="py-8 mt-12">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ユーザー編集（管理）</h1>
          <p className="text-sm text-gray-500">ID: {String(id)}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/users"><Button variant="outline">一覧へ戻る</Button></Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <UserForm
          mode="edit"
          initialValues={initial}
          submitting={submitting}
          error={error}
          onSubmit={onSubmit}
          submitLabel="保存"
        />
      </div>
    </section>
  );
}
