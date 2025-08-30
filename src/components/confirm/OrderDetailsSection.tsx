// app/components/confirm/OrderDetailsSection.tsx
"use client";

import { useState } from "react";
import { useUserStore } from "@/app/stores/userStore";

import Section from "../common/Section";
import PaymentMethodSelect, { PaymentMethod } from "./PaymentMethodSelect";
import AddressBlock from "./AddressBlock";

export default function OrderDetailsSection() {
  const { user } = useUserStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [inquiry, setInquiry] = useState("");

  // TODO: 「変更」ボタンでモーダルを出す/マイページへ遷移などお好みで
  const handleChangeAddress = () => {
    // 例: router.push("/mypage/address");
    alert("住所変更の導線は後で実装予定です。");
  };

  return (
    <div className="space-y-10 text-sm md:text-base">
      {/* お客様情報 */}
      <Section title="お客様情報">
        {user ? (
          <AddressBlock name={user.name} address={user.address} phoneNumber={user.phoneNumber} />
        ) : (
          <p>ログイン情報が取得できません</p>
        )}
      </Section>

      {/* 配送情報 */}
      <Section title="配送情報">
        {user ? (
          <AddressBlock
            label="お届け先"
            name={user.name}
            address={user.address}
            phoneNumber={user.phoneNumber}
            showChangeButton
            onClickChange={handleChangeAddress}
          />
        ) : (
          <p>配送先情報が取得できません</p>
        )}
      </Section>

      {/* お支払方法 */}
      <Section title="お支払方法">
        <PaymentMethodSelect value={paymentMethod} onChange={setPaymentMethod} />
      </Section>

      {/* お問い合わせ欄 */}
      <Section title="お問い合わせ欄">
        <textarea
          className="w-full p-2 border border-gray-300 min-h-[120px] resize-y"
          placeholder="お問い合わせ事項がございましたら、こちらにご入力ください。（3000文字まで）"
          value={inquiry}
          maxLength={3000}
          onChange={(e) => setInquiry(e.target.value)}
        />
        <div className="mt-1 text-right text-xs text-gray-500">
          {inquiry.length}/3000
        </div>
      </Section>
    </div>
  );
}
