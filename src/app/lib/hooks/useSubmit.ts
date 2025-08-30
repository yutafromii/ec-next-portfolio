// hooks/useSubmit.ts
import { useRouter } from "next/navigation";

// 汎用サブミットHook
type ApiFunction<T> = (url: string, data?: T) => Promise<unknown>;

interface SubmitOptions<T> {
  apiFunc: ApiFunction<T>;            // API関数（POST/PUT/DELETE共通）
  apiUrl: string;                     // APIエンドポイント
  setError: (msg: string) => void;    // エラーセット関数
  redirectPath?: string;              // 成功時のリダイレクト先（任意）
  onSuccess?: () => void;             // 成功時の追加処理（任意）
}

export function useSubmit<T>(
  form: T | undefined,
  options: SubmitOptions<T>
) {
  const router = useRouter();

  return async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await options.apiFunc(options.apiUrl, form);
      options.onSuccess?.();
      if (options.redirectPath) {
        router.push(options.redirectPath);
      }
    } catch (err) {
      console.error(err);
      options.setError("送信に失敗しました");
    }
  };
}
