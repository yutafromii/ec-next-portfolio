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
      <TabsList className="grid grid-cols-4 w-full border">
        <TabsTrigger value="orders">ご注文履歴</TabsTrigger>
        <TabsTrigger value="profile">会員情報編集</TabsTrigger>
        <TabsTrigger value="address">お届け先編集</TabsTrigger>
        <TabsTrigger value="withdraw">退会手続き</TabsTrigger>
      </TabsList>

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
        <div className="py-6"><DeliveryAddressList /></div>
      </TabsContent>
      <TabsContent value="withdraw">
        <div className="py-6">
          <LeaveConfirm />
        </div>
      </TabsContent>
    </Tabs>
  );
}
