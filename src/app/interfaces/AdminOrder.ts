import type { OrderItemDto } from "./Orders";

// 管理者向けの注文DTO（バックエンド想定）
// 最低限の互換性を持たせるため、id/orderId のどちらでも扱えるようにする
export type AdminOrder = {
  id?: number | string;
  orderId?: number | string;
  orderNumber?: string;
  userId: number;
  userName?: string;
  total: number;
  status?: string;
  orderedAt?: string;
  items: OrderItemDto[];
};

export type AdminOrderStatusUpdate = {
  status: string;
};

