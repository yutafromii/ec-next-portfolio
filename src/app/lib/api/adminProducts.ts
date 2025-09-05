import { http, qs } from "./client";
import { EP } from "./endpoints";
import type { Product } from "@/app/interfaces/Product";
import type { Page } from "@/app/interfaces/Page";

export const AdminProductsAPI = {
  page(params?: { page?: number; size?: number; q?: string; includeInactive?: boolean }) {
    return http.get<Page<Product>>(EP.admin.products.page() + qs(params));
  },
  byId(id: number | string) {
    return http.get<Product>(EP.admin.products.byId(id));
  },
  delete(id: number | string) {
    return http.delete<void>(EP.admin.products.byId(id));
  },
};
