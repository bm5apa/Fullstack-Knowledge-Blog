import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { postPatchInput } from "@/lib/validation";

function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  return post
    ? NextResponse.json(post)
    : new NextResponse("Not Found", { status: 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const json = await req.json();
  const parsed = postPatchInput.safeParse(json);
  if (!parsed.success)
    return NextResponse.json(parsed.error.flatten(), { status: 400 });

  const userId = session.user.id as string;

  if (isAdmin(session)) {
    const updated = await prisma.post.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  }

  const { count } = await prisma.post.updateMany({
    where: { id: params.id, authorId: userId },
    data: parsed.data,
  });
  if (count === 0) return new NextResponse("Forbidden", { status: 403 });

  const updated = await prisma.post.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  if (isAdmin(session)) {
    await prisma.post.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  }

  const { count } = await prisma.post.deleteMany({
    where: { id: params.id, authorId: session.user.id as string },
  });
  if (count === 0) return new NextResponse("Forbidden", { status: 403 });

  return new NextResponse(null, { status: 204 });
}
