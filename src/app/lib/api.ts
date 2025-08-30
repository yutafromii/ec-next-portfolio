// apiPost 関数を定義する。
// 第一引数はエンドポイント（例: /api/auth/login）
// 第二引数は送信するデータ（JSON形式）
// Content-Type を application/json に指定して POST 送信する。
// サーバーからのレスポンスがエラーの場合は例外を投げる。
// レスポンスの JSON を返す。
// lib/api.ts

// 共通のエラーハンドリング関数
async function handleResponse<T>(response: Response, url: string, method: string): Promise<T> {
  if (response.status === 204) {
    // No Content（成功だけど本文なし）の場合は null を返す
    return null as T;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${method} ${url} failed (${response.status}): ${errorText}`);
  }

  // 本文が存在する場合のみパース
  return response.json();
}


// GETメソッド
export async function apiGet<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Cookieの送信を有効化
  });
  return handleResponse<T>(response, url, "GET");
}

// POSTメソッド
export async function apiPost<T = unknown>(url: string, data: unknown): Promise<T> {
  console.log("API叩く前");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  console.log("API叩く後");
  return handleResponse<T>(response, url, "POST");
}

// PUTメソッド
export async function apiPut<T = unknown>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response, url, "PUT");
}

// DELETEメソッド
export async function apiDelete<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return handleResponse<T>(response, url, "DELETE");
}


// トークン処理
export const apiPostWithToken = async <T>(
  url: string,
  data: unknown
): Promise<T> => {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`POST failed: ${res.status}`);
  }

  return res.json();
};
