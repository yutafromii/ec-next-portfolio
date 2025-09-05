"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { http } from "@/app/lib/api/client";
// import { useRouter } from "next/navigation";


export default function ProductCreatePage() {

  const [form, setForm] = useState({
    name: "",
    description: "",
    fabric: "",
    price: "",
    category: "jacket", // 追加: デフォルトカテゴリ
    stock: "",          // 追加: 在庫数（入力は文字列で保持）
    imageUrls: [""],
  });

  const [errors, setErrors] = useState<string[]>([]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleArrayChange = (
    index: number,
    field: "imageUrls",
    value: string
  ) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const handleAddField = (field: "imageUrls") => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const handleRemoveField = (index: number, field: "imageUrls") => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated.length ? updated : [""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validate()) return;

    try {
      const payload = {
        name: form.name,
        description: form.description,
        fabric: form.fabric,
        price: Number(form.price),
        category: form.category,
        stock: form.stock === "" ? 0 : Number(form.stock),
        imageUrls: form.imageUrls.filter((url) => url.trim() !== ""),
        
      };

      await http.post("/products", payload);
      alert("商品を登録しました！");
      // router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setErrors(["登録に失敗しました。"]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 mt-12">
      {/* ヘッダーアクションバー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">商品を登録</h1>
          <p className="text-sm text-gray-500">新しい商品を追加します。</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className="inline-flex">
            <Button type="button" variant="outline">キャンセル</Button>
          </Link>
          <Button onClick={handleSubmit} className="bg-black text-white hover:bg-black/90">公開して登録</Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6">
          {errors.map((err, i) => (
            <p key={i} className="text-sm">※ {err}</p>
          ))}
        </div>
      )}

      {/* 2カラムレイアウト */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインカラム */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>商品名や説明など、購入者に表示される情報です。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 商品名 */}
              <div>
                <Label htmlFor="name">商品名</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="例：BD 03 / BROADCLOTH SHIRT" />
                <p className="text-xs text-gray-500 mt-1">一覧や詳細ページで表示されます。</p>
              </div>

              {/* 商品説明 */}
              <div>
                <Label htmlFor="description">商品説明</Label>
                <Textarea id="description" name="description" rows={6} value={form.description} onChange={handleChange} placeholder="素材・ディテール・シルエットなどの説明…" />
                <p className="text-xs text-gray-500 mt-1">改行を含めてご入力いただけます。</p>
              </div>

              {/* 生地 */}
              <div>
                <Label htmlFor="fabric">生地</Label>
                <Input id="fabric" name="fabric" value={form.fabric} onChange={handleChange} placeholder="例：COTTON 100%" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>画像</CardTitle>
              <CardDescription>表示順に並びます。1枚目がサムネイルになります。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-24 h-24 border bg-white flex items-center justify-center overflow-hidden">
                    {url ? (
                      <Image src={url} alt={`image-${i+1}`} width={96} height={96} className="object-cover" unoptimized />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="text"
                      placeholder="例: /images/sample.jpg または https://..."
                      value={url}
                      onChange={(e) => handleArrayChange(i, "imageUrls", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => handleRemoveField(i, "imageUrls")}>削除</Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddField("imageUrls")}>
                ＋ 画像URLを追加
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1 lg:top-24 space-y-6 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>販売情報</CardTitle>
              <CardDescription>価格・在庫・カテゴリを設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 価格 */}
              <div>
                <Label htmlFor="price">価格 (円)</Label>
                <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} placeholder="例：37400" />
              </div>

              {/* 在庫数 */}
              <div>
                <Label htmlFor="stock">在庫数</Label>
                <Input id="stock" name="stock" type="number" min={0} value={form.stock} onChange={handleChange} placeholder="例：10" />
              </div>

              {/* カテゴリ */}
              <div>
                <Label htmlFor="category">カテゴリ</Label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="jacket">Jacket</option>
                  <option value="pants">Pants</option>
                  <option value="shirt">Shirt</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
