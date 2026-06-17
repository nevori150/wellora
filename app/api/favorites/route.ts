import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    select: { productId: true },
  });
  return NextResponse.json({ favorites: favorites.map((f) => f.productId) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });

  const { productId } = await req.json();

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_productId: { userId: session.userId, productId } },
    });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({
      data: { userId: session.userId, productId },
    });
    return NextResponse.json({ favorited: true });
  }
}
