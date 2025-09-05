"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/app/interfaces/Product";
import { ProductsAPI } from "@/app/lib/api/products";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

export default function AdminProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editing, setEditing] = useState({
    name: false,
    description: false,
    fabric: false,
    price: false,
    stock: false,
    category: false,
    isActive: false,
    images: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await ProductsAPI.byId(Number(id));
        if (!mounted) return;
        setProduct(data);
        setForm({
          name: data.name,
          description: data.description,
          fabric: data.fabric,
          price: data.price,
          stock: data.stock,
          category: data.category,
          imageUrls: data.imageUrls ?? [],
          isActive: data.isActive,
        });
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError("商品情報の取得に失敗しました。");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) return;
    try {
      await ProductsAPI.delete(Number(product.id));
      router.push("/admin/products");
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  };

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let v: unknown = value;
    if (type === "number") v = value === "" ? "" : Number(value);
    if (name === "isActive") v = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleImgChange = (index: number, value: string) => {
    setForm((prev) => {
      const arr = Array.isArray(prev.imageUrls) ? [...prev.imageUrls] : [];
      arr[index] = value;
      return { ...prev, imageUrls: arr };
    });
  };

  const handleImgAdd = () => {
    setForm((prev) => {
      const arr = Array.isArray(prev.imageUrls) ? [...prev.imageUrls] : [];
      arr.push("");
      return { ...prev, imageUrls: arr };
    });
  };

  const handleImgRemove = (index: number) => {
    setForm((prev) => {
      const arr = Array.isArray(prev.imageUrls) ? [...prev.imageUrls] : [];
      arr.splice(index, 1);
      return { ...prev, imageUrls: arr };
    });
  };

  const dirty = useMemo(() => {
    if (!product) return false;
    const compare = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);
    return (
      compare(form.name, product.name) ||
      compare(form.description, product.description) ||
      compare(form.fabric, product.fabric) ||
      compare(form.price, product.price) ||
      compare(form.stock, product.stock) ||
      compare(form.category, product.category) ||
      compare(form.isActive, product.isActive) ||
      compare(form.imageUrls, product.imageUrls)
    );
  }, [form, product]);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const payload: Partial<Product> = {
        name: form.name ?? product.name,
        description: form.description ?? product.description,
        fabric: form.fabric ?? product.fabric,
        price: typeof form.price === "number" ? form.price : product.price,
        stock: typeof form.stock === "number" ? form.stock : product.stock,
        category: (form.category ?? product.category) as string,
        imageUrls: (form.imageUrls ?? product.imageUrls) as string[],
        isActive: typeof form.isActive === "boolean" ? form.isActive : product.isActive,
      };
      const saved = await ProductsAPI.update(Number(product.id), payload);
      setProduct(saved);
      setForm({
        name: saved.name,
        description: saved.description,
        fabric: saved.fabric,
        price: saved.price,
        stock: saved.stock,
        category: saved.category,
        imageUrls: saved.imageUrls ?? [],
        isActive: saved.isActive,
      });
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!product) return;
    setForm({
      name: product.name,
      description: product.description,
      fabric: product.fabric,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrls: product.imageUrls ?? [],
      isActive: product.isActive,
    });
    setEditing({
      name: false,
      description: false,
      fabric: false,
      price: false,
      stock: false,
      category: false,
      isActive: false,
      images: false,
    });
  };

  const formatPrice = (v?: number) =>
    typeof v === "number" ? `¥${v.toLocaleString()}` : "-";
  const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "-");

  if (loading) return <section className="py-10 px-6">読み込み中...</section>;
  if (error) return <section className="py-10 px-6 text-red-500">{error}</section>;
  if (!product) return <section className="py-10 px-6 text-gray-500">商品が見つかりません。</section>;

  const firstImg = ((form.imageUrls ?? product.imageUrls) as string[] | undefined)?.[0] || "/images/no-image.jpg";

  return (
    <section className="py-8 mt-12">
      {/* Header actions */}
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">商品詳細（管理）</h1>
          <p className="text-sm text-gray-500">ID: {product.id}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><PenLine className="w-4 h-4" /> 文字をダブルクリックして編集できます</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button variant="outline">一覧へ戻る</Button>
          </Link>
          <Button variant="outline" onClick={handleReset} disabled={!dirty}>リセット</Button>
          <Button onClick={handleSave} disabled={!dirty || saving} className="bg-black text-white hover:bg-black/90">
            {saving ? "保存中..." : "編集内容を保存"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>削除</Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>画像</CardTitle>
            <CardDescription>1枚目がサムネイルとして使用されます。</CardDescription>
          </CardHeader>
          <CardContent>
            {!editing.images ? (
              <div
                className="relative"
                onDoubleClick={() => setEditing((e) => ({ ...e, images: true }))}
                title="ダブルクリックで編集"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(() => {
                    const imgs = (form.imageUrls ?? product.imageUrls) || [];
                    const list = [firstImg, ...imgs.slice(1)];
                    return list.map((url, i) => (
                      <div key={`${url}-${i}`} className="relative w-full aspect-square border rounded-sm overflow-hidden bg-white">
                        <Image src={url} alt={`image-${i + 1}`} fill className="object-cover" unoptimized />
                        {/* 編集アイコンを画像上に重ねて表示 */}
                        <div className="pointer-events-none absolute top-2 right-2 rounded-full bg-white/80 border p-1 shadow-sm">
                          <PenLine className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {(form.imageUrls as string[] | undefined)?.map((url, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-20 h-20 border rounded overflow-hidden bg-white">
                      <Image src={url || "/images/no-image.jpg"} alt={`image-${i+1}`} fill className="object-cover" unoptimized />
                    </div>
                    <input
                      className="flex-1 border rounded px-3 py-2"
                      value={url}
                      onChange={(e) => handleImgChange(i, e.target.value)}
                      placeholder="/images/sample.jpg または https://..."
                    />
                    <Button type="button" variant="outline" onClick={() => handleImgRemove(i)}>削除</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleImgAdd}>＋ 画像URLを追加</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>販売情報</CardTitle>
            <CardDescription>価格・在庫・公開状態など</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {/* 商品名 */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-600">商品名</span>
              {!editing.name ? (
                <span className="flex-1 group inline-flex items-center gap-1 cursor-text" onDoubleClick={() => setEditing((e) => ({ ...e, name: true }))} title="ダブルクリックで編集">
                  <PenLine className="w-4 h-4 text-gray-400 opacity-60 group-hover:opacity-100" />
                  <span className="font-medium text-gray-900">{form.name ?? product.name}</span>
                </span>
              ) : (
                <input className="flex-1 border rounded px-3 py-2" name="name" value={String(form.name ?? '')} onChange={handleField} />
              )}
            </div>
            {/* カテゴリ */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-600">カテゴリ</span>
              {!editing.category ? (
                <span className="flex-1 group inline-flex items-center gap-1 cursor-text" onDoubleClick={() => setEditing((e) => ({ ...e, category: true }))} title="ダブルクリックで編集">
                  <PenLine className="w-4 h-4 text-gray-400 opacity-60 group-hover:opacity-100" />
                  <span className="capitalize">{(form.category ?? product.category) || '-'}</span>
                </span>
              ) : (
                <select name="category" className="border rounded px-3 py-2" value={String(form.category ?? '')} onChange={handleField}>
                  <option value="jacket">Jacket</option>
                  <option value="pants">Pants</option>
                  <option value="shirt">Shirt</option>
                </select>
              )}
            </div>
            {/* 価格 */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-600">価格</span>
              {!editing.price ? (
                <span className="group inline-flex items-center gap-1 cursor-text" onDoubleClick={() => setEditing((e) => ({ ...e, price: true }))} title="ダブルクリックで編集">
                  <PenLine className="w-4 h-4 text-gray-400 opacity-60 group-hover:opacity-100" />
                  <span>{formatPrice(typeof form.price === 'number' ? form.price : product.price)}</span>
                </span>
              ) : (
                <input type="number" name="price" className="border rounded px-3 py-2" value={Number(form.price ?? 0)} onChange={handleField} />
              )}
            </div>
            {/* 在庫 */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-600">在庫</span>
              {!editing.stock ? (
                <span className="group inline-flex items-center gap-1 cursor-text" onDoubleClick={() => setEditing((e) => ({ ...e, stock: true }))} title="ダブルクリックで編集">
                  <PenLine className="w-4 h-4 text-gray-400 opacity-60 group-hover:opacity-100" />
                  <span>{typeof form.stock === 'number' ? form.stock : (product.stock ?? 0)}</span>
                </span>
              ) : (
                <input type="number" name="stock" className="border rounded px-3 py-2" value={Number(form.stock ?? 0)} onChange={handleField} />
              )}
            </div>
            {/* 公開状態 */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-600">公開状態</span>
              {!editing.isActive ? (
                <span className="group inline-flex items-center gap-1 cursor-text" onDoubleClick={() => setEditing((e) => ({ ...e, isActive: true }))} title="ダブルクリックで編集">
                  <PenLine className="w-4 h-4 text-gray-400 opacity-60 group-hover:opacity-100" />
                  <span>{(typeof form.isActive === 'boolean' ? form.isActive : product.isActive) ? '公開' : '非公開'}</span>
                </span>
              ) : (
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isActive" checked={Boolean(form.isActive)} onChange={handleField} />
                  <span>公開</span>
                </label>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-gray-600">作成日時</span>
              <span>{formatDate(product.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>商品詳細</CardTitle>
            <CardDescription>購入者に表示される説明・素材など</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">説明</div>
              {!editing.description ? (
                <div className="group cursor-text" onDoubleClick={() => setEditing((e) => ({ ...e, description: true }))} title="ダブルクリックで編集">
                  <div className="flex items-start gap-2">
                    <PenLine className="w-4 h-4 mt-1 text-gray-400 opacity-60 group-hover:opacity-100" />
                    <p className="whitespace-pre-wrap leading-relaxed">{form.description ?? product.description}</p>
                  </div>
                </div>
              ) : (
                <textarea name="description" className="w-full min-h-32 border rounded px-3 py-2" value={String(form.description ?? '')} onChange={handleField} />
              )}
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">生地</div>
              {!editing.fabric ? (
                <div className="group cursor-text inline-flex items-center gap-2" onDoubleClick={() => setEditing((e) => ({ ...e, fabric: true }))} title="ダブルクリックで編集">
                  <PenLine className="w-4 h-4 text-gray-400 opacity-60 group-hover:opacity-100" />
                  <p>{(form.fabric ?? product.fabric) || '-'}</p>
                </div>
              ) : (
                <input name="fabric" className="w-full border rounded px-3 py-2" value={String(form.fabric ?? '')} onChange={handleField} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
