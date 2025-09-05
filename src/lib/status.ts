export type KnownStatus = "受注" | "支払い確認" | "配送準備中" | "発送済み" | "キャンセル";

const CODE_TO_LABEL: Record<string, KnownStatus> = {
  PENDING: "受注",
  PAID: "支払い確認",
  PREPARING: "配送準備中",
  SHIPPED: "発送済み",
  CANCELED: "キャンセル",
};

export function toStatusLabel(v?: string | null): string {
  if (!v) return "";
  // すでに日本語ならそのまま
  if (["受注","支払い確認","配送準備中","発送済み","キャンセル"].includes(v)) return v;
  const u = String(v).toUpperCase();
  return CODE_TO_LABEL[u] ?? v;
}

export function statusColor(label?: string) {
  const l = toStatusLabel(label);
  switch (l) {
    case "受注":
      return "bg-gray-100 text-gray-700";
    case "支払い確認":
      return "bg-yellow-100 text-yellow-800";
    case "配送準備中":
      return "bg-blue-100 text-blue-800";
    case "発送済み":
      return "bg-green-100 text-green-800";
    case "キャンセル":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

