import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PersonalizedSection from "@/components/PersonalizedSection";
import { categories, products } from "@/data/products";
import { wellnessSites } from "@/data/sources";

export const metadata: Metadata = {
  title: "WELLZY — Live the Wellness Life | השוואת מחירי וולנס",
  description: "השווה מחירים על ויטמינים, מזון אורגני, בגדי ספורט וטיפוח טבעי מ-iHerb, Shein, YesStyle ועוד 20 אתרים. חסוך אחוזים בכל קנייה.",
  openGraph: {
    title: "WELLZY — Live the Wellness Life",
    description: "מנוע החיפוש של עולם הוולנס. השוואת מחירים חכמה מ-20+ אתרים.",
    url: "https://wellzy.co.il",
  },
  alternates: { canonical: "https://wellzy.co.il" },
};
import { getCategoryIcon } from "@/lib/categoryIcons";
import {
  User, Search, Tag, Globe, DollarSign, Gift,
  Zap, Sprout, Flame, Leaf,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <User size={26} />,
    title: "בנה פרופיל אישי",
    desc: "ספר לנו על אורח החיים שלך — מזון, ספורט, בגדים — והאפליקציה תלמד אותך",
    color: "#E8F2EC",
  },
  {
    step: "02",
    icon: <Search size={26} />,
    title: 'חיפוש אחד — כל האתרים',
    desc: 'WELLZY סורקת 20+ אתרים מישראל ומחו"ל — Shein, iHerb, Decathlon, Lush ועוד',
    color: "#F4EAD6",
  },
  {
    step: "03",
    icon: <Tag size={26} />,
    title: "קנה תמיד בזול ביותר",
    desc: "השוואת מחירים אוטומטית — לא תשלם יותר ממה שצריך, אף פעם",
    color: "#EEEEF8",
  },
];

const quickTags = [
  { label: "Shein", q: "כותנה" },
  { label: "iHerb", q: "טבעי" },
  { label: "Decathlon", q: "ספורט" },
  { label: "מזון בריא", q: "מזון בריא" },
  { label: "טיפוח", q: "מוצרי טיפוח" },
];

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  const siteGroups = wellnessSites.reduce((acc, site) => {
    if (!acc[site.category]) acc[site.category] = [];
    acc[site.category].push(site);
    return acc;
  }, {} as Record<string, typeof wellnessSites>);

  const siteCategoryOrder = [
    "ויטמינים ותוספים", "טיפוח טבעי", "אופנה בת קיימא",
    "ספורט וכושר", "מזון אורגני", "שינה וריקברי",
    "בריאות האישה", "בית ירוק וניקוי טבעי",
  ];

  return (
    <>
      <Header />
      <main>

        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section style={{
          background: "var(--hero-gradient)",
          padding: "100px 20px 84px",
          borderBottom: "1px solid var(--border-light)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -80, right: -60,
            width: 360, height: 360, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,107,84,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -60, left: -40,
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(184,149,90,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>

            {/* Social proof badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.78)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(61,107,84,0.18)",
              borderRadius: 50, padding: "7px 18px",
              fontSize: 12, fontWeight: 700, color: "var(--text-secondary)",
              marginBottom: 12, boxShadow: "0 2px 12px rgba(61,107,84,0.08)",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#22C55E",
                display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.22)",
              }} />
              127 משתמשים חסכו ₪38,400 השבוע
            </div>

            {/* Brand badge */}
            <div style={{ display: "block", marginBottom: 28 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(61,107,84,0.10)", border: "1px solid rgba(61,107,84,0.20)",
                borderRadius: 50, padding: "8px 22px",
                fontSize: 13, fontWeight: 700, color: "#2D5240",
                backdropFilter: "blur(8px)",
              }}>
                <Leaf size={14} />
                WELLZY — Live the Wellness Life
              </div>
            </div>

            <h1 style={{
              fontSize: "clamp(40px, 7vw, 66px)",
              fontWeight: 900, lineHeight: 1.08,
              marginBottom: 24, color: "var(--text)",
              fontFamily: "Heebo, sans-serif", letterSpacing: "-1.5px",
            }}>
              <span style={{
                background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Live the Wellness Life
              </span>
            </h1>

            <p style={{
              fontSize: 17, color: "var(--text-secondary)",
              marginBottom: 48, lineHeight: 1.8,
              maxWidth: 500, margin: "0 auto 48px",
            }}>
              WELLZY מחפשת בעשרות אתרים ומוצאת לך את המוצרים הטובים ביותר לאורח החיים שלך —
              ויטמינים, בגדים, ספורט וטיפוח.
            </p>

            {/* Search bar */}
            <Link href="/search" style={{ textDecoration: "none", display: "block", maxWidth: 580, margin: "0 auto 28px" }}>
              <div style={{
                background: "white", borderRadius: 50,
                padding: "10px 10px 10px 20px",
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer",
                border: "2px solid rgba(61,107,84,0.15)",
                boxShadow: "0 8px 40px rgba(61,107,84,0.13), 0 2px 10px rgba(0,0,0,0.04)",
              }}>
                <Search size={18} color="#94A3B8" />
                <span style={{ color: "var(--text-muted)", fontSize: 15, flex: 1, textAlign: "right" }}>
                  חפש מוצר, מותג, קטגוריה...
                </span>
                <span style={{
                  background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                  color: "white", borderRadius: 50,
                  padding: "13px 32px", fontSize: 15, fontWeight: 700,
                  flexShrink: 0, boxShadow: "0 4px 16px rgba(61,107,84,0.30)",
                }}>
                  חפש
                </span>
              </div>
            </Link>

            {/* Quick tags */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
              {quickTags.map(item => (
                <Link key={item.label} href={`/search?q=${encodeURIComponent(item.q)}`} style={{ textDecoration: "none" }}>
                  <span style={{
                    background: "rgba(255,255,255,0.80)", backdropFilter: "blur(6px)",
                    border: "1px solid rgba(61,107,84,0.15)",
                    borderRadius: 50, padding: "7px 18px",
                    fontSize: 13, color: "var(--text-secondary)",
                    cursor: "pointer", display: "inline-block",
                    fontWeight: 600,
                  }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Stats pills */}
            <div style={{
              display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap",
              paddingTop: 24, borderTop: "1px solid rgba(61,107,84,0.10)",
            }}>
              {[
                { icon: <Globe size={13} />, label: `${wellnessSites.length}+ אתרים` },
                { icon: <Sprout size={13} />, label: "8 קטגוריות" },
                { icon: <DollarSign size={13} />, label: "השוואת מחירים" },
                { icon: <Gift size={13} />, label: "חינם לחלוטין" },
              ].map(s => (
                <div key={s.label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.70)", backdropFilter: "blur(6px)",
                  border: "1px solid rgba(61,107,84,0.10)",
                  borderRadius: 50, padding: "6px 16px",
                  fontSize: 12, color: "var(--text-secondary)", fontWeight: 700,
                  fontFamily: "Heebo, sans-serif",
                }}>
                  <span style={{ color: "var(--sage)" }}>{s.icon}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PERSONALIZED ───────────────────────────────────────────── */}
        <PersonalizedSection />

        {/* ─── HOW IT WORKS ───────────────────────────────────────────── */}
        <section style={{ background: "white", padding: "80px 20px" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="section-label" style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Zap size={13} /> פשוט ומהיר
              </div>
              <h2 style={{
                fontSize: 30, fontWeight: 900, color: "var(--text)",
                fontFamily: "Heebo, sans-serif", letterSpacing: "-0.5px",
              }}>
                איך זה עובד?
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {steps.map((item, i) => (
                <div key={item.step} style={{
                  background: "white", borderRadius: 24,
                  border: "1.5px solid var(--border-light)",
                  padding: "32px 28px", textAlign: "right",
                  position: "relative",
                  boxShadow: "0 2px 16px rgba(37,34,32,0.05)",
                }}>
                  <div style={{
                    fontSize: 52, fontWeight: 900, lineHeight: 1,
                    background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    marginBottom: 14, opacity: 0.28,
                    fontFamily: "Heebo, sans-serif",
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: item.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--sage)", marginBottom: 16,
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}>
                    {item.icon}
                  </div>
                  <h3 style={{
                    fontSize: 16, fontWeight: 800, color: "var(--text)",
                    fontFamily: "Heebo, sans-serif", marginBottom: 8,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>
                    {item.desc}
                  </p>
                  {i < steps.length - 1 && (
                    <div style={{
                      position: "absolute", left: -14, top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 20, color: "var(--border)",
                      zIndex: 1,
                    }}>←</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WELLNESS SOURCES ───────────────────────────────────────── */}
        <section style={{
          background: "linear-gradient(180deg, #F0F7F2 0%, #F7F3EC 100%)",
          padding: "88px 20px",
          borderTop: "1px solid var(--border-light)",
          borderBottom: "1px solid var(--border-light)",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="section-label" style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Globe size={13} /> {wellnessSites.length} אתרים מישראל ומחו&quot;ל
              </div>
              <h2 style={{
                fontSize: 28, fontWeight: 900, color: "var(--text)",
                fontFamily: "Heebo, sans-serif", marginBottom: 10, letterSpacing: "-0.3px",
              }}>
                מאיפה אנחנו מחפשים?
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
                אתרים אמינים בעלי מוניטין — חלקם לא היית מגיע אליהם לבד
              </p>
            </div>

            {siteCategoryOrder.map(catName => {
              const sites = siteGroups[catName];
              if (!sites) return null;
              return (
                <div key={catName} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ color: "var(--sage)", display: "flex", alignItems: "center" }}>
                      {getCategoryIcon(catName, 15)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                      {catName}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {sites.map(site => (
                      <div key={site.name} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "white", border: "1px solid var(--border-light)",
                        borderRadius: 50, padding: "7px 16px",
                        fontSize: 13, fontWeight: 600, color: "var(--text-secondary)",
                        boxShadow: "0 1px 8px rgba(37,34,32,0.04)",
                        fontFamily: "Heebo, sans-serif",
                      }}>
                        {site.name}
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: site.origin === "ישראל" ? "var(--sage)" : "#9B8FC0",
                          background: site.origin === "ישראל" ? "var(--sage-light)" : "#F3F0F9",
                          borderRadius: 4, padding: "1px 5px",
                        }}>
                          {site.origin === "ישראל" ? "IL" : "INTL"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                * אנחנו מוסיפים אתרים חדשים כל הזמן
              </span>
            </div>
          </div>
        </section>

        {/* ─── CATEGORIES ─────────────────────────────────────────────── */}
        <section style={{ background: "white", padding: "88px 20px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="section-label" style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Sprout size={13} /> 8 קטגוריות
              </div>
              <h2 style={{
                fontSize: 28, fontWeight: 900, color: "var(--text)",
                fontFamily: "Heebo, sans-serif", letterSpacing: "-0.3px", marginBottom: 8,
              }}>
                גלה את עולם הוולנס
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
                מאות מוצרים, מחיר אחד
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14 }}>
              {categories.map(cat => (
                <Link key={cat.name} href={`/search?cat=${encodeURIComponent(cat.name)}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: "32px 18px 26px", textAlign: "center", cursor: "pointer", height: "100%" }}>
                    <div className="category-icon-wrap" style={{ background: cat.bg, color: cat.color }}>
                      {getCategoryIcon(cat.name, 22)}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
                      {cat.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURED PRODUCTS ──────────────────────────────────────── */}
        <section style={{
          background: "linear-gradient(180deg, #F5F0E8 0%, #FDFBF7 100%)",
          padding: "88px 20px",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 44,
              flexWrap: "wrap", gap: 14,
            }}>
              <div>
                <div className="section-label" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Flame size={13} /> דילים חמים
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                  מוצרים מובחרים
                </h2>
                <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
                  מחירים מושווים מכל האתרים
                </p>
              </div>
              <Link href="/search" style={{ textDecoration: "none" }}>
                <button className="findus-btn" style={{ padding: "11px 26px", fontSize: 14 }}>
                  כל המוצרים ←
                </button>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 18 }}>
              {featuredProducts.map(product => {
                const bestPrice = Math.min(...product.prices.map(p => p.price));
                const worstPrice = Math.max(...product.prices.map(p => p.price));
                const bestStore = product.prices.find(p => p.price === bestPrice)!;
                const worstStore = product.prices.find(p => p.price === worstPrice)!;
                const hasSaving = worstPrice > bestPrice;
                const savingPct = hasSaving ? Math.round(((worstPrice - bestPrice) / worstPrice) * 100) : 0;
                return (
                  <div key={product.id} className="card" style={{ overflow: "hidden" }}>
                    <div className="product-img-wrap" style={{ height: 180 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image} alt={product.name} />
                      <div className="product-img-overlay" />
                      <span style={{
                        position: "absolute", top: 12, right: 12,
                        background: "rgba(255,255,255,0.94)", backdropFilter: "blur(4px)",
                        borderRadius: 50, padding: "4px 14px",
                        fontSize: 11, fontWeight: 700, color: "var(--sage)",
                        border: "1px solid var(--sage-light)",
                      }}>
                        {product.category}
                      </span>
                      {hasSaving && (
                        <span style={{
                          position: "absolute", top: 12, left: 12,
                          background: "linear-gradient(135deg, #059669, #34D399)",
                          color: "white", borderRadius: 50,
                          padding: "4px 10px", fontSize: 11, fontWeight: 800,
                          boxShadow: "0 2px 8px rgba(5,150,105,0.28)",
                        }}>
                          -{savingPct}%
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "18px 20px 22px" }}>
                      <div style={{ fontSize: 13, color: "#F59E0B", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                        {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>({product.reviews.toLocaleString()})</span>
                      </div>
                      <h3 style={{
                        fontSize: 15, fontWeight: 700, marginBottom: 10,
                        color: "var(--text)", lineHeight: 1.45, fontFamily: "Heebo, sans-serif",
                      }}>
                        {product.name}
                      </h3>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                        {product.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            background: "var(--bg-alt)", borderRadius: 50,
                            padding: "3px 10px", fontSize: 11,
                            color: "var(--text-secondary)", border: "1px solid var(--border-light)",
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>מחיר הכי טוב</div>
                          <div style={{
                            fontSize: 28, fontWeight: 900, lineHeight: 1.1,
                            background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                          }}>
                            ₪{bestPrice}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            {bestStore.store}
                          </div>
                          {hasSaving && (
                            <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 3 }}>
                              חסכת ₪{worstPrice - bestPrice} לעומת {worstStore.store}
                            </div>
                          )}
                        </div>
                        <Link href={`/search?q=${encodeURIComponent(product.name)}`} style={{ textDecoration: "none" }}>
                          <button className="findus-btn" style={{ padding: "10px 20px", fontSize: 13 }}>
                            השוואה
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────────────── */}
        <section style={{
          background: "var(--hero-gradient)",
          borderTop: "1px solid var(--border-light)",
          padding: "104px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -80, left: "5%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,107,84,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ maxWidth: 580, margin: "0 auto", position: "relative" }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}>
              {[
                { icon: <Leaf size={15} />, text: "20+ אתרים" },
                { icon: <DollarSign size={15} />, text: "ממוצע חיסכון ₪180" },
                { icon: <Zap size={15} />, text: "תוצאות תוך שניות" },
              ].map(item => (
                <div key={item.text} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(61,107,84,0.14)",
                  borderRadius: 50, padding: "9px 20px",
                  fontSize: 13, fontWeight: 700, color: "var(--text)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  <span style={{ color: "var(--sage)" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            <h2 style={{
              fontSize: 38, fontWeight: 900, marginBottom: 10,
              color: "var(--text)", fontFamily: "Heebo, sans-serif", letterSpacing: "-1px",
            }}>
              מוכן להתחיל?
            </h2>
            <p style={{
              fontSize: 16, color: "var(--sage)", fontWeight: 700,
              marginBottom: 20, fontFamily: "Heebo, sans-serif",
            }}>
              Live the Wellness Life
            </p>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 44, lineHeight: 1.8 }}>
              בנה את הפרופיל שלך בדקה אחת,<br />
              וקבל המלצות אישיות + מחירים מושווים מכל האתרים
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{ textDecoration: "none" }}>
                <button className="findus-btn" style={{ padding: "16px 48px", fontSize: 17 }}>
                  הצטרף בחינם ←
                </button>
              </Link>
              <Link href="/search" style={{ textDecoration: "none" }}>
                <button className="btn-outline" style={{ padding: "16px 36px", fontSize: 17 }}>
                  גלה מוצרים
                </button>
              </Link>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
              חינם לחלוטין · ללא כרטיס אשראי · 2 דקות להרשמה
            </p>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{
        background: "#181512", color: "#6E665E",
        padding: "56px 20px 36px",
        fontFamily: "Heebo, sans-serif",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 36, marginBottom: 44 }}>
            <div>
              <div style={{
                fontSize: 26, fontWeight: 900, marginBottom: 10,
                background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                WELLZY
              </div>
              <div style={{ fontSize: 13, color: "#8A8070", lineHeight: 1.7, maxWidth: 230 }}>
                השוואת מחירים חכמה לאורח חיים בריא.<br />
                Live the Wellness Life.
              </div>
            </div>

            <div style={{ display: "flex", gap: 52, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#5A534D", marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>
                  ניווט
                </div>
                {[
                  { label: "דף הבית", href: "/" },
                  { label: "חיפוש", href: "/search" },
                  { label: "מועדפים", href: "/favorites" },
                  { label: "פרופיל", href: "/profile" },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{ display: "block", textDecoration: "none", color: "#8A8070", fontSize: 13, marginBottom: 10 }}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#5A534D", marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>
                  קטגוריות
                </div>
                {["ויטמינים ותוספים", "טיפוח טבעי", "ספורט וכושר", "מזון אורגני"].map(l => (
                  <Link key={l} href={`/search?cat=${encodeURIComponent(l)}`} style={{ display: "block", textDecoration: "none", color: "#8A8070", fontSize: 13, marginBottom: 10 }}>
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #2A2520", paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#4A4440" }}>
              © 2026 WELLZY · כל הזכויות שמורות
            </div>
            <div style={{ fontSize: 12, color: "#4A4440" }}>
              Live the Wellness Life
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
