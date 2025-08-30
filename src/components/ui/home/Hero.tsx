"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero() {
  const [paddingX, setPaddingX] = useState(48);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newPadding = Math.max(0, 48 - scrollY / 5);
      setPaddingX(newPadding);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="bg-white overflow-hidden">
      {/* Welcome 文言 */}
      <div className="h-[calc(80vh-200px)] flex justify-center items-center px-12">
        <h1
          className={`text-center text-4xl md:text-4xl font-bold text-base tracking-wide transform transition-all duration-700 ease-out
            ${show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}
          `}
        >
          EC Portfolio
        </h1>
      </div>

      {/* Hero画像セクション */}
      <div
        className={`relative w-full h-[80vh] overflow-hidden transform transition-all duration-700 ease-out
          ${show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-00"}
        `}
        style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px` }}
      >
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src="/images/haerin.jpg"
            alt="Hero Scroll Expand"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Heroテキスト（画像の中） */}
          <div className="absolute bottom-8 left-8 text-white z-10 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold">2025 SUMMER</h1>
            <p className="text-sm text-gray-200">エッジの効いたスタイルを。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
