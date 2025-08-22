"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NavBar() {
  const { data } = useSession();
  const user = data?.user as (typeof data)["user"] & {
    id?: string;
    role?: string;
  };

  return (
    <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-3">
        <Link href="/" className="font-semibold">
          Knowledge Blog
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-500">Hi, {user.name ?? "User"}</span>
              <Link
                href="/new"
                className="rounded bg-black px-3 py-1.5 text-white hover:bg-gray-800"
              >
                新文章
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded border px-3 py-1.5 hover:bg-gray-50"
              >
                登出
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded bg-black px-3 py-1.5 text-white hover:bg-gray-800"
            >
              用 GitHub 登入
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
