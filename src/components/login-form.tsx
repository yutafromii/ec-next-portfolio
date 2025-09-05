// app/components/auth/login-form.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/app/stores/userStore";
import { http, ApiError, persistAuthToken } from "@/app/lib/api/client";
import { EP } from "@/app/lib/api/endpoints";
import { CartAPI } from "@/app/lib/api/carts";

interface LoginRequest {
  email: string;
  password: string;
}

// バックエンドの /users/me 形状に合わせて
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

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [loginUser, setLoginUser] = useState<LoginRequest>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const setUser = useUserStore((state) => state.setUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginUser((prev) => ({ ...prev, [name]: value }));
    if (name === "email") setEmailError("");
    if (name === "password") setPasswordError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    const email = loginUser.email.trim();
    const password = loginUser.password;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasError = false;
    if (!email) {
      setEmailError("メールアドレスは必須です。");
      hasError = true;
    } else if (!emailPattern.test(email)) {
      setEmailError("メールアドレスの形式が正しくありません。");
      hasError = true;
    }
    if (!password) {
      setPasswordError("パスワードは必須です。");
      hasError = true;
    }
    if (hasError) return;

    try {
      // 1) /auth/login → token
      const loginRes = await http.post<{ token: string }>(EP.auth.login(), { email, password });

      // 2) token を保存（以降の http.* に自動付与される）
      persistAuthToken(loginRes.token);

      // 3) /users/me を取得して Zustand に保存
      const me = await http.get<UserResponse>(EP.users.me());
      setUser(me);

      // 4) pendingAction（例：未ログイン時 addToCart）再実行
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

      // 5) ゲストカート同期（pendingCart）
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

      // 6) リダイレクト
      router.push(redirectPath.startsWith("/") ? redirectPath : "/");
    } catch (err: unknown) {
      console.error("ログインエラー:", err);
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError("メールアドレス、パスワードが正しくありません。");
      } else if (err instanceof ApiError) {
        setError("ログイン処理でエラーが発生しました。時間をおいて再度お試しください。");
      } else if (err instanceof Error) {
        setError(err.message || "エラーが発生しました。");
      } else {
        setError("エラーが発生しました。");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>メールアドレスとパスワードを入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  onChange={handleChange}
                  value={loginUser.email}
                  required
                />
                {emailError && <p className="text-red-500 text-sm" role="alert">{emailError}</p>}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  onChange={handleChange}
                  value={loginUser.password}
                  required
                />
                {passwordError && <p className="text-red-500 text-sm" role="alert">{passwordError}</p>}
              </div>

              {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">Login</Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">Sign up</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
