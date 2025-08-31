const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Backend envelope: { success, message, data }
export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function isApiEnvelope<T = unknown>(v: unknown): v is ApiEnvelope<T> {
  return !!(
    v &&
    typeof v === "object" &&
    "success" in (v as any) &&
    "data" in (v as any)
  );
}

export class ApiError extends Error {
  status?: number;
  body?: string;
  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// 省メモリの簡易クエリビルダー（GETのクエリ生成用）
export function qs(params?: Record<string, unknown>) {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// タイムアウト（必要なら）
function withTimeout<T>(p: Promise<T>, ms = 15000) {
  let t: NodeJS.Timeout;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new ApiError(`Request timeout after ${ms}ms`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(t!));
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  { parse = "json", timeoutMs = 15000 }: { parse?: "json" | "text" | "blob"; timeoutMs?: number } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const method = (init.method || "GET").toUpperCase();

  // Avoid sending Content-Type on GET/HEAD to prevent unnecessary CORS preflight
  const baseHeaders: Record<string, string> = {};
  const hasBody = init.body != null;

  // Normalize header keys safely across HeadersInit variants
  const headerKeys = (h?: HeadersInit): Set<string> => {
    if (!h) return new Set();
    if (h instanceof Headers) return new Set(Array.from(h.keys()).map((k) => k.toLowerCase()));
    if (Array.isArray(h)) return new Set(h.map(([k]) => String(k).toLowerCase()));
    return new Set(Object.keys(h as Record<string, unknown>).map((k) => k.toLowerCase()));
  };

  if (hasBody && method !== "GET" && method !== "HEAD") {
    const keys = headerKeys(init.headers);
    // Avoid forcing JSON for multipart/form-data or other non-JSON bodies
    const b = init.body as unknown;
    const isFormData = typeof FormData !== "undefined" && b instanceof FormData;
    const isURLParams = typeof URLSearchParams !== "undefined" && b instanceof URLSearchParams;
    const isBlob = typeof Blob !== "undefined" && b instanceof Blob;

    if (!keys.has("content-type") && !isFormData && !isURLParams && !isBlob) {
      baseHeaders["Content-Type"] = "application/json";
    }
  }
  const res = await withTimeout(
    fetch(url, {
      credentials: "include",
      headers: { ...baseHeaders, ...(init.headers ?? {}) },
      ...init,
    }),
    timeoutMs
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(`HTTP ${res.status} ${res.statusText} at ${path}`, res.status, text);
  }

  if (res.status === 204) return undefined as T;
  if (parse === "text") return (await res.text()) as T;
  if (parse === "blob") return (await res.blob()) as T;
  const json = (await res.json()) as unknown;
  // Unwrap ApiEnvelope<T> transparently
  if (isApiEnvelope<T>(json)) return json.data as T;
  return json as T;
}

// 既存コードの移行を楽にする“薄いシム”
export const http = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put:  <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch:<T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete:<T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

// マルチパート送信用（画像アップなどで後々使う想定）
export async function apiUpload<T>(path: string, form: FormData, method: "POST" | "PUT" = "POST") {
  return apiFetch<T>(path, { method, body: form, headers: {} }); // Content-Type はブラウザが自動付与
}
