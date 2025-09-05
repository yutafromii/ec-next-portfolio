"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { AdminUsersAPI } from "@/app/lib/api/adminUsers";
import { UserForm, UserFormValues } from "@/components/admin/users/UserForm";

export default function CreateUserPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial: UserFormValues = {
    name: "",
    email: "",
    phoneNumber: "",
    postalCode: "",
    prefecture: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    password: "",
    role: "USER",
  };

  const onSubmit = async (values: UserFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await AdminUsersAPI.create(values);
      router.push("/admin/users");
    } catch (e) {
      console.error(e);
      setError("ユーザー作成に失敗しました。入力内容をご確認ください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-8 mt-12">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ユーザー新規作成</h1>
          <p className="text-sm text-gray-500">管理者がユーザーアカウントを登録します。</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/users"><Button variant="outline">キャンセル</Button></Link>
          <Button form="__noop" disabled>作成して保存</Button>{/* 見た目用（実処理はフォーム内） */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <UserForm
          mode="create"
          initialValues={initial}
          submitting={submitting}
          error={error}
          onSubmit={onSubmit}
          submitLabel="作成する"
        />
      </div>
    </section>
  );
}
