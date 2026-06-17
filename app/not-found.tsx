import Link from "next/link";
import Header from "@/components/Header";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{
        minHeight: "calc(100vh - 66px)",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "Heebo, sans-serif",
        direction: "rtl",
      }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>

          <div style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "var(--sage-light)",
            border: "2px solid rgba(61,107,84,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sage)",
            margin: "0 auto 28px",
          }}>
            <Leaf size={44} />
          </div>

          <div style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 8,
            background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            404
          </div>

          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 12,
          }}>
            הדף לא נמצא
          </h1>

          <p style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            נראה שהקישור שחיפשת לא קיים או הועבר.
            <br />
            אפשר לחפש מוצר חדש או לחזור לדף הבית.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/search" style={{ textDecoration: "none" }}>
              <button className="findus-btn" style={{ padding: "12px 28px", fontSize: 15 }}>
                חיפוש מוצרים
              </button>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button className="btn-outline" style={{ padding: "12px 28px", fontSize: 15 }}>
                דף הבית
              </button>
            </Link>
          </div>

          <div style={{ marginTop: 40 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
              קטגוריות פופולריות:
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                "מוצרי טיפוח טבעיים",
                "ספורט וכושר",
                "מזון בריא וסופרפוד",
                "שינה וריקברי",
              ].map((cat) => (
                <Link
                  key={cat}
                  href={`/search?cat=${encodeURIComponent(cat)}`}
                  style={{ textDecoration: "none" }}
                >
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "white",
                    border: "1px solid var(--border-light)",
                    borderRadius: 50,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}>
                    {cat}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
