import { http, qs } from "./client";
import { EP } from "./endpoints";
import type { AdminOrder, AdminOrderStatusUpdate } from "@/app/interfaces/AdminOrder";
import type { Page } from "@/app/interfaces/Page";

export const AdminOrdersAPI = {
  list(params?: { status?: string; q?: string; from?: string; to?: string; userId?: number | string }) {
    // build path using qs() which returns a leading '?'
    return http.get<AdminOrder[]>(EP.admin.orders.list() + qs(params));
  },
  page(params?: { page?: number; size?: number; status?: string; q?: string; from?: string; to?: string; userId?: number | string }) {
    return http.get<Page<AdminOrder>>(EP.admin.orders.page() + qs(params));
  },
  detail(id: number | string) {
    return http.get<AdminOrder>(EP.admin.orders.byId(id));
  },
  updateStatus(id: number | string, payload: AdminOrderStatusUpdate) {
    return http.patch<AdminOrder>(EP.admin.orders.updateStatus(id), payload);
  },
};
