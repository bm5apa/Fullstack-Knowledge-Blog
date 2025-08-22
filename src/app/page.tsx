// src/app/page.tsx
import { headers } from "next/headers";
import NavBar from "./components/NavBar";
import PostItem, { Post } from "./components/PostItem";

async function fetchPosts(): Promise<Post[]> {
  const h = await headers(); // Next 15 要 await
  const host = h.get("host") ?? "";
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (host ? `https://${host}` : "http://localhost:3000");
  const res = await fetch(`${base}/api/posts`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data ?? [];
}

export default async function HomePage() {
  const posts = await fetchPosts();

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <NavBar />
      <h1 className="text-2xl font-bold">最新文章</h1>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500">目前沒有文章</p>
        ) : (
          posts.map((p) => <PostItem key={p.id} post={p} />)
        )}
      </div>
    </main>
  );
}
