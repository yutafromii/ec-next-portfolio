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
    // Try bulk fetch via query (?ids=1,2,3) if backend supports; fallback to N calls
    try {
      const qs = `ids=${ids.join(',')}`;
      const list = await http.get<Product[]>(EP.products.list(qs));
      if (Array.isArray(list) && list.length) return list;
    } catch {}
    return Promise.all(ids.map((id) => this.byId(id).catch(() => null))).then((arr) => arr.filter(Boolean) as Product[]);
  },
  update(id: number, body: Partial<Product>) {
    return http.put<Product>(EP.products.byId(id), body);
  },
  delete(id: number) {
    return http.delete<void>(EP.products.delete(id));
  },
};
