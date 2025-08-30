// app/components/confirm/PaymentMethodSelect.tsx
"use client";

export type PaymentMethod = "credit" | "cod";

type Props = {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
};

export default function PaymentMethodSelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="payment"
          value="credit"
          checked={value === "credit"}
          onChange={() => onChange("credit")}
        />
        クレジットカード決済
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="payment"
          value="cod"
          checked={value === "cod"}
          onChange={() => onChange("cod")}
        />
        代金引換
      </label>
    </div>
  );
}
