import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ profile: null });

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) return NextResponse.json({ profile: null });

  return NextResponse.json({
    profile: {
      ...profile,
      sportStyle: JSON.parse(profile.sportStyle),
      foodPrefs: JSON.parse(profile.foodPrefs),
      wellnessCategories: JSON.parse(profile.wellnessCategories),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });

  const { sportStyle, foodPrefs, wellnessCategories, clothingSize, avoidPlastic, wellnessScore } = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.userId },
    update: {
      sportStyle: JSON.stringify(sportStyle ?? []),
      foodPrefs: JSON.stringify(foodPrefs ?? []),
      wellnessCategories: JSON.stringify(wellnessCategories ?? []),
      clothingSize,
      avoidPlastic: avoidPlastic ?? true,
      wellnessScore,
    },
    create: {
      userId: session.userId,
      sportStyle: JSON.stringify(sportStyle ?? []),
      foodPrefs: JSON.stringify(foodPrefs ?? []),
      wellnessCategories: JSON.stringify(wellnessCategories ?? []),
      clothingSize,
      avoidPlastic: avoidPlastic ?? true,
      wellnessScore,
    },
  });

  return NextResponse.json({ success: true, profile });
}
