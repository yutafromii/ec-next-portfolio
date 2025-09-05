// /app/lib/api/auth.ts
import { http } from "./client";
import { EP } from "./endpoints";

export const AuthAPI = {
  logout() {
    // 本文を返さないので postVoid
    return http.postVoid(EP.auth.logout(), {});
  },
};
