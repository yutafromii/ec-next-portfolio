// stores/addressStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Address {
  id: number;
  name: string;
  furigana: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
}

interface AddressState {
  addresses: Address[];
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: number) => void;
}

const initialAddresses: Address[] = [
  {
    id: 1,
    name: "山田 太郎",
    furigana: "ヤマダ タロウ",
    postalCode: "〒111-0000",
    address: "東京都渋谷区XX-XX-XX",
    phone: "080-0000-0000",
    email: "yamada@example.com",
  },
];

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: initialAddresses,
      addAddress: (address) =>
        set((state) => ({ addresses: [...state.addresses, address] })),
      updateAddress: (updatedAddress) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === updatedAddress.id ? updatedAddress : a
          ),
        })),
      deleteAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),
    }),
    {
      name: "address-store", // localStorageのキー名
      partialize: (state) => ({ addresses: state.addresses }), // 保存対象を限定
    }
  )
);
