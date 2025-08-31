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
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/app/stores/userStore";
import { http } from "@/app/lib/api/client";
import { EP } from "@/app/lib/api/endpoints";
import { CartAPI } from "@/app/lib/api/carts";

interface LoginRequest {
  email: string;
  password: string;
}

// バックエンドに合わせたユーザー型（UserResponse）
interface UserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loginUser, setLoginUser] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  // ZustandのsetUser取得
  const setUser = useUserStore((state) => state.setUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginUser.email || !loginUser.password) {
      setError("ユーザー名とパスワードは必須です");
      return;
    }

    try {
      // ログインAPI実行 → トークンを受け取る
      const loginRes = await http.post<{ token: string }>(EP.auth.login(), loginUser);

      // トークン保存
      localStorage.setItem("token", loginRes.token);

      // ユーザー情報取得
      const userData = await http.get<UserResponse>(EP.users.me());

      // Zustandに保存
      setUser(userData);

      // pendingAction があれば再実行
      const pending = localStorage.getItem("pendingAction");
      if (pending) {
        const parsed = JSON.parse(pending);
        if (parsed.type === "addToCart") {
          try {
            await CartAPI.add(parsed.data);
            localStorage.removeItem("pendingAction");
            router.push("/cart");
            return;
          } catch (error) {
            console.error("再実行に失敗しました", error);
            // エラー時はそのままリダイレクト（再実行は保持）
          }
        }
      }

      // 通常リダイレクト
      router.push(redirectPath.startsWith("/") ? redirectPath : "/");
    } catch (err: unknown) {
      console.error("ログインエラー:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("UsernameかPasswordが異なります。");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  onChange={handleChange}
                  required
                />
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
