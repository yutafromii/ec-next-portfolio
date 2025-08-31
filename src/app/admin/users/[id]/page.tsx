// app/admin/users/[id]/page.tsx
import { notFound } from "next/navigation";
import { User } from "@/app/interfaces/User";
import { http } from "@/app/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Next.js 15 + React 19: params/searchParams are Promises
interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function getUser(id: string): Promise<User | null> {
  try {
    return await http.get<User>(`/users/${id}`);
  } catch (err) {
    console.error("ユーザー取得エラー:", err);
    return null;
  }
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser(id);

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
