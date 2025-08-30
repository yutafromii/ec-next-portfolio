// app/stores/cartStore.ts
import { create } from "zustand";
import type { CartItem as ICartItem } from "@/app/interfaces/Cart"; // ← これを唯一の仕様に

// 旧コードの productName などを受け取っても壊れないように一時的に互換で受ける
type CompatItem = ICartItem & {
  productName?: string;        // 旧フィールド（段階的置換のための受け口）
  productDescription?: string; // 旧フィールド（使わないが無害に吸収）
};

type CartState = {
  items: ICartItem[];
  setItems: (items: ICartItem[]) => void;
  addItem: (item: ICartItem | CompatItem) => void;   // ← 互換で受ける
  updateQuantity: (productId: number, quantity: number) => void; // 既存シグネチャを維持
  removeItem: (cartItemId: number) => void;
  clearCart: () => void;
};

const clampQty = (q: number, max = 999) => Math.max(1, Math.min(q, max));

// ★ 入口で“正規化”して store の形に揃える（旧名→新名 / subtotal補完）
const toStoreItem = (raw: ICartItem | CompatItem): ICartItem => ({
  ...raw,
  name: raw.name ?? ("productName" in raw ? raw.productName : "") ?? "",
  subtotal: raw.subtotal ?? raw.price * raw.quantity,
});


export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // 直接 ICartItem[] を受ける場合も、念のため正規化を通す
  setItems: (items) => set({ items: items.map(toStoreItem) }),

  addItem: (raw) =>
    set((state) => {
      const item = toStoreItem(raw);
      const exists = state.items.find((i) => i.productId === item.productId);
      if (exists) {
        const qty = clampQty(exists.quantity + item.quantity);
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: qty, subtotal: i.price * qty }
              : i
          ),
        };
      }
      const qty = clampQty(item.quantity);
      return {
        items: [...state.items, { ...item, quantity: qty, subtotal: item.price * qty }],
      };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const q = clampQty(quantity);
      return {
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity: q, subtotal: i.price * q } : i
        ),
      };
    }),

  removeItem: (cartItemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== cartItemId) })),

  clearCart: () => set({ items: [] }),
}));
