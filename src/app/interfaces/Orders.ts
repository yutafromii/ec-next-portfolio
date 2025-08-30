export type OrderItemDto = {
  id: number;
  productId: number;
  productName?: string;
  price: number;
  quantity: number;
  subtotal?: number;
};
export type OrderResponse = {
  orderId: number;
  total: number;
  items: OrderItemDto[];
  orderedAt?: string;
  status?: string;
};