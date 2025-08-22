"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState(""); // 以逗號分隔
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          published,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`建立失敗：${res.status} ${text}`);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600">標題</label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">
          內容（支援 Markdown）
        </label>
        <textarea
          className="mt-1 h-40 w-full rounded border px-3 py-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">
          標籤（以逗號分隔）
        </label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="nextjs, prisma, auth"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        發佈（取消勾選則儲存為草稿）
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? "建立中..." : "建立文章"}
      </button>
    </form>
  );
}
