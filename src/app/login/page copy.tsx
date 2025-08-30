// クライアントコンポーネントであることを示す
// ユーザー名とパスワードの入力欄を表示する
// ログインボタンを押したら、/api/auth/login に POST リクエストを送信する
// apiPost 関数を使う（先ほど作成済み）
// ログイン成功時はトップページ（/）にリダイレクトする
// エラーが返ってきたら、画面にエラーメッセージを表示する
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "../lib/api"; // 必要に応じてパス調整

interface User {
  username: string;
  password: string;
}

export default function Login() {
  const [user, setUser] = useState<User>({ username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.username || !user.password) {
      setError("ユーザー名とパスワードは必須です");
      return;
    }

    try {
      // Spring Boot 側のURLに変更（ポート番号は環境に応じて）
      await apiPost("http://localhost:8080/login", user);

      // ログイン成功 → トップページへ遷移
      router.push("/");
    } catch (err: unknown) {
      console.error("ログインエラー:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ログインに失敗しました");
      }
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">ログイン画面</h1>
      <form onSubmit={handleSubmit}>
        <p className="mb-4">
          <label>
            username:
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />
          </label>
        </p>
        <p className="mb-4">
          <label>
            password:
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              className="border rounded w-full p-2"
            />
          </label>
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div>
          <input
            type="submit"
            value="ログイン"
            className="bg-green-500 text-white px-6 py-2 rounded cursor-pointer"
          />
        </div>
      </form>
    </div>
  );
}
