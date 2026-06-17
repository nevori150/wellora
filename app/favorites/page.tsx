"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { products } from "@/data/products";
import { Heart, ShoppingBag } from "lucide-react";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (!d.user) { setLoggedIn(false); setLoading(false); return; }
      fetch("/api/favorites").then(r => r.json()).then(d => {
        setFavoriteIds(d.favorites ?? []);
        setLoading(false);
      });
    });
  }, []);

  const toggle = async (productId: string) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    setFavoriteIds(prev => data.favorited ? [...prev, productId] : prev.filter(id => id !== productId));
  };

  const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

  if (!loggedIn) return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "var(--sage-light)",
            border: "2px solid rgba(61,107,84,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--sage)", margin: "0 auto 20px",
          }}>
            <Heart size={36} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: "Heebo, sans-serif", marginBottom: 8 }}>
            המועדפים שלך ממתינים
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>התחבר כדי לראות ולשמור מועדפים</p>
          <Link href="/login">
            <button className="findus-btn" style={{ padding: "12px 32px", fontSize: 16 }}>כניסה</button>
          </Link>
        </div>
      </main>
    </>
  );

  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)" }}>

        <div style={{
          background: "linear-gradient(135deg, #F0F7F2 0%, #FDF8F0 100%)",
          borderBottom: "1px solid rgba(61,107,84,0.12)",
          padding: "36px 20px",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Heart size={22} color="var(--sage)" />
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                המועדפים שלי
              </h1>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {loading ? "טוען..." : favoriteProducts.length === 0
                ? "עדיין לא שמרת מועדפים"
                : `${favoriteProducts.length} מוצרים שמורים`}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

          {!loading && favoriteProducts.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "72px 20px",
              background: "white",
              borderRadius: 20,
              border: "1px solid rgba(61,107,84,0.1)",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--bg-alt)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", margin: "0 auto 16px",
              }}>
                <ShoppingBag size={32} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "Heebo, sans-serif", color: "var(--text)", marginBottom: 8 }}>
                עדיין לא שמרת מועדפים
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                לחץ על הלב על מוצר כלשהו כדי לשמור אותו כאן
              </p>
              <Link href="/search">
                <button className="findus-btn" style={{ padding: "12px 28px" }}>גלה מוצרים</button>
              </Link>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <style>{`
                @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
                .skel { background: linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%); background-size:1200px 100%; animation:shimmer 1.4s infinite linear; border-radius:8px; }
              `}</style>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #eee", display: "flex", gap: 16, alignItems: "center" }}>
                  <div className="skel" style={{ width: 80, height: 80, borderRadius: 14, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skel" style={{ height: 14, width: "50%", marginBottom: 10 }} />
                    <div className="skel" style={{ height: 18, width: "75%", marginBottom: 10 }} />
                    <div className="skel" style={{ height: 12, width: "30%" }} />
                  </div>
                  <div className="skel" style={{ height: 36, width: 80, borderRadius: 50 }} />
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {favoriteProducts.map(product => {
                const bestPrice = Math.min(...product.prices.map(p => p.price));
                const worstPrice = Math.max(...product.prices.map(p => p.price));
                const bestStore = product.prices.find(p => p.price === bestPrice)!;
                return (
                  <div key={product.id} className="card" style={{ display: "flex", gap: 16, padding: 20, alignItems: "center", flexWrap: "wrap" }}>

                    <div style={{
                      width: 84,
                      height: 84,
                      borderRadius: 14,
                      background: `url(${product.image}) center/cover`,
                      flexShrink: 0,
                      border: "1px solid rgba(61,107,84,0.1)",
                    }} />

                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{
                        display: "inline-block",
                        background: "var(--sage-light)",
                        color: "var(--sage)",
                        borderRadius: 50,
                        padding: "2px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 5,
                        border: "1px solid rgba(61,107,84,0.15)",
                      }}>
                        {product.category}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "Heebo, sans-serif", marginBottom: 4 }}>
                        {product.name}
                      </h3>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        ★ {product.rating} ({product.reviews} ביקורות)
                      </div>
                    </div>

                    <div style={{ textAlign: "center", minWidth: 100 }}>
                      <div style={{
                        fontSize: 24,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        lineHeight: 1.2,
                      }}>
                        ₪{bestPrice}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ב-{bestStore.store}</div>
                      {worstPrice > bestPrice && (
                        <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 2 }}>
                          חיסכון ₪{worstPrice - bestPrice}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <a href={bestStore.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="findus-btn" style={{ padding: "9px 18px", fontSize: 13 }}>
                          קנה →
                        </button>
                      </a>
                      <button
                        onClick={() => toggle(product.id)}
                        title="הסר ממועדפים"
                        style={{
                          background: "#FEF2F2",
                          border: "1.5px solid #FECACA",
                          borderRadius: 50,
                          width: 38,
                          height: 38,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#DC2626",
                          flexShrink: 0,
                        }}
                      >
                        <Heart size={17} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
