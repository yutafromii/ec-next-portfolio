// app/components/confirm/AddressBlock.tsx
"use client";

type Props = {
  label?: string;            // 見出しの補足（「お届け先」など）
  name?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  showChangeButton?: boolean;
  onClickChange?: () => void;
};

export default function AddressBlock({
  label,
  name,
  address,
  phoneNumber,
  showChangeButton,
  onClickChange,
}: Props) {
  return (
    <div className="space-y-1 text-sm md:text-base">
      {label && <p className="text-xs text-gray-500">{label}</p>}
      {name && <p>{name} 様</p>}
      <p>{address || "住所未登録"}</p>
      {phoneNumber !== undefined && <p>{phoneNumber || "電話番号未登録"}</p>}
      {showChangeButton && (
        <button
          type="button"
          onClick={onClickChange}
          className="mt-2 border border-gray-300 px-4 py-1 text-sm hover:bg-gray-100 transition"
        >
          変更
        </button>
      )}
    </div>
  );
}
