"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function LeaveConfirm() {
  const [open, setOpen] = useState(false);

  const handleLeave = () => {
    // ✅ 実際の退会処理（API通信など）をここに記述
    alert("退会処理を実行しました");
    setOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-4 px-6">
      <hr className="mt-4 mb-12 border-border" />

      <div className="flex flex-col items-center space-y-6">
        <AlertTriangle className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-xl font-semibold">
          退会手続きの前にご確認ください
        </h1>
        <p className="text-sm text-muted-foreground">
          会員を退会された場合には、現在保存されている購入履歴やお届け先等の情報は、
          <br className="hidden sm:inline" />
          すべて削除されますがよろしいでしょうか？
        </p>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-none bg-black text-white text-sm px-10 py-6 mt-8 hover:bg-gray-800"
        >
          会員退会手続きへ
        </Button>
      </div>

      <hr className="mt-20 border-border" />

      {/* ✅ モーダルコンポーネント */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              最終確認
            </DialogTitle>
            <DialogDescription>
              本当に退会してもよろしいですか？<br />
              この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleLeave}>
              退会する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
