// app/components/layout/Footer.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Instagram, Twitter, Facebook, LogOut } from "lucide-react";
import { useUserStore } from "@/app/stores/userStore";
import { useCartStore } from "@/app/stores/cartStore";
import { AuthAPI } from "@/app/lib/api/auth";

export default function Footer() {
  const router = useRouter();
  const { user } = useUserStore();
  const { clearCart } = useCartStore();

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
      try {
        sessionStorage.removeItem(`checkout.shipping.${user?.id}`);
      } catch {}
      clearCart();
      router.replace("/login");
      router.refresh();
    } catch {
      alert("ログアウトに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <footer className="bg-[#222] text-[#f5f5f5] py-10 px-6 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* 左：ブランド名 + コピーライト */}
        <div className="text-center md:text-left">
          <Link href="/">
            <p className="font-semibold text-base">EC portfolio</p>
          </Link>
          <p className="text-xs mt-1">&copy; {new Date().getFullYear()} EC Inc. All rights reserved.</p>
        </div>

        {/* 中央：ページリンク（Login/Logout を出し分け） */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/products" className="hover:opacity-70 transition">Products</Link>
          <Link href="/cart" className="hover:opacity-70 transition">Cart</Link>
          <Link href="/mypage" className="hover:opacity-70 transition">Mypage</Link>
          <Link href="/contact" className="hover:opacity-70 transition">Contact</Link>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 hover:opacity-70 transition"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="hover:opacity-70 transition">Login</Link>
          )}
        </nav>

        {/* 右：SNSアイコン */}
        <div className="flex space-x-4">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram size={20} className="hover:opacity-70 transition" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter size={20} className="hover:opacity-70 transition" />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook size={20} className="hover:opacity-70 transition" />
          </a>
        </div>
      </div>
    </footer>
  );
}
