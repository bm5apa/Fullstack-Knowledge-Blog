"use client";
import { useState } from "react";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, published: true }),
    });
    if (res.ok) {
      setTitle("");
      setContent("");
      alert("Created!");
    } else alert(await res.text());
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="border p-2 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="border px-3 py-2 rounded">Publish</button>
    </form>
  );
}
