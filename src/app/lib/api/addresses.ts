// /app/lib/api/addresses.ts
import { http } from "./client";
import { EP } from "./endpoints";

// --- Response 型（サーバからは null が来る可能性を許容）---
export type Address = {
  id: number;
  name: string;
  furigana?: string | null;
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  // 旧形式
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

// --- Request 型（フロントからは null を送らない方針）---
export type AddressUpsertRequest = {
  name?: string;
  furigana?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  // 旧形式
  address?: string;
  phone?: string;
  email?: string;
};

// 呼び出し側が null を持っていても渡せるようにするための "Like" 型
export type AddressUpsertLike = {
  [K in keyof AddressUpsertRequest]?: string | null | undefined;
};

// null / 空文字 を自動で取り除く正規化関数（公開して他でも使えるように）
export function sanitizeAddressUpsert(input: AddressUpsertLike): AddressUpsertRequest {
  const pick = (v?: string | null) => {
    if (v == null) return undefined;               // null/undefined は送らない
    const s = String(v).trim();
    return s === "" ? undefined : s;               // 空文字も送らない
  };
  return {
    ...(pick(input.name) && { name: pick(input.name)! }),
    ...(pick(input.furigana) && { furigana: pick(input.furigana)! }),
    ...(pick(input.postalCode) && { postalCode: pick(input.postalCode)! }),
    ...(pick(input.prefecture) && { prefecture: pick(input.prefecture)! }),
    ...(pick(input.city) && { city: pick(input.city)! }),
    ...(pick(input.addressLine1) && { addressLine1: pick(input.addressLine1)! }),
    ...(pick(input.addressLine2) && { addressLine2: pick(input.addressLine2)! }),
    ...(pick(input.address) && { address: pick(input.address)! }),
    ...(pick(input.phone) && { phone: pick(input.phone)! }),
    ...(pick(input.email) && { email: pick(input.email)! }),
  };
}

export const AddressesAPI = {
  list() {
    return http.get<Address[]>(EP.deliveryAddresses.me());
  },

  // create/update は "Like" を受け取って内部で sanitize
  create(payload: AddressUpsertLike) {
    return http.post<Address>(EP.deliveryAddresses.list(), sanitizeAddressUpsert(payload));
  },

  update(id: number, payload: AddressUpsertLike) {
    return http.put<Address>(EP.deliveryAddresses.byId(id), sanitizeAddressUpsert(payload));
  },

  delete(id: number) {
    return http.delete<void>(EP.deliveryAddresses.byId(id));
  },
};
