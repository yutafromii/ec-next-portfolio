// Postal code lookup using ZipCloud (JP) public API
// Docs: https://zipcloud.ibsnet.co.jp/doc/api

export type PostalAddress = {
  prefecture: string;
  city: string;
  town?: string;
};

export async function lookupPostal(raw: string): Promise<PostalAddress> {
  const digits = (raw || "").replace(/[^0-9]/g, "");
  if (digits.length !== 7) throw new Error("郵便番号は7桁で入力してください");

  const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`郵便番号検索に失敗しました (HTTP ${res.status})`);
  const json = (await res.json()) as {
    status: number;
    message?: string;
    results?: Array<{
      zipcode: string;
      address1: string; // 都道府県
      address2: string; // 市区町村
      address3: string; // 町域
    }> | null;
  };

  if (json.status !== 200) throw new Error(json.message || "郵便番号検索に失敗しました");
  const r = json.results?.[0];
  if (!r) throw new Error("該当する住所が見つかりませんでした");
  return { prefecture: r.address1, city: r.address2, town: r.address3 };
}

