import type { ID, Money } from "./common";

// Zustand の cartStore に概ね合わせる
export type CartItem = {
  id: ID;            // 行ID（サーバ側の CartItem ID があるならそれ）
  productId: ID;
  name?: string;     // 表示最適化で埋めることがある
  price: Money;      // 追加時の単価（バックエンド確定後はスナップショット化の予定）
  quantity: number;
  subtotal: Money;   // price * quantity（計算で作ってもOK）
  imageUrl?: string; // 表示用補完
  color?: string;
  size?: string;
};

export type Cart = {
  id?: ID;
  userId?: ID;
  items: CartItem[];
  total: Money;
};

// API用の最低限のリクエスト/レスポンス
export type AddToCartRequest = {
  productId: ID;
  quantity: number;
  // color?: string;
  // size?: string;
};

export type UpdateCartItemRequest = {
  cartItemId: ID;
  quantity: number;
};

export type CartResponse = Cart;
