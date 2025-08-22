// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { postInput } from "@/lib/validation";

// 確保此 API 每次都打 DB（避免被預先快取）
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // 只列出已發佈文章；若你想讓作者看到自己的草稿，改成條件式或另外做 /me 草稿列表
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, image: true } }, // ✨ 補上 author，給 UI 使用
      tags: { include: { tag: true } },
    },
  });

  // 務必回傳「純陣列」
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const json = await req.json();
  const parsed = postInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  const { title, content, published, tags = [] } = parsed.data;
  const normTags = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];

  const created = await prisma.$transaction(async (tx) => {
    const tagRecords = await Promise.all(
      normTags.map((name) =>
        tx.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    return tx.post.create({
      data: {
        title,
        content,
        published,
        authorId: userId,
        tags: tagRecords.length
          ? {
              create: tagRecords.map((tag) => ({
                tag: { connect: { id: tag.id } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, image: true } }, // ✨ 回傳時也帶 author
        tags: { include: { tag: true } },
      },
    });
  });

  return NextResponse.json(created, { status: 201 });
}
