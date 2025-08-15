async function getPosts() {
  const r = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/posts`, {
    cache: "no-store",
  });
  return r.json();
}
export default async function Home() {
  const posts = await getPosts();
  return (
    <ul className="space-y-3">
      {posts.map((p: any) => (
        <li key={p.id} className="border p-3 rounded">
          <b>{p.title}</b>
        </li>
      ))}
    </ul>
  );
}
