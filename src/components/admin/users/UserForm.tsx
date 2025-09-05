"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { lookupPostal } from "@/app/lib/postal/lookup";

export type Role = "USER" | "ADMIN";

export type UserFormValues = {
  name: string;
  email: string;
  phoneNumber?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  role: Role;
  password?: string; // create時は必須 / edit時は任意
};

export function UserForm({
  mode,
  initialValues,
  submitting,
  error,
  onSubmit,
  submitLabel,
}: {
  mode: "create" | "edit";
  initialValues: UserFormValues;
  submitting?: boolean;
  error?: string | null;
  submitLabel?: string;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<UserFormValues>(initialValues);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoFill = async () => {
    setAutoError(null);
    try {
      setAutoLoading(true);
      const res = await lookupPostal(values.postalCode || "");
      setValues((prev) => ({
        ...prev,
        prefecture: prev.prefecture || res.prefecture,
        city: prev.city || res.city,
        addressLine1: prev.addressLine1 || (res.town ?? ""),
      }));
    } catch (e) {
      setAutoError(e instanceof Error ? e.message : "住所の自動入力に失敗しました");
    } finally {
      setAutoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // create: password必須 / edit: 任意
    if (mode === "create" && !values.password) {
      alert("パスワードを入力してください");
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左: 基本情報 */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>氏名や連絡先情報を入力します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">名前</Label>
              <Input id="name" name="name" value={values.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">メール</Label>
              <Input id="email" name="email" type="email" value={values.email} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">電話番号</Label>
                <Input id="phoneNumber" name="phoneNumber" value={values.phoneNumber ?? ""} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="postalCode">郵便番号</Label>
                <div className="flex gap-2">
                  <Input id="postalCode" name="postalCode" value={values.postalCode ?? ""} onChange={handleChange} />
                  <Button type="button" variant="outline" onClick={handleAutoFill} disabled={autoLoading}>
                    {autoLoading ? "検索中..." : "住所自動入力"}
                  </Button>
                </div>
                {autoError && <p className="text-xs text-red-600 mt-1">{autoError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prefecture">都道府県</Label>
                <Input id="prefecture" name="prefecture" value={values.prefecture ?? ""} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="city">市区町村</Label>
                <Input id="city" name="city" value={values.city ?? ""} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="addressLine1">町名番地</Label>
              <Input id="addressLine1" name="addressLine1" value={values.addressLine1 ?? ""} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="addressLine2">建物名</Label>
              <Input id="addressLine2" name="addressLine2" value={values.addressLine2 ?? ""} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右: アカウント設定 */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>アカウント設定</CardTitle>
            <CardDescription>認証情報と権限を設定します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="role">ロール</Label>
              <select
                id="role"
                name="role"
                value={values.role}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <Label htmlFor="password">
                パスワード{mode === "create" ? "（必須）" : "（空なら変更しません）"}
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={values.password ?? ""}
                onChange={handleChange}
                required={mode === "create"}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "保存中..." : submitLabel ?? (mode === "create" ? "作成する" : "保存")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
