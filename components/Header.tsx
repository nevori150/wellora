"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Leaf, Heart } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => setUser(d.user));
    fetch("/api/favorites").then(r => r.json()).then(d => setFavCount((d.favorites ?? []).length));
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "בית" },
    { href: "/search", label: "חיפוש" },
    { href: "/profile", label: "פרופיל" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header style={{
      background: "rgba(253,251,247,0.95)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-light)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 66,
      }}>

        {/* ── לוגו ── */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            background: "linear-gradient(135deg, #3D6B54, #B8955A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 3px 10px rgba(61,107,84,0.22)",
          }}>
            <Leaf size={17} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <span style={{
              fontSize: 21,
              fontWeight: 900,
              fontFamily: "Heebo, sans-serif",
              background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}>
              WELLZY
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: 0.5,
              lineHeight: 1,
              fontFamily: "Heebo, sans-serif",
            }}>
              Live the Wellness Life
            </span>
          </div>
        </Link>

        {/* ── ניווט דסקטופ ── */}
        <nav style={{ display: "flex", gap: 2, alignItems: "center" }} className="hidden-mobile">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: 50,
                fontFamily: "Heebo, sans-serif",
                fontWeight: isActive(link.href) ? 700 : 500,
                fontSize: 14,
                color: isActive(link.href) ? "var(--sage)" : "var(--text-secondary)",
                background: isActive(link.href) ? "var(--sage-light)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Auth ── */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

          {/* מועדפים עם מונה */}
          <Link href="/favorites" style={{ textDecoration: "none", position: "relative", display: "inline-flex" }}>
            <button style={{
              background: isActive("/favorites") ? "var(--sage-light)" : "transparent",
              border: `1.5px solid ${isActive("/favorites") ? "var(--border)" : "var(--border-light)"}`,
              borderRadius: 50,
              padding: "7px 14px",
              cursor: "pointer",
              fontFamily: "Heebo, sans-serif",
              fontSize: 14,
              fontWeight: isActive("/favorites") ? 700 : 500,
              color: isActive("/favorites") ? "var(--sage)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <Heart size={14} fill={favCount > 0 ? "currentColor" : "none"} />
              מועדפים
              {favCount > 0 && (
                <span style={{
                  background: "var(--sage)",
                  color: "white",
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 5px",
                }}>
                  {favCount}
                </span>
              )}
            </button>
          </Link>

          {user ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="hidden-mobile">
              <span style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                fontFamily: "Heebo, sans-serif",
              }}>
                שלום, <strong style={{ color: "var(--sage)" }}>{user.name.split(" ")[0]}</strong>
              </span>
              <button onClick={logout} className="btn-outline" style={{ padding: "7px 18px", fontSize: 13 }}>
                יציאה
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }} className="hidden-mobile">
              <Link href="/login" style={{ textDecoration: "none" }}>
                <button className="btn-outline" style={{ padding: "8px 20px", fontSize: 14 }}>כניסה</button>
              </Link>
              <Link href="/register" style={{ textDecoration: "none" }}>
                <button className="findus-btn" style={{ padding: "8px 20px", fontSize: 14 }}>הרשמה</button>
              </Link>
            </div>
          )}

          {/* המבורגר מובייל */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              display: "none",
              background: "var(--sage-light)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 18,
              padding: "6px 10px",
              color: "var(--sage)",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* ── תפריט מובייל ── */}
      {menuOpen && (
        <div style={{
          background: "white",
          borderTop: "1px solid var(--border-light)",
          padding: "12px 20px 24px",
          boxShadow: "var(--shadow-md)",
        }}>
          {[...navLinks, { href: "/favorites", label: favCount > 0 ? `מועדפים (${favCount})` : "מועדפים" }].map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                textDecoration: "none",
                padding: "14px 18px",
                borderRadius: 14,
                marginBottom: 4,
                color: isActive(link.href) ? "var(--sage)" : "var(--text-secondary)",
                background: isActive(link.href) ? "var(--sage-light)" : "transparent",
                fontFamily: "Heebo, sans-serif",
                fontWeight: isActive(link.href) ? 700 : 500,
                fontSize: 16,
                transition: "all 0.15s",
              }}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={logout}
              style={{
                width: "100%",
                marginTop: 10,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 14,
                padding: 14,
                color: "#DC2626",
                fontFamily: "Heebo, sans-serif",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              יציאה
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Link href="/login" style={{ textDecoration: "none", flex: 1 }} onClick={() => setMenuOpen(false)}>
                <button className="btn-outline" style={{ width: "100%", padding: 14 }}>כניסה</button>
              </Link>
              <Link href="/register" style={{ textDecoration: "none", flex: 1 }} onClick={() => setMenuOpen(false)}>
                <button className="findus-btn" style={{ width: "100%", padding: 14 }}>הרשמה</button>
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
