import { http } from "./client";
import { EP } from "./endpoints";
import type { CreateOrderItem, OrderResponse } from "@/app/interfaces/Order";

export const OrdersAPI = {
  myHistory() {
    return http.get<OrderResponse[]>(EP.orders.myHistory());
  },
  create(items: CreateOrderItem[]) {
    return http.post<OrderResponse>(EP.orders.create(), items);
  },
};
