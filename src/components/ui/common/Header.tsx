// /app/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogIn, LogOut, ShoppingCart, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/app/stores/userStore";
import { useCartStore } from "@/app/stores/cartStore";
import { useEnsureCart } from "@/app/lib/hooks/useEnsureCart";
import { AuthAPI } from "@/app/lib/api/auth";
import type { LucideIcon } from "lucide-react";

/* ▼ アイコン＋文字（縦並び） */
function IconWithLabel({
  icon: Icon,
  label,
  href,
  onClick,
  badge,
  ariaLabel,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  ariaLabel?: string;
}) {
  const content = (
    <div className="inline-flex flex-col items-center gap-1 text-[10px] md:text-xs leading-none cursor-pointer">
      <div className="relative">
        <Icon aria-hidden className="w-6 h-6 md:w-6 md:h-6 shrink-0" />
        {badge}
      </div>
      <span className="tracking-widest">{label}</span>
    </div>
  );
  return href ? (
    <Link
      href={href}
      aria-label={ariaLabel ?? label}
      className="inline-flex p-2 hover:opacity-80 transition"
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className="inline-flex p-2 hover:opacity-80 transition"
    >
      {content}
    </button>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  const { user /*, setUser, logout: logoutStore*/ } = useUserStore();
  const { items, clearCart } = useCartStore();
  const { loading: cartLoading } = useEnsureCart();

  // 未ログイン時はバッジを表示しない
  const totalQty = user
    ? items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)
    : 0;
  const isHeaderHidden = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (isHeaderHidden) return;
    let lastScrollY = window.scrollY;
    const updateScrollDir = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastScrollY) < 10) return;
      setScrollDirection(y > lastScrollY ? "down" : "up");
      lastScrollY = y;
    };
    window.addEventListener("scroll", updateScrollDir);
    return () => window.removeEventListener("scroll", updateScrollDir);
  }, [isHeaderHidden]);

  const handleLogout = async () => {
    try {
      await AuthAPI.logout(); // サーバ側Cookieを無効化
      // ここでクライアント状態もクリア
      try {
        // userStore のクリア（あなたの store API に合わせて一つ選択）
        // setUser?.(null);
        // logoutStore?.();
        // 最低限の確実策：ページリロードで状態リセット
        sessionStorage.removeItem(`checkout.shipping.${user?.id}`);
      } catch {}
      clearCart(); // カートUIも念のため空に
      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch (e) {
      alert("ログアウトに失敗しました。もう一度お試しください。");
    }
  };

  if (isHeaderHidden) return null;

  return (
    <>
      {/* ヘッダー */}
      <header
        className={`fixed top-0 left-0 w-full z-50 px-6 py-5 text-[#222] bg-white/80 backdrop-blur
        transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* 左：ハンバーガー（MENU） */}
          <IconWithLabel
            icon={Menu}
            label="MENU"
            onClick={() => setMenuOpen(true)}
            ariaLabel="Open Menu"
          />

          {/* 右：LOGIN/MYPAGE・CART */}
          <div className="flex items-center gap-6 md:gap-8">
            {user ? (
              <IconWithLabel icon={User} label="MYPAGE" href="/mypage" />
            ) : (
              <IconWithLabel icon={LogIn} label="LOGIN" href="/login" />
            )}
            <IconWithLabel
              icon={ShoppingCart}
              label="CART"
              href="/cart"
              badge={
                totalQty > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center shadow-sm">
                    {totalQty > 99 ? "99+" : totalQty}
                  </span>
                )
              }
              ariaLabel="Cart"
            />
          </div>
        </div>
      </header>

      {/* ナビゲーションメニュー（アニメーション付き） */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#222] text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 left-24 text-white z-10"
              aria-label="Close Menu"
            >
              <X className="w-7 h-7 m-4" />
            </button>

            <motion.div
              className="h-full flex flex-col items-center justify-center space-y-8 text-xl font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, y: 30 }}
            >
              <Link href="/" onClick={() => setMenuOpen(false)}>
                TOP PAGE
              </Link>
              <Link href="/products" onClick={() => setMenuOpen(false)}>
                PRODUCTS
              </Link>
              <Link href="/mypage" onClick={() => setMenuOpen(false)}>
                MYPAGE
              </Link>

              {/* ▼ ここを LOGIN / LOGOUT で出し分け */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="hover:opacity-80 transition flex items-center gap-2"
                >
                  LOGOUT
                </button>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  LOGIN
                </Link>
              )}

              <Link href="/admin" onClick={() => setMenuOpen(false)}>
                ADMIN
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
