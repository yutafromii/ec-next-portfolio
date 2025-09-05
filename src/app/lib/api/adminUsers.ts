// /app/lib/api/adminUsers.ts
import { http, qs } from "./client";
import { EP } from "./endpoints";
import type { User } from "@/app/interfaces/User";
import type { Page } from "@/app/interfaces/Page";

// 共通フォームと整合するペイロード型（create でも edit でも使える）
export type AdminUserUpsert = {
  name: string;
  email: string;
  phoneNumber?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  role: "USER" | "ADMIN";
  // create では必須 / edit では空なら変更しない（フロント側で削ってから送るのが安全）
  password?: string;
};

export const AdminUsersAPI = {
  list() {
    return http.get<User[]>(EP.admin.users.list());
  },
  page(params?: { page?: number; size?: number }) {
    return http.get<Page<User>>(EP.admin.users.page() + qs(params));
  },

  byId(id: number | string) {
    return http.get<User>(EP.admin.users.byId(Number(id)));
  },

  create(payload: AdminUserUpsert) {
    // POST /admin/users
    return http.post<User>(EP.admin.users.list(), payload);
  },

  update(id: number | string, payload: Partial<AdminUserUpsert>) {
    // PUT /admin/users/:id
    // ※ パスワード空は送らない方が無難（呼び出し側で delete してから渡す）
    return http.put<User>(EP.admin.users.byId(Number(id)), payload);
  },

  delete(id: number | string) {
    return http.delete<void>(EP.admin.users.byId(Number(id)));
  },
};
