import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as staticProducts } from "@/data/products";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;

  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug: id },
      include: { prices: { where: { inStock: true }, orderBy: { price: "asc" } } },
    });

    if (dbProduct && dbProduct.prices.length > 0) {
      return NextResponse.json({
        id: dbProduct.slug,
        name: dbProduct.name,
        category: dbProduct.category,
        emoji: "",
        description: dbProduct.description,
        image: dbProduct.image,
        size: dbProduct.size,
        comparisonType: dbProduct.comparisonType,
        tags: JSON.parse(dbProduct.tags || "[]"),
        rating: dbProduct.rating,
        reviews: dbProduct.reviews,
        prices: dbProduct.prices.map(sp => ({
          store: sp.store,
          price: sp.price,
          url: sp.affiliateUrl || sp.url,
          logo: "",
          productTitle: sp.productTitle,
          brand: sp.brand,
          sizeValue: sp.sizeValue ?? undefined,
          sizeUnit: sp.sizeUnit ?? undefined,
        })),
      });
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback to static
  const staticProduct = staticProducts.find(p => p.id === id);
  if (staticProduct) return NextResponse.json(staticProduct);

  return NextResponse.json({ error: "not found" }, { status: 404 });
}
