import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, subject, message } = body ?? {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // TODO: 必要に応じてメール送信や外部API連携を実装
    // 例）fetch(process.env.CONTACT_WEBHOOK_URL!, { method: 'POST', body: JSON.stringify(body) })

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

