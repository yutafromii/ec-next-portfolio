"use client";
import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { http } from "@/app/lib/api/client";
import { EP } from "@/app/lib/api/endpoints";
// import Link from "next/link";

// 型定義
interface RegisterUser {
  name: string;
  email: string;
  password: string;
}
export function RegisterForm({ className }: React.ComponentProps<"form">) {
  const [user, setUser] = useState<RegisterUser>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user.name || !user.email || !user.password  ) {
      setError("すべての項目を入力してください");
      return;
    }

    try {
      await http.post(EP.auth.register?.() ?? "/register", user);
      setSuccess("登録が完了しました。TOPページに移動します。");
      setTimeout(() => router.push("/"), 2000); // 2秒後にログイン画面へ
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("登録に失敗しました");
      }
    }
  };
  // 画面レイアウト
  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        
        
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="yourmail@text.com"
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder="password"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        <input type="submit" className="w-full" value="Create" />
      </div>
    </form>
  );
}
