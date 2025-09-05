// /app/interfaces/User.ts

export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;

  // 旧: 単一文字列住所（互換用）
  address?: string;

  // 新: 分割住所
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;

  // ★ 追加
  role: Role;

  // あるならあるで受け取れるように（任意）
  isActive?: boolean;
  createdAt?: string; // ISO文字列
  updatedAt?: string; // ISO文字列
}

/**
 * 作成/更新の送信用ペイロード。
 * - create では password 必須（UI側で required 指定）
 * - edit では password は空なら未変更として送らないのが安全（UI側で delete してから送る）
 */
export interface UserUpsert {
  name: string;
  email: string;
  phoneNumber?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  role: Role;
  password?: string;
}
