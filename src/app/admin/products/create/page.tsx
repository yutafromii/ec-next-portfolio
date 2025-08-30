"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/app/lib/api";
import { useRouter } from "next/navigation"; // ✅ 修正：useRouterを使う


export default function ProductCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    fabric: "",
    price: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validate()) return;

    try {
      const payload = {
        name: form.name,
        description: form.description,
        fabric: form.fabric,
        price: Number(form.price),
        imageUrls: form.imageUrls.filter((url) => url.trim() !== ""),
        
      };

      await apiPost("http://localhost:8080/products", payload);
      alert("商品を登録しました！");
      // router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setErrors(["登録に失敗しました。"]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">商品登録</h1>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm">
              ※ {err}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 商品名 */}
        <div>
          <Label htmlFor="name">商品名</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        {/* 商品説明 */}
        <div>
          <Label htmlFor="description">商品説明</Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        {/* 生地 */}
        <div>
          <Label htmlFor="fabric">生地</Label>
          <Input
            id="fabric"
            name="fabric"
            value={form.fabric}
            onChange={handleChange}
          />
        </div>

        {/* 価格 */}
        <div>
          <Label htmlFor="price">価格 (円)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        {/* 画像URL入力フィールド */}
        <div>
          <Label>画像URL</Label>
          {form.imageUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <Input
                type="text"
                placeholder="例: /images/sample.jpg"
                value={url}
                onChange={(e) =>
                  handleArrayChange(i, "imageUrls", e.target.value)
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddField("imageUrls")}
          >
            ＋画像URLを追加
          </Button>
        </div>

        {/* 登録ボタン */}
        <Button type="submit" className="w-full">
          登録する
        </Button>
      </form>
    </div>
  );
}
