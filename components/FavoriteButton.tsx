"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function FavoriteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/favorites").then(r => r.json()).then(d => {
      setFavorited((d.favorites ?? []).includes(productId));
    });
  }, [productId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const toggle = async () => {
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setFavorited(data.favorited);
    setLoading(false);
    showToast(data.favorited ? "נשמר למועדפים" : "הוסר ממועדפים");
  };

  return (
    <>
      <button
        onClick={toggle}
        disabled={loading}
        title={favorited ? "הסר ממועדפים" : "הוסף למועדפים"}
        style={{
          background: favorited ? "#FEF2F2" : "white",
          border: `1.5px solid ${favorited ? "#FECACA" : "#E2E8F0"}`,
          borderRadius: 50,
          width: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: favorited ? "#DC2626" : "#94A3B8",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        <Heart size={18} fill={favorited ? "currentColor" : "none"} />
      </button>

      {toast && (
        <div style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(30,30,30,0.92)",
          color: "white",
          padding: "12px 24px",
          borderRadius: 50,
          fontSize: 15,
          fontFamily: "Heebo, sans-serif",
          fontWeight: 600,
          zIndex: 9999,
          pointerEvents: "none",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          animation: "fadeInUp 0.22s ease",
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
