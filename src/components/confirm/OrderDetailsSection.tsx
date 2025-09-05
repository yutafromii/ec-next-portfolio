// components/confirm/OrderDetailsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/app/stores/userStore";
import Section from "../common/Section";
import PaymentMethodSelect, { PaymentMethod } from "./PaymentMethodSelect";
import AddressBlock from "./AddressBlock";
import { useAddresses } from "@/app/lib/hooks/useAddress";
import type { Address as DeliveryAddress } from "@/app/lib/api/addresses";
import { AddressesAPI } from "@/app/lib/api/addresses";
import { lookupPostal } from "@/app/lib/postal/lookup";
import { http } from "@/app/lib/api/client";
import { EP } from "@/app/lib/api/endpoints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SHIPPING_UPDATED_EVENT,
  ADDRESSBOOK_UPDATED_EVENT,
} from "@/app/lib/hooks/useHasShipping";

type Shipping = {
  id?: number;
  name?: string | null;
  phoneNumber?: string | null;
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  address?: string | null;
};

export default function OrderDetailsSection({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user, setUser } = useUserStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [inquiry, setInquiry] = useState("");
  const { list: addrList, reload: reloadAddresses } = useAddresses(
    Boolean(user)
  );

  const [shipping, setShipping] = useState<Shipping | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [errorNew, setErrorNew] = useState<string | null>(null);

  // 住所自動入力用
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);

  // 住所追加フォーム（furigana を含む）
  const [newAddr, setNewAddr] = useState<Partial<DeliveryAddress>>({
    furigana: "",
  });

  const keyFor = (uid?: number | string) =>
    `checkout.shipping.${uid ?? "guest"}`;

  const normalizePostal = (raw?: string | null) => {
    const digits = (raw ?? "").replace(/[^0-9]/g, "");
    return digits.length === 7
      ? `${digits.slice(0, 3)}-${digits.slice(3)}`
      : raw ?? "";
  };

  // 空欄判定
  const isBlank = (v?: string | null) => !v || v.trim() === "";

  // プロフィールに十分な住所があるか
  const hasProfileAddress = () => {
    if (!user) return false;
    return Boolean(
      user.postalCode &&
        user.prefecture &&
        user.city &&
        (user.addressLine1 || user.address)
    );
  };

  // プロフィール住所を（初回のみ）更新
  const maybeUpdateProfileAddress = async (s: Shipping) => {
    if (!user) return;
    // すでにプロフィールに住所があるなら何もしない
    if (hasProfileAddress()) return;

    const payload = {
      // 名前・メールは登録済み想定なので送らない（必要なら追加可）
      postalCode: normalizePostal(s.postalCode ?? "") || undefined,
      prefecture: (s.prefecture ?? "").trim() || undefined,
      city: (s.city ?? "").trim() || undefined,
      addressLine1: (s.addressLine1 ?? "").trim() || undefined,
      addressLine2: (s.addressLine2 ?? "").trim() || undefined,
      // 電話番号はあれば反映
      phoneNumber: (s.phoneNumber ?? "").trim() || undefined,
    };

    await http.put(EP.users.me(), payload);

    // ローカルの user も即時更新（画面反映のため）
    setUser({
      ...user,
      postalCode: payload.postalCode ?? user.postalCode,
      prefecture: payload.prefecture ?? user.prefecture,
      city: payload.city ?? user.city,
      addressLine1: payload.addressLine1 ?? user.addressLine1,
      addressLine2: payload.addressLine2 ?? user.addressLine2,
      phoneNumber: payload.phoneNumber ?? user.phoneNumber,
      // 旧 address が未設定なら合成しておく（任意）
      address:
        user.address ??
        [
          payload.prefecture,
          payload.city,
          payload.addressLine1,
          payload.addressLine2,
        ]
          .filter(Boolean)
          .join(" "),
    });
  };

  // 初期 shipping 設定
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(keyFor(user.id));
      if (raw) {
        setShipping(JSON.parse(raw) as Shipping);
        return;
      }
    } catch {}
    const composed: Shipping = addrList?.[0]
      ? {
          name: addrList[0].name,
          phoneNumber: addrList[0].phone,
          postalCode: addrList[0].postalCode,
          prefecture: addrList[0].prefecture,
          city: addrList[0].city,
          addressLine1: addrList[0].addressLine1,
          addressLine2: addrList[0].addressLine2,
          address: addrList[0].address,
        }
      : {
          name: user.name,
          phoneNumber: user.phoneNumber,
          postalCode: user.postalCode,
          prefecture: user.prefecture,
          city: user.city,
          addressLine1: user.addressLine1,
          addressLine2: user.addressLine2,
          address: user.address,
        };
    setShipping(composed);
    try {
      localStorage.setItem(keyFor(user.id), JSON.stringify(composed));
    } catch {}
  }, [user, addrList]);

  // 住所帳との整合
  useEffect(() => {
    if (!user || !shipping) return;
    if (shipping.id && !addrList?.some((a) => a.id === shipping.id)) {
      const composed: Shipping = addrList?.[0]
        ? {
            name: addrList[0].name,
            phoneNumber: addrList[0].phone,
            postalCode: addrList[0].postalCode,
            prefecture: addrList[0].prefecture,
            city: addrList[0].city,
            addressLine1: addrList[0].addressLine1,
            addressLine2: addrList[0].addressLine2,
            address: addrList[0].address,
          }
        : {
            name: user.name,
            phoneNumber: user.phoneNumber,
            postalCode: user.postalCode,
            prefecture: user.prefecture,
            city: user.city,
            addressLine1: user.addressLine1,
            addressLine2: user.addressLine2,
            address: user.address,
          };
      setShipping(composed);
      try {
        localStorage.setItem(keyFor(user.id), JSON.stringify(composed));
      } catch {}
    }
  }, [user?.id, addrList, shipping?.id]);

  const handleChangeAddress = () => onOpenChange(true);

  // 初回（住所帳が0件）のときにバックエンドへ住所を作成 → プロフィールも更新 → 保存
  const persistIfFirstAddress = async (
    s: Shipping,
    opts?: { preferNew?: boolean }
  ) => {
    if (!user) return s;
    if (addrList && addrList.length > 0) return s;

    const furigana =
      (newAddr.furigana ?? "").trim() ||
      (opts?.preferNew ? "－" : (user.name ?? "").trim()) ||
      "－";

    const created = await AddressesAPI.create({
      name: s.name ?? user.name ?? "",
      furigana,
      phone: s.phoneNumber ?? user.phoneNumber ?? "",
      email: user.email ?? "",
      postalCode: s.postalCode ?? "",
      prefecture: s.prefecture ?? "",
      city: s.city ?? "",
      addressLine1: s.addressLine1 ?? "",
      addressLine2: s.addressLine2 ?? undefined,
      address:
        s.address ??
        [s.prefecture, s.city, s.addressLine1, s.addressLine2]
          .filter(Boolean)
          .join(" "),
    });

    const withId: Shipping = { ...s, id: created.id };

    // プロフィール側にも同住所を保存（プロフィールが未設定の場合のみ）
    await maybeUpdateProfileAddress(withId);

    // 住所帳の再取得（ラジオ一覧にも反映）
    await reloadAddresses?.();

    // 他のフックにも通知
    try {
      window.dispatchEvent(new Event(ADDRESSBOOK_UPDATED_EVENT));
    } catch {}

    return withId;
  };

  const saveShipping = (s: Shipping) => {
    setShipping(s);
    try {
      localStorage.setItem(keyFor(user?.id), JSON.stringify(s));
      window.dispatchEvent(new Event(SHIPPING_UPDATED_EVENT));
    } catch {}
    onOpenChange(false);
  };

  const useProfileAddress = async () => {
    if (!user) return;
    const profile: Shipping = {
      name: user.name,
      phoneNumber: user.phoneNumber,
      postalCode: user.postalCode,
      prefecture: user.prefecture,
      city: user.city,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      address: user.address,
    };
    const persisted = await persistIfFirstAddress(profile, {
      preferNew: false,
    });
    saveShipping(persisted);
  };

  // 未登録時は新規追加を開く
  useEffect(() => {
    if (open && (!addrList || addrList.length === 0)) setCreating(true);
  }, [open, addrList]);

  // 新規追加フォームオープン時に、空欄だけユーザー情報で補完
  useEffect(() => {
    if (!creating || !user) return;
    setNewAddr((prev) => ({
      ...prev,
      name: isBlank(prev.name) ? user.name ?? "" : prev.name,
      email: isBlank(prev.email) ? user.email ?? "" : prev.email,
      phone: isBlank(prev.phone) ? user.phoneNumber ?? "" : prev.phone,
      postalCode: isBlank(prev.postalCode)
        ? normalizePostal(user.postalCode ?? "")
        : prev.postalCode,
      prefecture: isBlank(prev.prefecture)
        ? user.prefecture ?? ""
        : prev.prefecture,
      city: isBlank(prev.city) ? user.city ?? "" : prev.city,
      addressLine1: isBlank(prev.addressLine1)
        ? user.addressLine1 ?? ""
        : prev.addressLine1,
      addressLine2: isBlank(prev.addressLine2)
        ? user.addressLine2 ?? ""
        : prev.addressLine2,
      address: isBlank(prev.address) ? user.address ?? undefined : prev.address,
      furigana: prev.furigana ?? "",
    }));
  }, [creating, user]);

  if (!user) {
    return (
      <div className="space-y-10 text-sm md:text-base">
        <Section title="ご注文者情報">
          <p>ログイン情報が取得できません</p>
        </Section>
      </div>
    );
  }

  const billing: Shipping = {
    name: user.name,
    phoneNumber: user.phoneNumber,
    postalCode: user.postalCode,
    prefecture: user.prefecture,
    city: user.city,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    address: user.address,
  };

  const selected: Shipping = (shipping ?? billing) as Shipping;
  const addrStr = (x: Shipping) =>
    [x.prefecture, x.city, x.addressLine1, x.addressLine2]
      .filter(Boolean)
      .join(" ") ||
    (x.address ?? "");
  const isSame =
    (billing.name ?? "") === (selected.name ?? "") &&
    (billing.phoneNumber ?? "") === (selected.phoneNumber ?? "") &&
    (billing.postalCode ?? "") === (selected.postalCode ?? "") &&
    addrStr(billing) === addrStr(selected);

  // 住所自動入力
  const handleAutoFill = async () => {
    setAutoError(null);
    try {
      setAutoLoading(true);
      const a = await lookupPostal(newAddr.postalCode || "");
      setNewAddr((prev) => ({
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

  // 新規追加の保存（モーダルの「この住所を使う」）
  const onUseNewAddress = async () => {
    setErrorNew(null);
    if (!(newAddr.name && (newAddr.furigana ?? "").trim())) {
      setErrorNew("お名前とフリガナを入力してください。");
      return;
    }
    const s: Shipping = {
      id: undefined,
      name: newAddr.name ?? user?.name ?? "",
      phoneNumber: newAddr.phone ?? user?.phoneNumber ?? "",
      postalCode: normalizePostal(newAddr.postalCode ?? ""),
      prefecture: newAddr.prefecture ?? "",
      city: newAddr.city ?? "",
      addressLine1: newAddr.addressLine1 ?? "",
      addressLine2: newAddr.addressLine2 ?? "",
      address: newAddr.address ?? null,
    };
    try {
      setSavingNew(true);
      const persisted = await persistIfFirstAddress(s, { preferNew: true });
      saveShipping(persisted);
    } catch (e) {
      console.error(e);
      setErrorNew("住所の保存に失敗しました。入力内容をご確認ください。");
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <>
      <div className="space-y-10 text-sm md:text-base">
        {/* ご注文者 */}
        <Section title="ご注文者（請求先・連絡先）">
          <AddressBlock
            name={user.name}
            address={user.address}
            postalCode={user.postalCode}
            prefecture={user.prefecture}
            city={user.city}
            addressLine1={user.addressLine1}
            addressLine2={user.addressLine2}
            phoneNumber={user.phoneNumber}
          />
        </Section>

        {/* 配送先 */}
        <Section title="配送先">
          <div className="relative">
            <div className="absolute -top-6 right-0 text-xs text-gray-500">
              {isSame ? "ご注文者と同じ配送先" : "この住所にお届け"}
            </div>
            <div
              className={`p-3 ${isSame ? "" : "ring-1 ring-blue-300 rounded"}`}
            >
              <AddressBlock
                label="お届け先"
                name={selected.name}
                address={selected.address}
                postalCode={selected.postalCode}
                prefecture={selected.prefecture}
                city={selected.city}
                addressLine1={selected.addressLine1}
                addressLine2={selected.addressLine2}
                phoneNumber={selected.phoneNumber}
                showChangeButton
                onClickChange={handleChangeAddress}
              />
            </div>
          </div>
        </Section>

        {/* お支払方法 */}
        <Section title="お支払方法">
          <PaymentMethodSelect
            value={paymentMethod}
            onChange={setPaymentMethod}
          />
        </Section>

        {/* お問い合わせ欄 */}
        <Section title="お問い合わせ欄">
          <textarea
            className="w-full p-2 border border-gray-300 min-h-[120px] resize-y"
            placeholder="お問い合わせ事項がございましたら、こちらにご入力ください。（3000文字まで）"
            value={inquiry}
            maxLength={3000}
            onChange={(e) => setInquiry(e.target.value)}
          />
          <div className="mt-1 text-right text-xs text-gray-500">
            {inquiry.length}/3000
          </div>
        </Section>
      </div>

      {/* 住所変更ダイアログ（親制御） */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配送先を選択</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            {addrList && addrList.length > 0 ? (
              <div className="space-y-3">
                {addrList.map((a) => {
                  const full =
                    [a.prefecture, a.city, a.addressLine1, a.addressLine2]
                      .filter(Boolean)
                      .join(" ") ||
                    a.address ||
                    "";
                  return (
                    <label
                      key={a.id}
                      className="flex items-start gap-3 p-2 border rounded cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={shipping?.id === a.id}
                        onChange={() =>
                          saveShipping({
                            id: a.id,
                            name: a.name,
                            phoneNumber: a.phone,
                            postalCode: a.postalCode,
                            prefecture: a.prefecture,
                            city: a.city,
                            addressLine1: a.addressLine1,
                            addressLine2: a.addressLine2,
                            address: a.address ?? null,
                          })
                        }
                      />
                      <span>
                        <span className="block font-medium">{a.name}</span>
                        {a.postalCode && (
                          <span className="block">〒{a.postalCode}</span>
                        )}
                        <span className="block">{full}</span>
                        {a.phone && <span className="block">{a.phone}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-600">
                お届け先が登録されていません。
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={useProfileAddress}
                className="w-full"
                disabled={!hasProfileAddress()}
                title={
                  !hasProfileAddress()
                    ? "プロフィールの住所が未設定です。「新しいお届け先を追加」から登録してください。"
                    : undefined
                }
              >
                ご注文者の住所を使う
              </Button>
              {!hasProfileAddress() && (
                <p className="mt-1 text-xs text-gray-500">
                  プロフィールの住所が未設定のため選択できません。
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="text-xs underline"
                onClick={() => setCreating((v) => !v)}
              >
                {creating ? "新規追加を閉じる" : "＋ 新しいお届け先を追加"}
              </button>
            </div>

            {creating && (
              <div className="space-y-2 p-3 border rounded">
                {/* お名前 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">お名前</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.name ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, name: e.target.value })
                    }
                  />
                </div>
                {/* フリガナ */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">フリガナ</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.furigana ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, furigana: e.target.value })
                    }
                    placeholder="ヤマダ タロウ"
                  />
                </div>
                {/* 郵便番号 + 住所自動入力 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">郵便番号</Label>
                  <div className="col-span-2 flex gap-2">
                    <Input
                      className="flex-1"
                      value={newAddr.postalCode ?? ""}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, postalCode: e.target.value })
                      }
                      placeholder="123-4567"
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
                </div>
                {autoError && (
                  <div className="grid grid-cols-3">
                    <div />
                    <div className="col-span-2 text-xs text-red-600">
                      {autoError}
                    </div>
                  </div>
                )}

                {/* 都道府県 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">都道府県</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.prefecture ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, prefecture: e.target.value })
                    }
                  />
                </div>
                {/* 市区町村 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">市区町村</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.city ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, city: e.target.value })
                    }
                  />
                </div>
                {/* 町名番地 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">町名番地</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.addressLine1 ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, addressLine1: e.target.value })
                    }
                  />
                </div>
                {/* 建物名 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">建物名</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.addressLine2 ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, addressLine2: e.target.value })
                    }
                  />
                </div>
                {/* 電話 */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">電話番号</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.phone ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, phone: e.target.value })
                    }
                  />
                </div>
                {/* メール */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right">メール</Label>
                  <Input
                    className="col-span-2"
                    value={newAddr.email ?? ""}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, email: e.target.value })
                    }
                  />
                </div>

                {errorNew && (
                  <p className="text-red-600 text-xs pt-1">{errorNew}</p>
                )}

                <DialogFooter>
                  <Button onClick={onUseNewAddress} disabled={savingNew}>
                    {savingNew ? "保存中..." : "この住所を使う"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
