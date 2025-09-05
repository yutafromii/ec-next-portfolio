// app/stores/userStore.ts
import { create } from "zustand";

// フロントの store で持つ最小限のユーザー型
export type StoreUser = {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string | null; // ← optional / null 許容
  address?: string | null;     // ← optional / null 許容（旧）
  // 新アドレス分割フィールド（段階的移行用）
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  password?: string;           // ← optional（基本は保持しない）
};

type UserState = {
  user: StoreUser | null;
  setUser: (user: StoreUser) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
