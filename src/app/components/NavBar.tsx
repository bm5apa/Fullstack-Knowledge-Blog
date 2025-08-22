// src/app/components/NavBar.tsx
"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const { data } = useSession();
  const user = data?.user ?? null; // <— 簡單保險

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Knowledge Blog
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                Hi, {user.name ?? "User"}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
              >
                登出
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
            >
              GitHub 登入
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
