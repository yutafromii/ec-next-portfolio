"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { http } from "@/app/lib/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post("/users", formData);
      router.push("/admin/users");
    } catch (error) {
      console.error("ユーザー作成失敗", error);
      alert("ユーザー作成に失敗しました");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ユーザー新規作成</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>名前</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>メール</Label>
          <Input
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>電話番号</Label>
          <Input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>住所</Label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>パスワード</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>ロール</Label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <Button type="submit" className="w-full">
          作成する
        </Button>
      </form>
    </div>
  );
}
