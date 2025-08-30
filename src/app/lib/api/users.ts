// /app/lib/api/users.ts
import { http } from "./client";
import { EP } from "./endpoints";

export type UserMe = {
  id: number;
  name: string;
  address?: string | null;
  phoneNumber?: string | null;
  email: string;
};

export type UpdateUserRequest = {
  name?: string;
  address?: string;
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
