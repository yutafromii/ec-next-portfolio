// /app/components/mypage/DeliveryAddressList.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupPostal } from "@/app/lib/postal/lookup";

import type { Address, AddressUpsertRequest } from "@/app/lib/api/addresses";
import { useAddresses } from "@/app/lib/hooks/useAddress";

type FormState = AddressUpsertRequest;

const EMPTY: FormState = {
  name: "",
  furigana: "",
  postalCode: "",
  prefecture: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  phone: "",
  email: "",
};

export default function DeliveryAddressList() {
  const { list, loading, error, create, update, remove } = useAddresses(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const editing = useMemo(() => editingId !== null, [editingId]);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (addr: Address) => {
    const nn = (v?: string | null) => v ?? ""; // null/undefined → ""

    setEditingId(addr.id);
    setForm({
      ...EMPTY,
      name: nn(addr.name),
      furigana: nn(addr.furigana),
      postalCode: nn(addr.postalCode),
      prefecture: nn(addr.prefecture),
      city: nn(addr.city),
      addressLine1: nn(addr.addressLine1),
      addressLine2: nn(addr.addressLine2),
      phone: nn(addr.phone),
      email: nn(addr.email),
    } satisfies FormState);
    setOpen(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as {
      name: keyof FormState;
      value: string;
    };
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoFill = async () => {
    setAutoError(null);
    try {
      setAutoLoading(true);
      const a = await lookupPostal(form.postalCode || "");
      setForm((prev) => ({
        ...prev,
        prefecture: prev.prefecture || a.prefecture,
        city: prev.city || a.city,
        addressLine1: prev.addressLine1 || (a.town ?? ""),
      }));
    } catch (e) {
      setAutoError(
        e instanceof Error ? e.message : "住所の自動入力に失敗しました"
      );
    } finally {
      setAutoLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const postal = (form.postalCode ?? "").replace(/[^0-9]/g, "");
      const normalizedPostal =
        postal.length === 7
          ? `${postal.slice(0, 3)}-${postal.slice(3)}`
          : form.postalCode ?? "";

      const payload: FormState = {
        ...form,
        postalCode: normalizedPostal,
      } as FormState;

      if (editing) {
        await update(editingId!, payload);
      } else {
        await create(payload);
      }
      setOpen(false);
      setEditingId(null);
      setForm(EMPTY);
    } catch (e) {
      alert("登録・更新に失敗しました。");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("削除してもよろしいですか？")) return;
    try {
      await remove(id);
    } catch (e) {
      alert("削除に失敗しました。");
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-8 px-4 md:px-8 lg:px-16">
      <p className="text-sm font-medium">
        {list.length}件のお届け先があります。
      </p>

      <Button
        variant="outline"
        className="rounded-none text-sm"
        onClick={openNew}
      >
        新規お届け先を追加する
      </Button>

      {list.map((a) => (
        <div
          key={a.id}
          className="border border-border p-4 flex flex-col md:flex-row justify-between items-start text-sm gap-4"
        >
          <div>
            <p>{a.name}</p>
            <p>
              {a.postalCode ? `〒${a.postalCode}` : ""}{" "}
              {[a.prefecture, a.city, a.addressLine1, a.addressLine2]
                .filter(Boolean)
                .join(" ") ||
                a.address ||
                ""}
            </p>
            <p>{a.phone}</p>
            <p>{a.email}</p>
          </div>
          <div className="flex gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none w-20"
              onClick={() => openEdit(a)}
            >
              変更
            </Button>
          </div>
        </div>
      ))}

      {/* 右サイドパネル */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="!w-full sm:!w-4/5 md:!w-2/3 lg:!w-1/2 !max-w-none h-screen overflow-y-auto p-6 bg-white"
        >
          <SheetHeader>
            <SheetTitle className="text-lg">
              {editing ? "お届け先を変更" : "お届け先を追加"}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            {(
              [
                { id: "name", label: "お名前", placeholder: "山田 太郎" },
                {
                  id: "furigana",
                  label: "フリガナ",
                  placeholder: "ヤマダ タロウ",
                },
                {
                  id: "postalCode",
                  label: "郵便番号",
                  placeholder: "123-4567",
                },
                { id: "prefecture", label: "都道府県", placeholder: "東京都" },
                { id: "city", label: "市区町村", placeholder: "新宿区" },
                {
                  id: "addressLine1",
                  label: "町名番地",
                  placeholder: "○○○1-2-3",
                },
                {
                  id: "addressLine2",
                  label: "建物名・部屋番号",
                  placeholder: "XXビル101",
                },
                {
                  id: "phone",
                  label: "電話番号",
                  placeholder: "080-1234-5678",
                },
                {
                  id: "email",
                  label: "メール",
                  placeholder: "sample@example.com",
                },
              ] as const
            ).map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
              >
                <Label htmlFor={f.id} className="md:text-right">
                  {f.label}
                </Label>
                {f.id === "postalCode" ? (
                  <div className="md:col-span-2 flex gap-2">
                    <Input
                      id={f.id}
                      name={f.id}
                      placeholder={f.placeholder}
                      className="rounded-none placeholder:text-[#d6d6d6]"
                      value={form[f.id as keyof FormState] ?? ""}
                      onChange={onChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAutoFill}
                      disabled={autoLoading}
                    >
                      {autoLoading ? "検索中..." : "住所自動入力"}
                    </Button>
                  </div>
                ) : (
                  <Input
                    id={f.id}
                    name={f.id}
                    placeholder={f.placeholder}
                    className="md:col-span-2 rounded-none placeholder:text-[#d6d6d6]"
                    value={form[f.id as keyof FormState] ?? ""}
                    onChange={onChange}
                  />
                )}
                {f.id === "postalCode" && autoError && (
                  <div className="md:col-start-2 md:col-span-2 text-xs text-red-600">
                    {autoError}
                  </div>
                )}
              </div>
            ))}

            <div className="text-center mt-8">
              <Button
                type="submit"
                className="rounded-none px-20 py-6 hover:cursor-pointer"
              >
                {editing ? "変更する" : "登録する"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
