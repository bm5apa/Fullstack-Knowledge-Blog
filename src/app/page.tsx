export const revalidate = 0;

import { prisma } from "@/lib/prisma";

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, content: true, createdAt: true },
  });

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Public Posts</h1>
      <ul className="space-y-3">
        {posts.length === 0 && <li className="opacity-70">No posts yet.</li>}
        {posts.map((p) => (
          <li key={p.id} className="border p-3 rounded">
            <div className="font-semibold">{p.title}</div>
            <div className="opacity-80 text-sm">
              {(p.content ?? "").slice(0, 160)}
            </div>
            <div className="text-xs opacity-60 mt-1">
              {new Date(p.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
