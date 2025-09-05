"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const newsItems = [
  {
    title: "ATTENTION",
    summary: "ご購入制限のご案内",
    content: `WEB STOREではより多くのお客様にご購入いただけるよう、商品に購入個数の制限を設けさせていただいております。
同一品番の制限数を超えた複数注文等、弊社が転売目的または不正注文と判断した場合は、ご注文内容の変更またはご注文のキャンセルをさせていただく場合がございます。
予めご了承頂けますよう何卒宜しくお願い申し上げます。`,
  },
  {
    title: "INFORMATION",
    summary: "宅急便コレクトにおけるクレジットカードタッチ決済の導入について",
    content: "sample text sample text sample text sample text sample text ",
  },
  {
    title: "NOW HIRING",
    summary: "採用情報はこちら",
    content: "sample text sample text sample text sample text sample text ",
  },
];

export default function NewsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 border-t border-b border-[#d6d6d6]">
      <div className="max-w-3xl mx-auto px-6 md:px-12 divide-y divide-[#d6d6d6]">
        {newsItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="">
              {/* clickable row */}
              <div
                className="grid grid-cols-[120px_1fr_auto] items-center gap-4 hover:cursor-pointer py-6"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setOpenIndex(isOpen ? null : index);
                  }
                }}
              >
                <span className="font-semibold text-base whitespace-nowrap">
                  {item.title}
                </span>
                <div className="text-sm text-[#222222]">{item.summary}</div>
                <div>{isOpen ? <Minus size={18} /> : <Plus size={18} />}</div>
              </div>

              {/* content */}
              {isOpen && item.content && (
                <div className="mb-6 text-sm leading-relaxed text-[#222] whitespace-pre-line">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
