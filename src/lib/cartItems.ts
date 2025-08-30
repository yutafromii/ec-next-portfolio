// app/data/cartItems.ts

export interface CartItem {
  id: number;
  image: string;
  title: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export const cartItems: CartItem[] = [
  {
    id: 1,
    image: "/images/haerin1.jpg",
    title: "SMOCK / JACKET / NYCO. WEATHER. CORDURA®",
    color: "OLIVE DRAB",
    size: "MEDIUM",
    price: 44000,
    quantity: 1,
  },
  {
    id: 2,
    image: "/images/haerin2.jpg",
    title: "UTILITY / PANTS / NYCO. RIPSTOP®",
    color: "BLACK",
    size: "LARGE",
    price: 33000,
    quantity: 2,
  },
];
