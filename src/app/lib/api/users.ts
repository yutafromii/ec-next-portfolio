// /app/lib/api/users.ts
import { http } from "./client";
import { EP } from "./endpoints";

export type UserMe = {
  id: number;
  name: string;
  address?: string | null;
  // 新アドレスフィールド（段階的移行）
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  phoneNumber?: string | null;
  email: string;
};

export type UpdateUserRequest = {
  name?: string;
  address?: string; // 旧（当面は互換のため残す）
  // 新アドレスフィールド（部分更新）
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  phoneNumber?: string;
  email?: string;
  password?: string; // 空や未指定なら変更なし
};

export const UsersAPI = {
  me() {
    return http.get<UserMe>(EP.users.me());
  },
  update(payload: UpdateUserRequest) {
    return http.put<UserMe>(EP.users.me(), payload);
  },
};
