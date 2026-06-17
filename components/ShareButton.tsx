"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  price: number;
  store: string;
}

export default function ShareButton({ title, price, store }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} — ₪${price}`,
          text: `מצאתי את ${title} ב-₪${price} ב-${store} דרך WELLZY!`,
          url: pageUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // silent fallback
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        flex: 1,
        background: copied ? "var(--sage-light)" : "var(--bg)",
        border: `1.5px solid ${copied ? "var(--sage)" : "var(--border)"}`,
        borderRadius: 50,
        padding: "9px 16px",
        cursor: "pointer",
        fontFamily: "Heebo, sans-serif",
        fontSize: 14,
        fontWeight: 600,
        color: copied ? "var(--sage)" : "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "all 0.2s",
      }}
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? "הועתק!" : "שתף"}
    </button>
  );
}
