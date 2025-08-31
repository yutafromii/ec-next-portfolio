// 必要に応じてここを一元管理（将来パスが変わっても差し替え1箇所）
export const EP = {
  auth: {
    login: () => `/login`,
  },
  products: {
    list: () => `/products`,
    byId: (id: number) => `/products/${id}`,
    delete: (id: number) => `/products/${id}`,
    // 後で一括取得APIを生やしたら： byIds: (ids: number[]) => `/products?ids=${ids.join(",")}`
  },
  orders: {
    myHistory: () => `/orders`,
    create: () => `/orders/me`
  },
  carts: {
    me: () => `/carts/me`,
    item: (cartItemId: number) => `/carts/me/items/${cartItemId}`,
  },
  users: {
    me: () => `/users/me`,
  },
  deliveryAddresses: {
    list: () => `/delivery-addresses`,
    byId: (id: number) => `/delivery-addresses/${id}`,
  },
} as const;
