// AdminNavButton.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

type Props = {
  href: string;
  icon: LucideIcon;
  label: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
};

export default function AdminNavButton({ href, icon: Icon, label, variant = "default" }: Props) {
  return (
    <Button
      asChild
      variant={variant}
      className="
        w-full justify-start gap-3 px-5
        text-base font-medium leading-none
        [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0
      "
    >
      <Link href={href} className="flex w-full items-center">
        {/* アイコン用の固定幅ボックス → テキストの開始位置が全行で揃う */}
        <span className="inline-flex w-6 items-center justify-center">
          <Icon aria-hidden />
        </span>
        <span className="flex-1 text-left">{label}</span>
      </Link>
    </Button>
  );
}
