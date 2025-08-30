// lib/orders.ts

export const orders = [
  {
    id: "ORD-20250730001",
    userId: 1, // ← 追加
    date: "2025-07-30",
    total: 12800,
    status: "配送準備中",
    items: [
      {
        id: "1",
        name: "ミリタリージャケット",
        quantity: 1,
        price: 6800,
        imageUrl: "/images/haerin1.jpg",
      },
      {
        id: "2",
        name: "カーゴパンツ",
        quantity: 1,
        price: 6000,
        imageUrl: "/images/haerin2.jpg",
      },
    ],
  },
  // 必要なら別ユーザー用のデータも追加可能
];
