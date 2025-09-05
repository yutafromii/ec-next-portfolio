// /app/lib/hooks/useHasShipping.ts
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useUserStore } from "@/app/stores/userStore";
import { useAddresses } from "@/app/lib/hooks/useAddress";

// 既存
export const SHIPPING_UPDATED_EVENT = "checkout:shippingUpdated";
// ★ 追加：住所帳の内容が変わったことを知らせるイベント
export const ADDRESSBOOK_UPDATED_EVENT = "checkout:addressBookUpdated";

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

const isValidShipping = (s?: Shipping | null) =>
  !!(s && s.name && s.postalCode && s.prefecture && s.city && (s.addressLine1 || s.address));

export function useHasShipping() {
  const { user } = useUserStore();
  // ★ reload を受け取る
  const { list: addrList, reload } = useAddresses(Boolean(user));
  const [localShipping, setLocalShipping] = useState<Shipping | null>(null);

  const keyFor = useCallback(
    (uid?: number | string) => `checkout.shipping.${uid ?? "guest"}`,
    []
  );

  const readFromStorage = useCallback(() => {
    if (!user) return setLocalShipping(null);
    try {
      const raw = localStorage.getItem(keyFor(user.id));
      if (!raw) return setLocalShipping(null);
      const parsed = JSON.parse(raw) as Shipping;
      setLocalShipping(isValidShipping(parsed) ? parsed : null);
    } catch {
      setLocalShipping(null);
    }
  }, [user, keyFor]);

  // 初期読み
  useEffect(() => { readFromStorage(); }, [readFromStorage]);

  // storage と カスタムイベントを購読
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!user) return;
      if (e.storageArea === localStorage && e.key === keyFor(user.id)) readFromStorage();
    };
    // 同タブ：選択配送先 or 住所帳の変更 → 再読込
    const onChanged = () => {
      readFromStorage();
      reload?.(); // ★ 住所帳リストも取り直す
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(SHIPPING_UPDATED_EVENT, onChanged);
    window.addEventListener(ADDRESSBOOK_UPDATED_EVENT, onChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SHIPPING_UPDATED_EVENT, onChanged);
      window.removeEventListener(ADDRESSBOOK_UPDATED_EVENT, onChanged);
    };
  }, [user, keyFor, readFromStorage, reload]);

  const hasProfileAddress = useMemo(() => {
    if (!user) return false;
    return !!(
      user.name &&
      user.postalCode &&
      user.prefecture &&
      user.city &&
      (user.addressLine1 || user.address)
    );
  }, [user]);

  const hasAddressBook = useMemo(() => {
    if (!addrList || addrList.length === 0) return false;
    return addrList.some(a =>
      isValidShipping({
        name: a.name,
        postalCode: a.postalCode,
        prefecture: a.prefecture,
        city: a.city,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        address: a.address,
      })
    );
  }, [addrList]);

  const needRegistration = useMemo(() => {
    if (!user) return true;
    if (isValidShipping(localShipping)) return false;
    if (hasAddressBook) return false;
    if (hasProfileAddress) return false;
    return true;
  }, [user, localShipping, hasAddressBook, hasProfileAddress]);

  const selectedShipping: Shipping | null =
    localShipping ||
    (addrList?.length
      ? {
          name: addrList[0].name,
          postalCode: addrList[0].postalCode,
          prefecture: addrList[0].prefecture,
          city: addrList[0].city,
          addressLine1: addrList[0].addressLine1,
          addressLine2: addrList[0].addressLine2,
          address: addrList[0].address,
        }
      : hasProfileAddress
      ? {
          name: user?.name ?? "",
          postalCode: user?.postalCode ?? "",
          prefecture: user?.prefecture ?? "",
          city: user?.city ?? "",
          addressLine1: user?.addressLine1 ?? "",
          addressLine2: user?.addressLine2 ?? "",
          address: user?.address ?? "",
        }
      : null);

  return { needRegistration, selectedShipping };
}
