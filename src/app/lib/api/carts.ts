// /app/lib/api/carts.ts
import { http } from "./client";
import { EP } from "./endpoints";
import type {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "@/app/interfaces/Cart";

export const CartAPI = {
  /** ログイン中ユーザーのカート取得 */
  me() {
    return http.get<CartResponse>(EP.carts.me());
  },

  /** 数量“加算”系（商品詳細のカート投入などで使用） */
  add(payload: AddToCartRequest) {
    return http.post<CartResponse>(EP.carts.me(), payload);
  },

  /** 数量“セット”系：サーバで丸め → 新状態のカートを返す */
  update(payload: UpdateCartItemRequest) {
    return http.put<CartResponse>(EP.carts.item(payload.cartItemId), {
      quantity: payload.quantity,
    });
  },

  /** 1行削除 */
  deleteItem(cartItemId: number) {
    return http.delete<void>(EP.carts.item(cartItemId));
  },

  /** 全クリア */
  clear() {
    return http.delete<void>(EP.carts.me());
  },
};
