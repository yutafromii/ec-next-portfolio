// hooks/useFetchData.ts
import { useEffect, useState } from "react";
import { apiGet } from "@/app/lib/api";  // 既存のAPIユーティリティを利用

export function useFetchData<T>(url?: string, enabled: boolean = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url || !enabled) return;

    setLoading(true);
    apiGet<T>(url)
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError("データの取得に失敗しました。");
      })
      .finally(() => setLoading(false));
  }, [url, enabled]);

  return { data, error, loading };
}
