// types/order.ts
import type { ID, Money, OrderStatus } from "./common";

// バックエンドのDTOに合わせる（現在の実装）
export type OrderItemDto = {
  id: ID;
  productId: ID;
  productName: string;
  productDescription?: string;
  price: Money;
  quantity: number;
  subtotal: Money;
  // ここに後で purchasePrice / snapshotImage など追加予定
};

export type OrderResponse = {
  orderId: ID;
  orderNumber?: string;
  status?: OrderStatus | string; // DTOで日本語変換されるなら string でも可
  orderedAt?: string;
  total: Money;
  items: OrderItemDto[];
};

// 画面表示用の整形済みモデル（Mapperで作る）
export type OrderView = {
  id: ID;
  orderNumber?: string;
  dateLabel: string;
  statusLabel: string;
  totalLabel: string;
  items: Array<{
    id: ID;
    name: string;
    imageUrl: string;
    quantity: number;
    priceLabel: string;
  }>;
};
export type CreateOrderItem = { productId: number; quantity: number };