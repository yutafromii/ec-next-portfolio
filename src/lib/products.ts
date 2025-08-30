// lib/products.ts

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  subImages: string[];
  colors: string[];
  sizes: string[];
  fabric: string;
  price: number;
  sizeChart: {
    columns: string[];
    rows: {
      label: string;
      values: (string | number)[];
    }[];
  };
}

export const products: Product[] = [
  {
    id: 1,
    name: "BD 03 / SS / COTTON. BROADCLOTH. TEXTILE. THOMAS MASON",
    description:
      "THOMAS MASONのブロードストライプ生地を使用したボタンダウンシャツ。緩やかなラウンドカットのボックスタイプシルエット。",
    image: "/images/haerin1.jpg",
    subImages: [
      "/images/haerin1.jpg",
      "/images/haerin2.jpg",
      "/images/haerin3.jpg",
      "/images/haerin4.jpg",
      "/images/haerin5.jpg",
      "/images/haerin6.jpg",
    ],
    colors: ["BLUE", "RED"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "COTTON 100%",
    price: 37400,
    sizeChart: {
      columns: ["S", "M", "L", "XL"],
      rows: [
        { label: "Body length", values: [75, 78, 81, 84] },
        { label: "Shoulder width", values: [56, 58, 60, 62] },
        { label: "Chest width", values: [62, 65, 68, 71] },
        { label: "Sleeve length", values: [24.5, 25.5, 26.5, 27.5] },
      ],
    },
  },
  // 追加商品があればここに追加可能
];
