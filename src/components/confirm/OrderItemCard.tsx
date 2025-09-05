"use client";

import type { CartItem } from "@/app/interfaces/Cart";

type Props = {
  item: CartItem;
  imageUrl?: string;
};

export default function OrderItemCard({ item, imageUrl }: Props) {
  return (
    <div className="flex flex-col gap-4 border-t border-b border-dotted border-gray-300 py-6">
      <div className="flex gap-6">
        <img
          src={imageUrl || "/images/no-image.jpg"}
          alt={item.name ?? "product image"}
          className="w-24 h-24 object-contain bg-gray-100"
        />
        <div className="flex flex-col gap-1 text-sm md:text-base">
          <p className="text-[#5A5A66] font-medium">{item.name}</p>
          {/* <p className="font-bold">COLOR：{item.color}</p>
              <p className="font-bold">SIZE：{item.size}</p> */}
          <div className="flex items-center gap-4 pt-1">
            <span className="text-gray-600 text-sm">
              {item.price.toLocaleString()}yen (Tax inc.) × {item.quantity}
            </span>
            <span className="font-semibold text-sm md:text-base">
              小計：{item.subtotal.toLocaleString()}yen (Tax inc.)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
