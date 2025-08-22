import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { postPatchInput } from "@/lib/validation";

// Next 15：路由 context.params 是 Promise，要 await
type ParamsPromise = Promise<{ id: string }>;
type AppSession = Session | null;

function isAdmin(session: AppSession): boolean {
  return session?.user?.role === "ADMIN";
}

function getUserId(session: AppSession): string | null {
  return session?.user?.id ?? null;
}

// 安全：只允許可直接更新的欄位（不要把 tags 直接塞進 Prisma relation）
// 這樣就不會觸發 data.tags 型別不符
function pickUpdatableFields(input: unknown) {
  const parsed = postPatchInput.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: parsed.error.flatten() };

  const { title, content, published } = parsed.data; // 忽略 tags
  return { ok: true as const, data: { title, content, published } };
}

export async function GET(_: NextRequest, ctx: { params: ParamsPromise }) {
  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({ where: { id } });
  return post
    ? NextResponse.json(post)
    : new NextResponse("Not Found", { status: 404 });
}

export async function PATCH(req: NextRequest, ctx: { params: ParamsPromise }) {
  const session = await getServerSession(authOptions);
  const uid = getUserId(session);
  if (!uid) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await ctx.params;

  const pick = pickUpdatableFields(await req.json());
  if (!pick.ok) return NextResponse.json(pick.error, { status: 400 });

  if (isAdmin(session)) {
    const updated = await prisma.post.update({
      where: { id },
      data: pick.data,
    });
    return NextResponse.json(updated);
  }

  const { count } = await prisma.post.updateMany({
    where: { id, authorId: uid },
    data: pick.data,
  });
  if (count === 0) return new NextResponse("Forbidden", { status: 403 });

  const updated = await prisma.post.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, ctx: { params: ParamsPromise }) {
  const session = await getServerSession(authOptions);
  const uid = getUserId(session);
  if (!uid) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await ctx.params;

  try {
    if (isAdmin(session)) {
      await prisma.$transaction(async (tx) => {
        await tx.postTag.deleteMany({ where: { postId: id } });
        await tx.post.delete({ where: { id } });
      });
      return new NextResponse(null, { status: 204 });
    }

    // 非管理員：只能刪自己文章
    const result = await prisma.$transaction(async (tx) => {
      // 先確認這篇是自己的
      const owned = await tx.post.findFirst({
        where: { id, authorId: uid },
        select: { id: true },
      });
      if (!owned) return { ok: false as const };

      await tx.postTag.deleteMany({ where: { postId: id } });
      const del = await tx.post.deleteMany({ where: { id, authorId: uid } });
      return { ok: del.count > 0 } as const;
    });

    if (!result.ok) return new NextResponse("Forbidden", { status: 403 });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    // 讓前端看到實際錯誤字串，方便除錯
    return new NextResponse(`Delete failed: ${e?.message ?? e}`, {
      status: 500,
    });
  }
}
