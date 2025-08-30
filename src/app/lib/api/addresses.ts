// /app/lib/api/addresses.ts
import { http } from "./client";
import { EP } from "./endpoints";

export type Address = {
  id: number;
  name: string;
  furigana: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
};

export type AddressUpsertRequest = Omit<Address, "id">;

export const AddressesAPI = {
  list() {
    return http.get<Address[]>(EP.deliveryAddresses.list());
  },
  create(payload: AddressUpsertRequest) {
    return http.post<Address>(EP.deliveryAddresses.list(), payload);
  },
  update(id: number, payload: AddressUpsertRequest) {
    return http.put<Address>(EP.deliveryAddresses.byId(id), payload);
  },
  delete(id: number) {
    return http.delete<void>(EP.deliveryAddresses.byId(id));
  },
};
