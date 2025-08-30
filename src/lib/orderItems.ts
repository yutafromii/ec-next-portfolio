// lib/orderItems.ts

export interface OrderItem {
  id: number;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export const orderItems: OrderItem[] = [
  {
    id: 1,
    name: "BD 02 / LS / CTPL. BROADCLOTH. TEXTILE. COOLMAX®. RF",
    color: "BLUE",
    size: "X-LARGE",
    quantity: 1,
    price: 26400,
    imageUrl: "/images/haerin1.jpg",
  },
];
