import { products, DATA_LAST_UPDATED } from "@/data/products";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { calcPricePerUnit } from "@/lib/priceUtils";
import type { Metadata } from "next";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { CheckCircle2, Scale, AlertTriangle, BarChart3, Clock, Leaf } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return products.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find(p => p.id === id);
  if (!product) return {};
  const bestPrice = Math.min(...product.prices.map(p => p.price));
  const bestStore = product.prices.find(p => p.price === bestPrice)!;
  return {
    title: `${product.name} — ₪${bestPrice} ב-${bestStore.store} | Wellora`,
    description: `השווה מחירים ל${product.name} ב-${product.prices.length} חנויות. מחיר הכי טוב: ₪${bestPrice} ב-${bestStore.store}. ${product.description}`,
    openGraph: {
      title: `${product.name} — ₪${bestPrice} | Wellora`,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find(p => p.id === id);
  if (!product) notFound();

  const sortedPrices = product.prices.slice().sort((a, b) => a.price - b.price);
  const bestPrice = sortedPrices[0].price;
  const worstPrice = sortedPrices[sortedPrices.length - 1].price;
  const bestStore = sortedPrices[0];
  const savingPct = worstPrice > bestPrice
    ? Math.round(((worstPrice - bestPrice) / worstPrice) * 100)
    : 0;

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const ct = product.comparisonType;
  const badge =
    ct === "identical"
      ? { icon: <CheckCircle2 size={22} />, color: "#059669", bg: "#F0FDF4", border: "#86EFAC",
          title: "השוואה ישירה — אותו מוצר בדיוק",
          sub: "המחיר הוא הדבר היחיד השונה — ניתן להשוות ישירות" }
      : ct === "similar"
      ? { icon: <Scale size={22} />, color: "#B8955A", bg: "#FDF8F0", border: "#E4C98A",
          title: "מוצרים דומים — מפרטים זהים, מותגים שונים",
          sub: "ניתן להשוות, אך בדוק את ההבדלים בטבלה לפני הרכישה" }
      : { icon: <AlertTriangle size={22} />, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA",
          title: "אותה קטגוריה — מוצרים שונים",
          sub: "אלה מוצרים שונים — השוואת מחיר ישירה אינה תקינה, בדוק ההבדלים" };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
      bestRating: 5,
      worstRating: 1,
    },
    offers: sortedPrices.map(p => ({
      "@type": "Offer",
      price: p.price,
      priceCurrency: "ILS",
      seller: { "@type": "Organization", name: p.store },
      url: p.url,
      availability: "https://schema.org/InStock",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)" }}>

        {/* ─── Breadcrumb ─── */}
        <div style={{ background: "white", borderBottom: "1px solid var(--border-light)", padding: "12px 20px" }}>
          <div style={{
            maxWidth: 900, margin: "0 auto",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "var(--text-muted)", fontFamily: "Heebo, sans-serif",
            flexWrap: "wrap",
          }}>
            <Link href="/" style={{ color: "var(--sage)", textDecoration: "none", fontWeight: 600 }}>בית</Link>
            <span>›</span>
            <Link href={`/search?cat=${encodeURIComponent(product.category)}`} style={{ color: "var(--sage)", textDecoration: "none", fontWeight: 600 }}>
              {product.category}
            </Link>
            <span>›</span>
            <span style={{ color: "var(--text)" }}>{product.name}</span>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

          {/* ─── Hero ─── */}
          <div style={{ display: "flex", gap: 32, marginBottom: 32, flexWrap: "wrap" }}>

            {/* תמונה */}
            <div style={{
              width: 300, height: 260, borderRadius: 24, overflow: "hidden",
              border: "1px solid var(--border-light)", flexShrink: 0,
              background: "var(--bg-alt)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* מידע */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{
                  background: "var(--sage-light)", color: "var(--sage)",
                  borderRadius: 50, padding: "4px 14px", fontSize: 12, fontWeight: 700,
                  border: "1px solid rgba(61,107,84,0.18)",
                }}>
                  {product.category}
                </span>
                <span style={{ color: "#F59E0B", fontSize: 14 }}>★ {product.rating}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  ({product.reviews.toLocaleString()} ביקורות)
                </span>
                <span style={{
                  fontSize: 11, color: "var(--text-muted)",
                  background: "var(--bg)", borderRadius: 50,
                  padding: "3px 10px", border: "1px solid var(--border-light)",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <Clock size={11} /> עודכן: {DATA_LAST_UPDATED}
                </span>
              </div>

              <h1 style={{
                fontSize: 24, fontWeight: 900, color: "var(--text)",
                fontFamily: "Heebo, sans-serif", lineHeight: 1.3, marginBottom: 8,
              }}>
                {product.name}
              </h1>

              {product.size && (
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{product.size}</div>
              )}

              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 18 }}>
                {product.description}
              </p>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{
                    background: "var(--bg-alt)", borderRadius: 50,
                    padding: "4px 12px", fontSize: 12, color: "var(--text-secondary)",
                    border: "1px solid var(--border-light)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                background: "white", border: "1.5px solid var(--border-light)",
                borderRadius: 20, padding: "18px 22px",
              }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, fontFamily: "Heebo, sans-serif" }}>
                  מחיר הכי טוב נמצא ב-{bestStore.store} {bestStore.logo}
                </div>
                <div style={{
                  fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 4,
                  background: "var(--brand-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  ₪{bestPrice}
                </div>
                {savingPct > 0 && (
                  <div style={{ fontSize: 13, color: "#059669", fontWeight: 700, marginBottom: 14 }}>
                    חסכת {savingPct}% לעומת המחיר הגבוה ביותר (₪{worstPrice})
                  </div>
                )}
                <a href={bestStore.url} style={{ textDecoration: "none" }}>
                  <button className="findus-btn" style={{ width: "100%", fontSize: 15 }}>
                    קנה ב-{bestStore.store} — ₪{bestPrice} →
                  </button>
                </a>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <FavoriteButton productId={product.id} />
                  <ShareButton title={product.name} price={bestPrice} store={bestStore.store} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Comparison badge ─── */}
          <div style={{
            background: badge.bg, border: `1.5px solid ${badge.border}`,
            borderRadius: 16, padding: "16px 20px", marginBottom: 28,
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <span style={{ color: badge.color, flexShrink: 0, display: "flex" }}>{badge.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: badge.color, fontFamily: "Heebo, sans-serif", marginBottom: 4 }}>
                {badge.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {badge.sub}
              </div>
            </div>
          </div>

          {/* ─── טבלת מפרטים (similar / category) ─── */}
          {product.compareAttributes && product.compareAttributes.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 18, fontWeight: 800, fontFamily: "Heebo, sans-serif",
                color: "var(--text)", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <BarChart3 size={18} color="var(--sage)" /> השוואת מפרטים
              </h2>
              <div style={{ overflowX: "auto", background: "white", borderRadius: 16, border: "1px solid var(--border-light)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "Heebo, sans-serif" }}>
                  <thead>
                    <tr style={{ background: "var(--bg)" }}>
                      <th style={{ textAlign: "right", padding: "12px 16px", color: "var(--text-muted)", fontWeight: 700, borderBottom: "1px solid var(--border-light)", minWidth: 100 }}>
                        מאפיין
                      </th>
                      {product.prices.map(p => (
                        <th key={p.store} style={{
                          textAlign: "center", padding: "12px 14px",
                          color: "var(--text)", fontWeight: 700,
                          borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap",
                        }}>
                          {p.logo} {p.store}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.compareAttributes.map((attr, ai) => {
                      const vals = product.prices.map(p => p.attributes?.[attr] ?? "—");
                      const allSame = vals.every(v => v === vals[0]);
                      return (
                        <tr key={attr} style={{ background: ai % 2 === 0 ? "white" : "var(--bg)" }}>
                          <td style={{ padding: "10px 16px", fontWeight: 700, color: "var(--text-secondary)", borderBottom: "1px solid var(--border-light)" }}>
                            {attr}
                          </td>
                          {vals.map((val, vi) => (
                            <td key={vi} style={{
                              padding: "10px 14px", textAlign: "center",
                              borderBottom: "1px solid var(--border-light)",
                              color: val.includes("✓") ? "#059669" : (val === "ללא" || val.startsWith("לא")) ? "#DC2626" : "var(--text)",
                              fontWeight: !allSame ? 700 : 400,
                              background: !allSame && val.includes("✓") ? "#F0FDF4" : "transparent",
                            }}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── כל המחירים ─── */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 18, fontWeight: 800, fontFamily: "Heebo, sans-serif",
              color: "var(--text)", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <BarChart3 size={18} color="var(--sage)" /> השוואת מחירים ב-{product.prices.length} חנויות
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedPrices.map(p => {
                const isCheapest = p.price === bestPrice;
                const ppu = calcPricePerUnit(p.price, p.sizeValue, p.sizeUnit);
                return (
                  <div key={p.store} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 20px",
                    background: isCheapest ? "#F0FDF4" : "white",
                    border: `1.5px solid ${isCheapest ? "#86EFAC" : "var(--border-light)"}`,
                    borderRadius: 16, flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: 26 }}>{p.logo}</span>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                        {p.store}
                      </div>
                      {p.productTitle && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", direction: "ltr", textAlign: "right", marginTop: 2 }}>
                          {p.productTitle}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: isCheapest ? "#059669" : "var(--text)" }}>
                        ₪{p.price}
                      </div>
                      {ppu && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{ppu}</div>}
                    </div>
                    {isCheapest && <span className="badge-best-price">הכי זול</span>}
                    <a href={p.url} style={{ textDecoration: "none" }}>
                      <button style={{
                        background: isCheapest ? "#059669" : "var(--bg)",
                        color: isCheapest ? "white" : "var(--text-secondary)",
                        border: `1px solid ${isCheapest ? "#059669" : "var(--border-light)"}`,
                        borderRadius: 50, padding: "9px 20px",
                        cursor: "pointer", fontFamily: "Heebo, sans-serif",
                        fontSize: 14, fontWeight: 600,
                      }}>
                        לאימות ורכישה →
                      </button>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── מוצרים קשורים ─── */}
          {related.length > 0 && (
            <div>
              <h2 style={{
                fontSize: 18, fontWeight: 800, fontFamily: "Heebo, sans-serif",
                color: "var(--text)", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Leaf size={18} color="var(--sage)" /> מוצרים נוספים ב{product.category}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
                {related.map(rel => {
                  const relBest = Math.min(...rel.prices.map(p => p.price));
                  return (
                    <Link key={rel.id} href={`/product/${rel.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: 16, cursor: "pointer" }}>
                        <div style={{ width: "100%", height: 130, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={rel.image} alt={rel.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", fontFamily: "Heebo, sans-serif", marginBottom: 6 }}>
                          {rel.name}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "var(--sage)" }}>₪{relBest}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
