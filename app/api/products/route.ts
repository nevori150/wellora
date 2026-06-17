import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as staticProducts } from "@/data/products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const cat = searchParams.get("cat") || "";
  const sort = searchParams.get("sort") || "best_price";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const dbCount = await prisma.product.count();

    // Fall back to static data if DB is empty
    if (dbCount === 0) {
      return NextResponse.json({ products: staticProducts, source: "static", total: staticProducts.length });
    }

    const where = {
      ...(cat ? { category: cat } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } },
          { tags: { contains: q } },
        ],
      } : {}),
    };

    const dbProducts = await prisma.product.findMany({
      where,
      include: { prices: { where: { inStock: true }, orderBy: { price: "asc" } } },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.product.count({ where });

    // Normalize to the shape the frontend expects
    const normalized = dbProducts
      .filter(p => p.prices.length > 0)
      .map(p => ({
        id: p.slug,
        name: p.name,
        category: p.category,
        emoji: "",
        description: p.description,
        image: p.image,
        size: p.size,
        comparisonType: p.comparisonType as "identical" | "similar" | "category",
        tags: JSON.parse(p.tags || "[]"),
        rating: p.rating,
        reviews: p.reviews,
        prices: p.prices.map(sp => ({
          store: sp.store,
          price: sp.price,
          url: sp.affiliateUrl || sp.url,
          logo: "",
          productTitle: sp.productTitle,
          brand: sp.brand,
          sizeValue: sp.sizeValue ?? undefined,
          sizeUnit: sp.sizeUnit ?? undefined,
        })),
      }));

    // Sort
    if (sort === "best_price") normalized.sort((a, b) => Math.min(...a.prices.map(p => p.price)) - Math.min(...b.prices.map(p => p.price)));
    else if (sort === "rating") normalized.sort((a, b) => b.rating - a.rating);
    else if (sort === "name") normalized.sort((a, b) => a.name.localeCompare(b.name, "he"));

    return NextResponse.json({ products: normalized, source: "db", total, page, limit });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ products: staticProducts, source: "static", total: staticProducts.length });
  }
}
