"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { User, Lock, Leaf, Heart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("שגיאת חיבור, נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontWeight: 700,
    marginBottom: 7,
    color: "var(--text-secondary)",
    fontSize: 13,
    fontFamily: "Heebo, sans-serif",
  } as const;

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
        <div style={{ width: "100%", maxWidth: 420 }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3D6B54, #B8955A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(61,107,84,0.22)",
            }}>
              <User size={34} />
            </div>
            <h1 style={{
              fontSize: 26, fontWeight: 900, marginBottom: 8,
              background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ברוך השב ל-WELLZY
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
              התחבר כדי לגשת למועדפים ולפרופיל שלך
            </p>
          </div>

          <div className="card" style={{ padding: 32 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <div>
                <label style={labelStyle}>אימייל</label>
                <input
                  className="search-input"
                  style={{ borderRadius: 12, padding: "12px 16px" }}
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>סיסמה</label>
                <input
                  className="search-input"
                  style={{ borderRadius: 12, padding: "12px 16px" }}
                  type="password"
                  placeholder="הסיסמה שלך"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  borderRadius: 10, padding: "10px 14px",
                  color: "#DC2626", fontSize: 14,
                }}>
                  {error}
                </div>
              )}

              <button
                className="findus-btn"
                type="submit"
                disabled={loading}
                style={{ padding: 14, fontSize: 16, marginTop: 4, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "מתחבר..." : "כניסה →"}
              </button>
            </form>

            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              margin: "22px 0 0",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>או</span>
              <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
            </div>

            <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--text-muted)" }}>
              עדיין אין לך חשבון?{" "}
              <Link href="/register" style={{ color: "var(--sage)", fontWeight: 700, textDecoration: "none" }}>
                הרשמה חינם
              </Link>
            </p>
          </div>

          <div style={{
            display: "flex", justifyContent: "center", gap: 20,
            marginTop: 24, flexWrap: "wrap",
          }}>
            {[
              { icon: <Lock size={12} />, text: "מאובטח" },
              { icon: <Leaf size={12} />, text: "ללא ספאם" },
              { icon: <Heart size={12} />, text: "חינמי לחלוטין" },
            ].map(item => (
              <span key={item.text} style={{
                fontSize: 12, color: "var(--text-muted)",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>

        </div>
      </main>
    </>
  );
}
