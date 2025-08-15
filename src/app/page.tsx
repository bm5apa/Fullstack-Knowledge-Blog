"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Public Posts</h1>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="border p-3 rounded">
            <div className="font-semibold">{p.title}</div>
            <div className="opacity-80 text-sm">
              {(p.content ?? "").slice(0, 160)}
            </div>
          </li>
        ))}
        {posts.length === 0 && <li className="opacity-70">No posts yet.</li>}
      </ul>
    </section>
  );
}
