// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { postPatchInput } from "@/lib/validation";
import { z, type ZodFlattenedError } from "zod";

type ParamsPromise = Promise<{ id: string }>;
type AppSession = Session | null;
type PatchData = z.infer<typeof postPatchInput>;

function isAdmin(session: AppSession): boolean {
  return session?.user?.role === "ADMIN";
}
function getUserId(session: AppSession): string | null {
  return session?.user?.id ?? null;
}

function pickUpdatableFields(
  input: unknown
):
  | {
      ok: true;
      data: { title?: string; content?: string; published?: boolean };
    }
  | { ok: false; error: ZodFlattenedError<PatchData> } {
  const parsed = postPatchInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() };
  }
  const { title, content, published } = parsed.data;
  return { ok: true, data: { title, content, published } };
}

export async function GET(_: NextRequest, ctx: { params: ParamsPromise }) {
  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      tags: { include: { tag: true } },
    },
  });
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

  if (isAdmin(session)) {
    await prisma.post.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  }

  const { count } = await prisma.post.deleteMany({
    where: { id, authorId: uid },
  });
  if (count === 0) return new NextResponse("Forbidden", { status: 403 });

  return new NextResponse(null, { status: 204 });
}
