"use client";

import MyPageTabs from "@/components/mypage/MyPageTabs";
import MyPageGuard from "@/components/mypage/MyPageGuard"; // 後述で作成

export default function MyPage() {
  return (
    
      <div className="pt-24 px-4">
        <MyPageTabs />
      </div>
    
  );
}
