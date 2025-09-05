"use client";

import { CheckCircle } from "lucide-react";
import { useAuthGuard } from "@/app/lib/hooks/useAuthGuard";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutCompletePage() {
  const authed = useAuthGuard("/cart");
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [seconds, setSeconds] = useState(2);
  const [orderNumber, setOrderNumber] = useState<string | number | undefined>(undefined);
  const [orderedAt, setOrderedAt] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const ok = sessionStorage.getItem("checkout.completed");
      if (!ok) {
        router.replace("/cart");
      } else {
        try { router.prefetch("/products"); } catch {}
        // 完了表示用の最終注文情報を取得
        try {
          const raw = sessionStorage.getItem("checkout.last");
          if (raw) {
            const obj = JSON.parse(raw) as { orderNumber?: string | number; orderedAt?: string };
            setOrderNumber(obj.orderNumber);
            setOrderedAt(obj.orderedAt);
          }
        } catch {}
        intervalRef.current = setInterval(() => {
          setSeconds((s) => (s > 0 ? s - 1 : s));
        }, 1000);
        timerRef.current = setTimeout(() => {
          try {
            sessionStorage.removeItem("checkout.completed");
            sessionStorage.removeItem("checkout.last");
          } catch {}
          router.replace("/products");
        }, 2000);
      }
    } catch {
      // セッションストレージが使えない環境では何もしない（従来通り表示）
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router]);
  if (!authed) return null;
  return (
    <div className="bg-[#f6f6f6] min-h-screen flex flex-col justify-center items-center px-4 py-16 text-center">
      <CheckCircle className="text-green-500 w-16 h-16 mb-4" />

      <h1 className="text-2xl font-bold mb-2 text-[#222]">
        ご注文ありがとうございます
      </h1>

      <p className="text-gray-600 mb-6">
        ご注文を受け付けました。<br />
        ご登録のメールアドレスに確認メールをお送りしました。
      </p>

      <div className="space-y-2 text-sm text-gray-700 mb-10">
        <p>注文番号：{orderNumber ?? ""}</p>
        <p>注文日時：{orderedAt ? new Date(orderedAt).toLocaleString() : ""}</p>
      </div>

      <p className="text-gray-500 mb-6">{seconds}秒後に商品一覧へ戻ります。</p>

      <Link href="/" className="bg-black text-white px-6 py-3 font-semibold hover:opacity-90 transition">トップページに戻る</Link>
    </div>
  );
}
