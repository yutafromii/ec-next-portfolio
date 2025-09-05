// 必要に応じてここを一元管理（将来パスが変わっても差し替え1箇所）
export const EP = {
  auth: {
    login: () => `/login`,
    register: () => `/register`,
    logout:  () => `/logout`,
  },
  products: {
    list: (qs?: string) => `/products${qs ? `?${qs}` : ""}`,
    byId: (id: number) => `/products/${id}`,
    delete: (id: number) => `/products/${id}`,
    // 後で一括取得APIを生やしたら： byIds: (ids: number[]) => `/products?ids=${ids.join(",")}`
  },
  orders: {
    // 現在の注文（1件）取得
    current: () => `/orders/me`,
    // 明細追加/数量加算（必要なら）
    addOrUpdate: () => `/orders/me`,
    // チェックアウト（在庫検証＋確定）
    checkout: () => `/orders/checkout`,
    // 履歴一覧（バックエンド実装時に有効）
    history: () => `/orders/history`,
  },
  admin: {
    orders: {
      list: (qs?: string) => `/admin/orders${qs ? `?${qs}` : ""}`,
      page: (qs?: string) => `/admin/orders${qs ? `?${qs}` : ""}`,
      byId: (id: number | string) => `/admin/orders/${id}`,
      updateStatus: (id: number | string) => `/admin/orders/${id}/status`,
    },
    products: {
      page: (qs?: string) => `/admin/products${qs ? `?${qs}` : ""}`,
      byId: (id: number | string) => `/admin/products/${id}`,
    },
    users: {
      list: (qs?: string) => `/admin/users${qs ? `?${qs}` : ""}`,
      page: (qs?: string) => `/admin/users${qs ? `?${qs}` : ""}`,
      byId: (id: number | string) => `/admin/users/${id}`,
    },
  },
  carts: {
    me: () => `/carts/me`,
    item: (cartItemId: number) => `/carts/me/items/${cartItemId}`,
    clear: () => `/carts/me`,
  },
  users: {
    me: () => `/users/me`,
  },
  deliveryAddresses: {
    list: () => `/delivery-addresses`,
    me: () => `/delivery-addresses/me`,
    byId: (id: number) => `/delivery-addresses/${id}`,
  },
} as const;
