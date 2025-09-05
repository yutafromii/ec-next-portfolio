// app/components/auth/register-form.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { http, persistAuthToken, ApiError } from "@/app/lib/api/client";
import { EP } from "@/app/lib/api/endpoints";
import { useUserStore } from "@/app/stores/userStore";
import { CartAPI } from "@/app/lib/api/carts";

// 登録フォームの型
interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

// /users/me の型（login-form と同一）
interface UserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
}

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const [user, setUser] = useState<RegisterUser>({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const setUserStore = useUserStore((s) => s.setUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // 登録→即ログイン→/me取得→保留再実行/同期→リダイレクト
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user.name || !user.email || !user.password) {
      setError("すべての項目を入力してください");
      return;
    }

    try {
      // 1) /auth/register
      await http.post(EP.auth.register(), user);

      // 2) 直後に /auth/login して token を得る
      const { token } = await http.post<{ token: string }>(EP.auth.login(), {
        email: user.email,
        password: user.password,
      });

      // 3) token 保存
      persistAuthToken(token);

      // 4) /users/me を取得→Zustand
      const me = await http.get<UserResponse>(EP.users.me());
      setUserStore(me);

      // 5) pendingAction 再実行（例：addToCart）
      const pending = localStorage.getItem("pendingAction");
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (parsed.type === "addToCart") {
            await CartAPI.add(parsed.data);
            localStorage.removeItem("pendingAction");
            router.push("/cart");
            return;
          }
        } catch (err) {
          console.error("pendingAction の再実行に失敗:", err);
        }
      }

      // 6) ゲストカート同期
      const pendingCart = localStorage.getItem("pendingCart");
      if (pendingCart) {
        try {
          const items: Array<{ productId: number; quantity: number }> = JSON.parse(pendingCart);
          for (const it of items) {
            await CartAPI.add({ productId: it.productId, quantity: it.quantity });
          }
          localStorage.removeItem("pendingCart");
        } catch (err) {
          console.error("ゲストカート同期に失敗:", err);
        }
      }

      // 7) リダイレクト
      router.push(redirectPath.startsWith("/") ? redirectPath : "/");
    } catch (err: unknown) {
      console.error("登録エラー:", err);
      if (err instanceof ApiError) {
        // バリデーション/重複メールなどの文言が body に来る場合は拾って表示
        setError(err.body || "登録に失敗しました。時間をおいて再度お試しください。");
      } else if (err instanceof Error) {
        setError(err.message || "登録に失敗しました");
      } else {
        setError("登録に失敗しました");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to sign up</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6">
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
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
                  required
                />
              </div>

              {error && <p className="text-red-500 -mt-2" role="alert">{error}</p>}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">Create account</Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
