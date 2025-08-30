// 共通で使う型・列挙など

export type ID = number;

export type Timestamped = {
  createdAt?: string; // ISO文字列
  updatedAt?: string;
};

export type Money = number; // 表示時は toLocaleString() 前提

export type ImageRef = {
  url: string;
  alt?: string;
};

export type PageRequest = {
  page?: number;
  size?: number;
  sort?: string; // "createdAt,desc" 等
};

export type PageResult<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type ApiError = {
  message: string;
  status?: number;
};

export enum OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}
