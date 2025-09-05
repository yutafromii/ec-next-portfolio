import { http } from "./client";
import { EP } from "./endpoints";
import type { CreateOrderItem, OrderResponse } from "@/app/interfaces/Order";

export const OrdersAPI = {
  current() {
    // バックエンドは1件を返す仕様
    return http.get<OrderResponse | null>(EP.orders.current());
  },
  history() {
    // バックエンドが履歴一覧を返す場合に利用
    return http.get<OrderResponse[]>(EP.orders.history());
  },
  addOrUpdate(items: CreateOrderItem[]) {
    return http.post<OrderResponse>(EP.orders.addOrUpdate(), items);
  },
  checkout(items: CreateOrderItem[]) {
    return http.post<OrderResponse>(EP.orders.checkout(), items);
  },
};
