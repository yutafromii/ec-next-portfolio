"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutCompletePage() {
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
        <p>注文番号：123456789</p>
        <p>注文日時：2025年07月30日 22:15</p>
      </div>

      <Link
        href="/"
        className="bg-black text-white px-6 py-3 font-semibold hover:opacity-90 transition"
      >
        トップページに戻る
      </Link>
    </div>
  );
}
