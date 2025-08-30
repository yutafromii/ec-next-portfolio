"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPut } from "@/app/lib/api";
import { User } from "@/app/interfaces/User";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User>({
    id: Number(id),
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await apiGet<User>(`http://localhost:8080/users/${id}`);
      setUser(data);
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await apiPut(`http://localhost:8080/users/${id}`, user);
    setLoading(false);
    router.push("/admin/users");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ユーザー編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="名前" name="name" value={user.name} onChange={handleChange} />
        <Input label="メール" name="email" value={user.email} onChange={handleChange} />
        <Input label="電話番号" name="phoneNumber" value={user.phoneNumber ?? ""} onChange={handleChange} />
        <Input label="住所" name="address" value={user.address ?? ""} onChange={handleChange} />
        <Input label="パスワード" name="password" type="password" value={user.password ?? ""} onChange={handleChange} />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          更新する
        </button>
      </form>
    </div>
  );
}

// 入力フィールドの共通化
function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 px-3 py-2 rounded"
      />
    </div>
  );
}
