// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { postInput } from "@/lib/validation";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } }, // 可留可拿掉
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // 先取出 userId，再檢查
  const userId = session?.user?.id ?? null;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const json = await req.json();
  const parsed = postInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.flatten(), { status: 400 });
  }

  const { title, content, published, tags = [] } = parsed.data;
  const normTags = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];

  const result = await prisma.$transaction(async (tx) => {
    const tagRecords = await Promise.all(
      normTags.map((name) =>
        tx.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    const created = await tx.post.create({
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
      include: { tags: { include: { tag: true } } },
    });

    return created;
  });

  return NextResponse.json(result, { status: 201 });
}
