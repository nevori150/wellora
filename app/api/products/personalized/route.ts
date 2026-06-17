import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

interface RequestBody {
  wellnessCategories: string[];
  seenIds: string[];       // מוצרים שהמשתמש כבר ראה
  currentIds: string[];    // מוצרים שמוצגים כרגע
}

function scoreProduct(
  product: (typeof products)[0],
  wellnessCategories: string[],
  seenIds: string[]
): number {
  const bestPrice  = Math.min(...product.prices.map(p => p.price));
  const worstPrice = Math.max(...product.prices.map(p => p.price));

  // 40% — התאמת קטגוריה לפרופיל
  const categoryScore = wellnessCategories.length === 0
    ? 0.5
    : wellnessCategories.includes(product.category) ? 1 : 0.15;

  // 30% — פוטנציאל חיסכון (אחוז הפרש בין היקר לזול)
  const savingsPct   = worstPrice > bestPrice ? (worstPrice - bestPrice) / worstPrice : 0;
  const savingsScore = Math.min(savingsPct * 2, 1);

  // 20% — דירוג (מנורמל 4–5 → 0–1)
  const ratingScore = Math.max(0, (product.rating - 4) / 1);

  // 10% — חדשות (לא נראה עדיין)
  const noveltyScore = seenIds.includes(product.id) ? 0 : 1;

  return (
    categoryScore * 0.4 +
    savingsScore  * 0.3 +
    ratingScore   * 0.2 +
    noveltyScore  * 0.1
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { wellnessCategories = [], seenIds = [], currentIds = [] } = body;

    // ציון לכל מוצר
    const scored = products.map(p => ({
      product: p,
      score: scoreProduct(p, wellnessCategories, seenIds),
    }));

    scored.sort((a, b) => b.score - a.score);

    // אם יש מוצרים נוכחיים — בדוק אם יש מועמד שמנצח ב-15%+
    if (currentIds.length > 0) {
      const currentScores = products
        .filter(p => currentIds.includes(p.id))
        .map(p => scoreProduct(p, wellnessCategories, seenIds));

      const avgCurrent = currentScores.reduce((a, b) => a + b, 0) / currentScores.length;
      const topScore   = scored[0]?.score ?? 0;

      if (topScore < avgCurrent * 1.15) {
        // המוצרים הנוכחיים עדיין טובים — לא מחליפים
        const kept = products.filter(p => currentIds.includes(p.id));
        return NextResponse.json({ products: kept, updated: false });
      }
    }

    const result = scored.slice(0, 4).map(s => s.product);
    return NextResponse.json({ products: result, updated: currentIds.length > 0 });

  } catch {
    return NextResponse.json({ products: products.slice(0, 4), updated: false });
  }
}
