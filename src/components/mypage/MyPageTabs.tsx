// components/MyPageTabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OrderHistory from "./OrderHistory";
import EditProfileForm from "./EditProfileForm";
import DeliveryAddressList from "./DeliveryAddressList";
import LeaveConfirm from "./LeaveConfirm";

export default function MyPageTabs() {
  return (
    <Tabs defaultValue="orders" className="w-full">
      {/* 横スクロール用のラッパー。中身のレイアウトはそのまま */}
      <div className="-mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 no-scrollbar">
        <TabsList
          className="
            w-max min-w-full
            border
            /* shadcnの既定スタイルを邪魔しないよう grid を使わずに */
            flex
          "
        >
          {/* 4つとも等幅を保ちつつ、狭い画面では横に逃がす */}
          <TabsTrigger
            value="orders"
            className="flex-1 min-w-[12rem] whitespace-nowrap"
          >
            ご注文履歴
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="flex-1 min-w-[12rem] whitespace-nowrap"
          >
            会員情報編集
          </TabsTrigger>
          <TabsTrigger
            value="address"
            className="flex-1 min-w-[12rem] whitespace-nowrap"
          >
            お届け先編集
          </TabsTrigger>
          <TabsTrigger
            value="withdraw"
            className="flex-1 min-w-[12rem] whitespace-nowrap"
          >
            退会手続き
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="orders">
        <div className="py-6">
          <OrderHistory />
        </div>
      </TabsContent>
      <TabsContent value="profile">
        <div className="py-6">
          <EditProfileForm />
        </div>
      </TabsContent>
      <TabsContent value="address">
        <div className="py-6">
          <DeliveryAddressList />
        </div>
      </TabsContent>
      <TabsContent value="withdraw">
        <div className="py-6">
          <LeaveConfirm />
        </div>
      </TabsContent>
    </Tabs>
  );
}
