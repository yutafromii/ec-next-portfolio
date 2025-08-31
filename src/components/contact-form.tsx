"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email || !form.message) {
      setError("必須項目を入力してください。");
      return;
    }

    try {
      setSubmitting(true);
      // 今回は見た目のみのため、通信は行わずに成功メッセージを表示
      await new Promise((r) => setTimeout(r, 500));
      setSuccess("お問い合わせを受け付けました。ありがとうございます。");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>ご用件を入力して送信してください。</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">お名前</Label>
              <Input id="name" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" name="email" value={form.email} onChange={onChange} required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="subject">件名（任意）</Label>
              <Input id="subject" name="subject" value={form.subject} onChange={onChange} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="message">お問い合わせ内容</Label>
              <Textarea id="message" name="message" value={form.message} onChange={onChange} rows={6} required />
            </div>

            {error && <p className="text-red-500 -mt-2">{error}</p>}
            {success && <p className="text-green-600 -mt-2">{success}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "送信中..." : "送信する"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
