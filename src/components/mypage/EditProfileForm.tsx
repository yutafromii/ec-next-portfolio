// app/components/mypage/EditProfileForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/app/lib/hooks/useProfile";
import { lookupPostal } from "@/app/lib/postal/lookup";

type FormState = {
  name: string;
  // 住所（新）
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  // 旧（プレビュー専用）
  addressPreview: string;
  // 連絡先
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

type FieldKey = keyof FormState;

export default function EditProfileForm() {
  const { user, loading, error, update } = useProfile();
  const [form, setForm] = useState<FormState>({
    name: "",
    postalCode: "",
    prefecture: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    addressPreview: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      postalCode: user.postalCode ?? "",
      prefecture: user.prefecture ?? "",
      city: user.city ?? "",
      addressLine1: user.addressLine1 ?? "",
      addressLine2: user.addressLine2 ?? "",
      addressPreview: user.address ?? "",
      phoneNumber: user.phoneNumber ?? "",
      email: user.email ?? "",
      password: "",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: FieldKey; value: string };
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoFill = async () => {
    setAutoError(null);
    try {
      setAutoLoading(true);
      const a = await lookupPostal(form.postalCode);
      setForm((prev) => ({
        ...prev,
        prefecture: prev.prefecture || a.prefecture,
        city: prev.city || a.city,
        addressLine1: prev.addressLine1 || (a.town ?? ""),
      }));
    } catch (e) {
      setAutoError(e instanceof Error ? e.message : "住所の自動入力に失敗しました");
    } finally {
      setAutoLoading(false);
    }
  };

  const disabled = useMemo(() => submitting || loading, [submitting, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    try {
      // 郵便番号を 123-4567 形式に正規化
      const postal = form.postalCode.replace(/[^0-9]/g, "");
      const normalizedPostal = postal.length === 7 ? `${postal.slice(0,3)}-${postal.slice(3)}` : form.postalCode.trim();

      await update({
        name: form.name.trim(),
        postalCode: normalizedPostal || undefined,
        prefecture: form.prefecture.trim() || undefined,
        city: form.city.trim() || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        addressLine2: form.addressLine2.trim() || undefined,
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
      {/* お名前 */}
      <div className="border-b border-dotted pb-4">
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">お名前 <span className="text-red-500 text-xs">必須</span></label>
          <div className="w-full md:w-2/3">
            <Input name="name" placeholder="山田 太郎" className="rounded-none" value={form.name} onChange={handleChange} disabled={disabled} />
          </div>
        </div>
      </div>

      {/* 住所（分割） */}
      <div className="border-b border-dotted pb-4 space-y-3">
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">郵便番号</label>
          <div className="w-full md:w-2/3">
            <div className="flex gap-2">
              <Input name="postalCode" placeholder="123-4567" className="rounded-none" value={form.postalCode} onChange={handleChange} disabled={disabled || autoLoading} />
              <Button type="button" variant="outline" onClick={handleAutoFill} disabled={disabled || autoLoading}>
                {autoLoading ? "検索中..." : "住所自動入力"}
              </Button>
            </div>
            {autoError && <p className="text-xs text-red-600 mt-1">{autoError}</p>}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">都道府県</label>
          <div className="w-full md:w-2/3">
            <Input name="prefecture" placeholder="東京都" className="rounded-none" value={form.prefecture} onChange={handleChange} disabled={disabled} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">市区町村</label>
          <div className="w-full md:w-2/3">
            <Input name="city" placeholder="渋谷区" className="rounded-none" value={form.city} onChange={handleChange} disabled={disabled} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">町名番地</label>
          <div className="w-full md:w-2/3">
            <Input name="addressLine1" placeholder="神南1-1-1" className="rounded-none" value={form.addressLine1} onChange={handleChange} disabled={disabled} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">建物名</label>
          <div className="w-full md:w-2/3">
            <Input name="addressLine2" placeholder="XXビル101" className="rounded-none" value={form.addressLine2} onChange={handleChange} disabled={disabled} />
          </div>
        </div>
        {form.addressPreview && (
          <div className="text-xs text-gray-500 pl-0 md:pl-1">（旧住所）{form.addressPreview}</div>
        )}
      </div>

      {/* 連絡先 */}
      <div className="border-b border-dotted pb-4">
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">電話番号</label>
          <div className="w-full md:w-2/3">
            <Input name="phoneNumber" placeholder="090-1234-5678" className="rounded-none" value={form.phoneNumber} onChange={handleChange} disabled={disabled} />
          </div>
        </div>
      </div>
      <div className="border-b border-dotted pb-4">
        <div className="flex flex-col md:flex-row items-start gap-3">
          <label className="w-full md:w-1/3 text-sm text-left pr-4 shrink-0">メールアドレス</label>
          <div className="w-full md:w-2/3">
            <Input name="email" type="email" placeholder="sample@example.com" className="rounded-none" value={form.email} onChange={handleChange} disabled={disabled} />
          </div>
        </div>
      </div>

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
