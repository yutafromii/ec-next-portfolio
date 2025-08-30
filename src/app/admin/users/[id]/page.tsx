// app/admin/users/[id]/page.tsx
import { notFound } from "next/navigation";
import { User } from "@/app/interfaces/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  params: {
    id: string;
  };
}

async function getUser(id: string): Promise<User | null> {
  try {
    const res = await fetch(`http://localhost:8080/users/${id}`, {
      cache: "no-store", // SSRで毎回取得
      credentials: "include",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("ユーザー取得エラー:", err);
    return null;
  }
}

export default async function UserDetailPage({ params }: Props) {
  const user = await getUser(params.id);

  if (!user) {
    return notFound();
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>ユーザー詳細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-base text-foreground">名前:</span> {user.name}
          </div>
          <div>
            <span className="font-semibold text-base text-foreground">メール:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold text-base text-foreground">電話番号:</span> {user.phoneNumber || "未登録"}
          </div>
          <div>
            <span className="font-semibold text-base text-foreground">住所:</span> {user.address || "未登録"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
