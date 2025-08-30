'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/app/lib/api";


interface RegisterUser {
  username: string;
  password: string;
  name: string;
  email: string;
}

export default function Register() {
  const [user, setUser] = useState<RegisterUser>({
    username: "",
    password: "",
    name: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user.username || !user.password || !user.name || !user.email) {
      setError("すべての項目を入力してください");
      return;
    }

    try {
      await apiPost("http://localhost:8080/register", user);
      setSuccess("登録が完了しました。ログイン画面に移動します。");
      setTimeout(() => router.push("/login"), 2000); // 2秒後にログイン画面へ
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("登録に失敗しました");
      }
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">ユーザー登録</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          ユーザー名:
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        <label className="block mb-4">
          パスワード:
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        <label className="block mb-4">
          表示名:
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        <label className="block mb-4">
          メールアドレス:
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          登録
        </button>
      </form>
    </div>
  );
}
