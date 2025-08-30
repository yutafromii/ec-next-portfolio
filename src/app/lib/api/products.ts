// /app/lib/api/products.ts
import { http } from "./client";
import { EP } from "./endpoints";
import type { Product } from "@/app/interfaces/Product";

export const ProductsAPI = {
  list() {
    return http.get<Product[]>(EP.products.list());
  },
  byId(id: number) {
    return http.get<Product>(EP.products.byId(id));
  },
  async byIds(ids: number[]) {
    if (!ids.length) return [] as Product[];
    return Promise.all(ids.map((id) => this.byId(id)));
  },
  delete(id: number) {
    return http.delete<void>(EP.products.delete(id));
  },
};
