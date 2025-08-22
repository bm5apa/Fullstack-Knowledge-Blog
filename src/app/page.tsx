import { headers } from "next/headers";
import PostItem, { Post } from "./components/PostItem";
import NavBar from "./components/NavBar";

async function fetchPosts(): Promise<Post[]> {
  // 用當前請求的 Host 組出正確的絕對網址（dev 用 http，prod 用 https）
  const h = headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const base = `${protocol}://${host}`;

  const res = await fetch(`${base}/api/posts`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  // 若不是 2xx，直接讀文字當錯誤拋出，避免 JSON.parse 裡面噴 "<!DOCTYPE"
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GET /api/posts ${res.status} ${res.statusText}: ${text.slice(0, 200)}`
    );
  }

  // 只有 content-type 是 JSON 才解析
  const type = res.headers.get("content-type") || "";
  if (!type.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Expected JSON but got "${type}". First 200 chars: ${text.slice(0, 200)}`
    );
  }

  return (await res.json()) as Post[];
}

export default async function HomePage() {
  const posts = await fetchPosts();

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">最新文章</h1>
        {posts.length === 0 ? (
          <p className="text-gray-500">
            目前還沒有文章，先登入後點右上角「新文章」吧！
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <PostItem key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
