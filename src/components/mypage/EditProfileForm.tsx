// app/components/mypage/EditProfileForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/app/lib/hooks/useProfile";

type FormState = {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  password: string;
};

type Field = {
  label: string;
  name: keyof FormState;              // ← ここがポイント
  required?: boolean;
  type?: "text" | "email" | "password";
  placeholder: string;
};

const FIELDS: Field[] = [
  { label: "お名前", name: "name", required: true, type: "text", placeholder: "山田 太郎" },
  { label: "ご住所", name: "address", type: "text", placeholder: "東京都渋谷区〇〇" },
  { label: "電話番号", name: "phoneNumber", type: "text", placeholder: "090-1234-5678" },
  { label: "メールアドレス", name: "email", type: "email", placeholder: "sample@example.com" },
];

export default function EditProfileForm() {
  const { user, loading, error, update } = useProfile();
  const [form, setForm] = useState<FormState>({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      address: user.address ?? "",
      phoneNumber: user.phoneNumber ?? "",
      email: user.email ?? "",
      password: "",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof FormState; value: string };
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const disabled = useMemo(() => submitting || loading, [submitting, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    try {
      await update({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        email: form.email.trim(),
        password: form.password.trim() || undefined, // 空なら送らない
      });
      setForm((f) => ({ ...f, password: "" }));
      alert("ユーザー情報を更新しました");
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!user) return <div className="p-6">ユーザー情報がありません。</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 py-8 max-w-2xl mx-auto">
      {FIELDS.map((f) => (
        <div key={f.name} className="border-b border-dotted pb-4">
          <div className="flex flex-col md:flex-row items-start gap-3">
            <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">
              {f.label} {f.required && <span className="text-red-500 text-xs">必須</span>}
            </label>
            <div className="w-full md:w-2/3">
              <Input
                name={f.name}
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                className="rounded-none placeholder:text-[#d6d6d6]"
                value={form[f.name]}
                onChange={handleChange}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ))}

      {/* パスワード */}
      <div className="border-b border-dotted pb-4">
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">パスワード</label>
          <div className="w-full md:w-2/3">
            <Input
              name="password"
              type="password"
              placeholder="********"
              className="rounded-none placeholder:text-[#d6d6d6]"
              value={form.password}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <Button type="submit" className="rounded-none px-20 py-6" disabled={disabled}>
          {submitting ? "送信中..." : "変更する"}
        </Button>
      </div>
    </form>
  );
}
