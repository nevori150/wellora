"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product, categories as allCategories } from "@/data/products";
import FavoriteButton from "@/components/FavoriteButton";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { Leaf, Target, DollarSign, Heart } from "lucide-react";

interface ProfileData {
  wellnessCategories?: string[];
  sportStyle?: string[];
  foodPrefs?: string[];
}

const SEEN_KEY    = "wellora_seen_products";
const CURRENT_KEY = "wellora_current_products";

function getSeenIds(): string[]    { try { return JSON.parse(localStorage.getItem(SEEN_KEY)    ?? "[]"); } catch { return []; } }
function getCurrentIds(): string[] { try { return JSON.parse(localStorage.getItem(CURRENT_KEY) ?? "[]"); } catch { return []; } }
function markSeen(ids: string[])   { try { const prev = getSeenIds(); const merged = Array.from(new Set([...prev, ...ids])).slice(-50); localStorage.setItem(SEEN_KEY, JSON.stringify(merged)); } catch {} }
function saveCurrent(ids: string[]){ try { localStorage.setItem(CURRENT_KEY, JSON.stringify(ids)); } catch {} }

function Skeleton() {
  return (
    <section style={{
      background: "linear-gradient(180deg, #FDFBF7 0%, #F0F7F2 100%)",
      padding: "72px 20px",
      borderTop: "1px solid var(--border-light)",
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .skel {
          background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
          background-size: 1200px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 8px;
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div className="skel" style={{ height: 24, width: 160, borderRadius: 50, marginBottom: 12 }} />
          <div className="skel" style={{ height: 28, width: 220, marginBottom: 8 }} />
          <div className="skel" style={{ height: 16, width: 300 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[80, 110, 95, 130].map(w => (
            <div key={w} className="skel" style={{ height: 34, width: w, borderRadius: 50 }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid #eee" }}>
              <div className="skel" style={{ height: 150, borderRadius: 0 }} />
              <div style={{ padding: "16px 18px 20px" }}>
                <div className="skel" style={{ height: 16, width: "85%", marginBottom: 10 }} />
                <div className="skel" style={{ height: 16, width: "60%", marginBottom: 16 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="skel" style={{ height: 12, width: 60, marginBottom: 6 }} />
                    <div className="skel" style={{ height: 28, width: 70 }} />
                  </div>
                  <div className="skel" style={{ height: 36, width: 80, borderRadius: 50 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PersonalizedSection() {
  const [userName, setUserName] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [recs, setRecs] = useState<Product[]>([]);
  const [justUpdated, setJustUpdated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(async d => {
        if (!d.user) { setIsLoggedIn(false); setLoaded(true); return; }

        setIsLoggedIn(true);
        setUserName(d.user.name?.split(" ")[0] ?? null);

        const pd = await fetch("/api/profile").then(r => r.json());
        if (!pd.profile) { setLoaded(true); return; }

        setProfileData(pd.profile);
        const cats = pd.profile.wellnessCategories ?? [];
        if (cats.length === 0) { setLoaded(true); return; }

        const res = await fetch("/api/products/personalized", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wellnessCategories: cats,
            seenIds: getSeenIds(),
            currentIds: getCurrentIds(),
          }),
        }).then(r => r.json()).catch(() => ({ products: [], updated: false }));

        setRecs(res.products ?? []);
        if (res.updated) setJustUpdated(true);

        const ids = (res.products ?? []).map((p: Product) => p.id);
        saveCurrent(ids);
        markSeen(ids);

        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <Skeleton />;

  if (!isLoggedIn) {
    return (
      <section style={{
        background: "linear-gradient(135deg, #F0F7F2 0%, #FDF8F0 100%)",
        padding: "72px 20px",
        borderTop: "1px solid var(--border-light)",
        borderBottom: "1px solid var(--border-light)",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--sage-light)",
            border: "1px solid rgba(61,107,84,0.18)",
            borderRadius: 50,
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--sage)",
            marginBottom: 20,
          }}>
            <Leaf size={12} />
            התאמה אישית
          </div>

          <h2 style={{
            fontSize: 28,
            fontWeight: 900,
            color: "var(--text)",
            fontFamily: "Heebo, sans-serif",
            marginBottom: 12,
            lineHeight: 1.3,
          }}>
            Wellora תמצא לך בדיוק מה שאתה מחפש
          </h2>

          <p style={{
            fontSize: 16,
            color: "var(--text-muted)",
            fontFamily: "Heebo, sans-serif",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 36px",
          }}>
            אמור לנו על אורח החיים שלך — ו-Wellora תסנן מעשרות אתרים
            ותציג לך רק את המוצרים שרלוונטיים אליך, במחיר הכי טוב.
          </p>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
            marginBottom: 40,
          }}>
            {[
              { icon: <Target size={24} />, text: "מוצרים מותאמים אישית" },
              { icon: <DollarSign size={24} />, text: "השוואת מחירים חכמה" },
              { icon: <Heart size={24} />, text: "שמירת מועדפים" },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--sage)" }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="findus-btn" style={{ padding: "14px 40px", fontSize: 15, fontWeight: 800 }}>
                הצטרף חינם — בנה את הפרופיל שלך
              </button>
            </Link>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <button className="btn-outline" style={{ padding: "14px 28px", fontSize: 14 }}>
                כבר יש לי חשבון
              </button>
            </Link>
          </div>

          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 16, fontFamily: "Heebo, sans-serif" }}>
            חינם לחלוטין · ללא כרטיס אשראי · 2 דקות להרשמה
          </p>
        </div>
      </section>
    );
  }

  const cats = profileData?.wellnessCategories ?? [];
  if (cats.length === 0) {
    return (
      <section style={{
        background: "linear-gradient(135deg, #F0F7F2 0%, #FDF8F0 100%)",
        padding: "48px 20px",
        borderTop: "1px solid var(--border-light)",
        borderBottom: "1px solid var(--border-light)",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 900,
            color: "var(--text)",
            fontFamily: "Heebo, sans-serif",
            marginBottom: 10,
          }}>
            היי {userName} — בוא נתאים את Wellora עבורך
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "Heebo, sans-serif", marginBottom: 24 }}>
            עוד לא בחרת תחומי וולנס. תן לנו לדעת מה מעניין אותך.
          </p>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <button className="findus-btn" style={{ padding: "12px 32px", fontSize: 14 }}>
              השלם את הפרופיל שלך ←
            </button>
          </Link>
        </div>
      </section>
    );
  }

  if (recs.length === 0) return null;

  return (
    <section style={{
      background: "linear-gradient(180deg, #FDFBF7 0%, #F0F7F2 100%)",
      padding: "72px 20px",
      borderTop: "1px solid var(--border-light)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--sage-light)",
              border: "1px solid rgba(61,107,84,0.18)",
              borderRadius: 50,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--sage)",
              marginBottom: 10,
            }}>
              <Leaf size={12} />
              מותאם לפרופיל שלך
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                {userName ? `בשבילך, ${userName}` : "בשבילך"}
              </h2>
              {justUpdated && (
                <span style={{
                  background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                  color: "white",
                  borderRadius: 50,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  ✦ עודכן בשבילך
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "Heebo, sans-serif" }}>
              לפי התחומים שבחרת: {cats.slice(0, 3).join(" · ")}{cats.length > 3 ? ` +${cats.length - 3}` : ""}
            </p>
          </div>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <button className="btn-outline" style={{ padding: "9px 20px", fontSize: 13 }}>ערוך פרופיל</button>
          </Link>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {cats.map(cat => {
            const found = allCategories.find(c => c.name === cat);
            void found;
            return (
              <Link key={cat} href={`/search?cat=${encodeURIComponent(cat)}`} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "white",
                  border: "1.5px solid var(--sage)",
                  borderRadius: 50,
                  padding: "6px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--sage)",
                  cursor: "pointer",
                  fontFamily: "Heebo, sans-serif",
                }}>
                  <span style={{ display: "flex", alignItems: "center" }}>{getCategoryIcon(cat, 14)}</span>
                  {cat}
                </span>
              </Link>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {recs.map(product => {
            const bestPrice = Math.min(...product.prices.map(p => p.price));
            const bestStore = product.prices.find(p => p.price === bestPrice)!;
            return (
              <div key={product.id} className="card" style={{ overflow: "hidden" }}>
                <div className="product-img-wrap" style={{ height: 160 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} />
                  <div className="product-img-overlay" />
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(255,255,255,0.94)", backdropFilter: "blur(4px)",
                    borderRadius: 50, padding: "3px 12px",
                    fontSize: 11, fontWeight: 700, color: "var(--sage)",
                    border: "1px solid var(--sage-light)",
                  }}>
                    {product.category}
                  </span>
                  <div style={{ position: "absolute", top: 8, left: 8 }}>
                    <FavoriteButton productId={product.id} />
                  </div>
                </div>
                <div style={{ padding: "16px 18px 20px" }}>
                  <div style={{ fontSize: 12, color: "#F59E0B", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>({product.reviews.toLocaleString()})</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text)", lineHeight: 1.45, fontFamily: "Heebo, sans-serif" }}>
                    {product.name}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>מחיר הכי טוב</div>
                      <div style={{
                        fontSize: 24, fontWeight: 900, lineHeight: 1.1,
                        background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>
                        ₪{bestPrice}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {bestStore.store}
                      </div>
                    </div>
                    <Link href={`/search?q=${encodeURIComponent(product.name)}`} style={{ textDecoration: "none" }}>
                      <button className="findus-btn" style={{ padding: "9px 18px", fontSize: 13 }}>השוואה</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/search" style={{ textDecoration: "none" }}>
            <button className="btn-outline" style={{ padding: "12px 32px", fontSize: 14 }}>
              ראה את כל התוצאות שלך ←
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
