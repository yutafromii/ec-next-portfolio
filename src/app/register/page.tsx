'use client';
import { RegisterForm } from "@/components/register-form";
import { GalleryVerticalEnd } from "lucide-react";
import { Suspense } from "react";

export default function Register() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          EC portfolio.
        </a>
        <Suspense fallback={<div className="text-center text-sm text-gray-500">読み込み中...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
