// interfaces/Product.ts

import type { ID, ImageRef, Money, Timestamped } from "./common";

// 最低限、現在フロントで使っている形に合わせる
export type Product = Timestamped & {
  id: ID;
  name: string;
  description: string;
  fabric?: string;
  category?: string;    // 追加: カテゴリ（"jacket" | "pants" | "shirt" 等）
  price: Money;          // カタログ上の標準価格
  stock?: number;
  isActive?: boolean;
  imageUrls: string[];   // 既存コードが参照
  message?: string;
};

// 将来のバリエーション対応に備える（バックエンドの方針に合わせやすい）
export type ProductVariant = {
  id?: ID;
  productId?: ID;
  sku?: string;
  color?: string;
  size?: string;
  price?: Money;       // 変動価格がある場合
  stock?: number;
  imageUrl?: string;   // バリエーション固有の画像
};

// 画像をオブジェクトで扱いたい時用（今は未使用でもOK）
export type ProductImage = ImageRef & {
  id?: ID;
  productId?: ID;
  order?: number;
};

// 一覧・バッチ取得で使う軽量版
export type ProductLite = {
  id: ID;
  name: string;
  imageUrl?: string;
};
