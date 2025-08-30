
import type { ID, Timestamped } from "./common";

export interface AddressResponse {
  id: number;
  name: string;
  furigana: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
}

export type Address = Timestamped & {
  id: ID;
  userId: ID;

  // 氏名
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;

  // 連絡先
  phone?: string;
  email?: string;

  // 住所
  postalCode: string;     // "123-4567" など
  prefecture: string;     // 例: "東京都"
  city: string;           // 市区町村
  address1: string;       // 番地等
  address2?: string;      // 建物名・部屋番号等

  isDefault?: boolean;    // 既定のお届け先か
};

export type CreateAddressRequest = Omit<Address, "id" | "userId" | keyof Timestamped> & {
  isDefault?: boolean;
};

export type UpdateAddressRequest = Partial<CreateAddressRequest> & { id: ID };
