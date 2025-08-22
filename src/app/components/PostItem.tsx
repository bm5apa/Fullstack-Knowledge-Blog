// src/app/components/PostItem.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tag = { id: string; name: string };
type User = {
  id: string;
  name?: string | null;
  image?: string | null;
  role?: "ADMIN" | "USER";
};
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

export default function PostItem({ post }: { post: Post }) {
  const router = useRouter();
  const { data } = useSession();
  const me = (data?.user ?? null) as User | null;

  const isOwner = Boolean(me?.id && me.id === post.authorId);
  const isAdmin = me?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  async function onDelete() {
    if (!confirm("確認刪除這篇文章？")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.status === 204) {
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

  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-xs text-gray-500">
          {created ? created.toLocaleString() : ""}
        </div>
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
