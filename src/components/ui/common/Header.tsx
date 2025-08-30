"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { useUserStore } from "@/app/stores/userStore";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const { user } = useUserStore();
  
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDir = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) < 10) return;

      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", updateScrollDir);
    return () => window.removeEventListener("scroll", updateScrollDir);
  }, []);

  return (
    <>
      {/* ヘッダー */}
      <header
        className={`fixed top-0 left-0 w-full z-50 px-6 py-4 text-[#222] transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* 左上：ハンバーガー */}
          <button onClick={() => setMenuOpen(true)} aria-label="Open Menu">
            <Menu className="w-7 h-7 m-4" />
          </button>

          {/* 右上：ログイン・カート・マイページ */}
          <div className="flex items-center gap-6">
            {user ? (
              <Link href="/mypage" aria-label="My Page">
                <User className="w-6 h-6 m-2" />
              </Link>
            ) : (
              <Link href="/login" aria-label="Login">
                <LogIn className="w-6 h-6 m-2" />
              </Link>
            )}
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="w-6 h-6 m-2" />
            </Link>
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
              <Link href="/products" onClick={() => setMenuOpen(false)}>
                PRODUCTS
              </Link>
              <Link href="/mypage" onClick={() => setMenuOpen(false)}>
                MYPAGE
              </Link>
              <Link href="/info" onClick={() => setMenuOpen(false)}>
                INFO
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                LOGIN
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
