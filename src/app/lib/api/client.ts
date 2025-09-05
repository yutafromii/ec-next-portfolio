const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Backend envelope: { success, message, data }
export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function isObjectRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isApiEnvelope<T = unknown>(v: unknown): v is ApiEnvelope<T> {
  return isObjectRecord(v) && "success" in v && "data" in v;
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

// ---- 401/403 ハンドラ（CSR側で設定） ----
type UnauthorizedHandler = (status: number, path: string) => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null) {
  unauthorizedHandler = fn;
}

// ---- Authorization 管理 ----
let authToken: string | null = null;

// 起動時に localStorage から拾う（CSRのみ）
(function bootstrapToken() {
  if (typeof window !== "undefined") {
    authToken =
      localStorage.getItem("token") ||
      localStorage.getItem("auth.token") ||
      null;
  }
})();

export function persistAuthToken(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}
export function clearAuthToken() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}
function getAuthToken(): string | null {
  // モジュールキャッシュ優先。なければ（タブ切替など考慮で）localStorageも見る
  return (
    authToken ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null)
  );
}

// ---- クエリ生成 ----
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

// ---- タイムアウト ----
function withTimeout<T>(p: Promise<T>, ms = 15000) {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new ApiError(`Request timeout after ${ms}ms`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(t!));
}

// HeadersInit を素直なオブジェクトへ
function headersToObject(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) {
    const o: Record<string, string> = {};
    h.forEach((v, k) => (o[k] = v));
    return o;
  }
  if (Array.isArray(h)) return Object.fromEntries(h.map(([k, v]) => [String(k), String(v)]));
  return h as Record<string, string>;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  { parse = "json", timeoutMs = 15000 }: { parse?: "json" | "text" | "blob"; timeoutMs?: number } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const method = (init.method || "GET").toUpperCase();

  // Content-Type は必要なときだけ自動付与
  const baseHeaders: Record<string, string> = {};
  const hasBody = init.body != null;

  if (hasBody && method !== "GET" && method !== "HEAD") {
    const keysLower = new Set(
      Object.keys(headersToObject(init.headers)).map((k) => k.toLowerCase())
    );
    const b = init.body as unknown;
    const isFormData = typeof FormData !== "undefined" && b instanceof FormData;
    const isURLParams = typeof URLSearchParams !== "undefined" && b instanceof URLSearchParams;
    const isBlob = typeof Blob !== "undefined" && b instanceof Blob;
    if (!keysLower.has("content-type") && !isFormData && !isURLParams && !isBlob) {
      baseHeaders["Content-Type"] = "application/json";
    }
  }

  // Authorization 自動付与（呼び出し側で明示指定がある場合は尊重）
  const incoming = headersToObject(init.headers);
  const combinedHeaders: Record<string, string> = { ...baseHeaders, ...incoming };
  const keysLowerAll = new Set(Object.keys(combinedHeaders).map((k) => k.toLowerCase()));
  if (!keysLowerAll.has("authorization")) {
    const token = getAuthToken();
    if (token) combinedHeaders["Authorization"] = `Bearer ${token}`;
  }

  // ---- Simple in-memory GET cache with in-flight dedup (parsed result) ----
  const CACHE_TTL_MS = 10_000; // 10s SWR-like short cache
  const isCacheable = method === "GET" && parse === "json";
  const cache = ensureGetCache();

  const now = Date.now();
  if (isCacheable) {
    const hit = cache.get(url);
    if (hit && hit.expiry > now) {
      return hit.promise as Promise<T>;
    }
    const p = withTimeout(
      fetch(url, { credentials: "include", headers: combinedHeaders, ...init }),
      timeoutMs
    ).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        if ((res.status === 401 || res.status === 403) && typeof window !== "undefined") {
          try { unauthorizedHandler?.(res.status, path); } catch {}
        }
        throw new ApiError(`HTTP ${res.status} ${res.statusText} at ${path}`, res.status, text);
      }
      if (res.status === 204) return undefined as unknown as T;
      const json = (await res.json()) as unknown;
      return isApiEnvelope<T>(json) ? (json.data as T) : (json as T);
    }).catch((e) => { cache.delete(url); throw e; });
    cache.set(url, { expiry: now + CACHE_TTL_MS, promise: p });
    return p as Promise<T>;
  }

  // Non-cacheable path
  const res = await withTimeout(
    fetch(url, { credentials: "include", headers: combinedHeaders, ...init }),
    timeoutMs
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if ((res.status === 401 || res.status === 403) && typeof window !== "undefined") {
      try { unauthorizedHandler?.(res.status, path); } catch {}
    }
    throw new ApiError(`HTTP ${res.status} ${res.statusText} at ${path}`, res.status, text);
  }
  if (res.status === 204) return undefined as T;
  if (parse === "text") return (await res.text()) as T;
  if (parse === "blob") return (await res.blob()) as T;
  const json = (await res.json()) as unknown;
  return isApiEnvelope<T>(json) ? (json.data as T) : (json as T);
}

// ---- GET 短期キャッシュ（型付き） ----
type ApiGetCacheEntry = { expiry: number; promise: Promise<unknown> };
type ApiGetCache = Map<string, ApiGetCacheEntry>;

declare global {
  var __API_GET_CACHE__: ApiGetCache | undefined;
}

function ensureGetCache(): ApiGetCache {
  if (!globalThis.__API_GET_CACHE__) {
    globalThis.__API_GET_CACHE__ = new Map<string, ApiGetCacheEntry>();
  }
  return globalThis.__API_GET_CACHE__!;
}

function clearGetCache() {
  globalThis.__API_GET_CACHE__?.clear();
}

// 既存コードの移行を楽にする“薄いシム”
export const http = {
  get:   <T>(path: string) => apiFetch<T>(path),
  post:  async <T>(path: string, body?: unknown) => {
    const res = await apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
    clearGetCache();
    return res;
  },
  put:   async <T>(path: string, body?: unknown) => {
    const res = await apiFetch<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
    clearGetCache();
    return res;
  },
  patch: async <T>(path: string, body?: unknown) => {
    const res = await apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
    clearGetCache();
    return res;
  },
  delete: async <T>(path: string) => {
    const res = await apiFetch<T>(path, { method: "DELETE" });
    clearGetCache();
    return res as T;
  },
  postVoid: async (path: string, body?: unknown) =>
    apiFetch<void>(
      path,
      { method: "POST", body: body ? JSON.stringify(body) : "{}" },
      { parse: "text" }
    ),
  postText: (path: string, body?: unknown) =>
    apiFetch<string>(
      path,
      { method: "POST", body: body ? JSON.stringify(body) : "{}" },
      { parse: "text" }
    ),
};

// マルチパート送信用（画像アップなど）
export async function apiUpload<T>(path: string, form: FormData, method: "POST" | "PUT" = "POST") {
  return apiFetch<T>(path, { method, body: form, headers: {} }); // Content-Type はブラウザが自動付与
}
