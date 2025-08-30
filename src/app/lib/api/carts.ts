// /app/lib/api/cart.ts
import { http } from "./client";
import { EP } from "./endpoints";
import type {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "@/app/interfaces/Cart"; 

export const CartAPI = {
  me() {
    return http.get<CartResponse>(EP.carts.me());
  },
  // 追加 or 上書き兼用
  add(payload: AddToCartRequest) {
    return http.post<CartResponse>(EP.carts.me(), payload);
  },
  // 数量更新
  update(payload: UpdateCartItemRequest) {
    return http.put<CartResponse>(
      EP.carts.item(payload.cartItemId),
      { quantity: payload.quantity }
    );
  },
  // 行削除（DELETE /carts/me/items/{id} がある前提）
  deleteItem(cartItemId: number) {
    return http.delete<void>(EP.carts.item(cartItemId));
  },
  // 全クリア
  clear() {
    return http.delete<void>(EP.carts.me());
  },
};
