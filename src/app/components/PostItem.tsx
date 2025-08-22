// src/components/PostItem.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tag = { id: string; name: string };
type User = { id: string; name?: string | null; image?: string | null };
export type Post = {
  id: string;
  title?: string | null;
  content?: string | null;
  published: boolean;
  createdAt: string | Date;
  authorId: string;
  author?: User | null;
  tags?: { tag: Tag }[];
};

// ✅ 在模組層先建立固定的日期格式器（語系＋時區＋24h）
// 這樣 SSR 與 Client 會得到相同字串，避免 hydration mismatch
const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export default function PostItem({ post }: { post?: Post }) {
  const { data } = useSession();
  const me = (data?.user as any) || null;

  if (!post) return null;

  const isOwner = me?.id && me.id === post.authorId;
  const isAdmin = me?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;
  const router = useRouter();

  async function onDelete() {
    if (!confirm("確認刪除這篇文章？")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.status === 204) {
      // 重新抓取伺服器資料，列表會立刻更新
      router.refresh();
      return;
    }
    const txt = await res.text();
    alert(`刪除失敗：${res.status} ${txt}`);
  }

  const title = post.title ?? "(untitled)";
  const content = post.content ?? "";
  const created =
    typeof post.createdAt === "string"
      ? new Date(post.createdAt)
      : post.createdAt;

  // ✅ 用固定格式器輸出文字，避免 toLocaleString() 差異
  const createdText = created ? dateFmt.format(created) : "";

  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-xs text-gray-500">{createdText}</div>
      </div>

      <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
        {content}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t.tag.id}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs"
            >
              #{t.tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <span>
          作者：{post.author?.name ?? "Unknown"} ·{" "}
          {post.published ? "已發佈" : "草稿"}
        </span>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="rounded border px-2 py-1 hover:bg-gray-50"
            >
              刪除
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
