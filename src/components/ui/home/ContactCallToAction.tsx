"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function ContactCallToAction() {
  return (
    <section className="py-20 px-6 md:px-12 bg-white border-t border-[#d6d6d6]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#222]">Contact</h2>
        <p className="text-sm md:text-base text-[#444] mb-6">
          商品に関するご質問やご相談は、お気軽にお問い合わせください。
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 border border-[#222] text-[#222] text-sm font-medium hover:bg-[#222] hover:text-white transition-colors"
        >
          <Mail size={16} />
          お問い合わせフォームへ
        </Link>
      </div>
    </section>
  );
}
