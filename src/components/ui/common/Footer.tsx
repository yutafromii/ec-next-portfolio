import { Instagram, Twitter, Facebook } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#222] text-[#f5f5f5] py-10 px-6 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* 左側：ブランド名 + コピーライト */}
        <div className="text-center md:text-left">
          <p className="font-semibold text-base">SAMPLE STORE</p>
          <p className="text-xs mt-1">&copy; {new Date().getFullYear()} SAMPLE Inc. All rights reserved.</p>
        </div>

        {/* 中央：ページリンク */}
        <div className="flex space-x-6">
          <Link href="/products" className="hover:opacity-70 transition">Products</Link>
          <Link href="/about" className="hover:opacity-70 transition">About</Link>
          <Link href="/contact" className="hover:opacity-70 transition">Contact</Link>
        </div>

        {/* 右側：SNSアイコン */}
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
