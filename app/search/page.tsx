"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import FavoriteButton from "@/components/FavoriteButton";
import { products, categories } from "@/data/products";
import Link from "next/link";
import { calcPricePerUnit, calcPricePerUnitNumeric } from "@/lib/priceUtils";
import { Search, Globe, Target, DollarSign, Zap, Clock, CheckCircle2, Scale, AlertTriangle, BarChart3, Star, SlidersHorizontal, X } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("cat") || "");
  const [sortBy, setSortBy] = useState<"best_price" | "rating" | "name" | "price_per_unit">("best_price");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showStoreFilter, setShowStoreFilter] = useState(false);
  const [preferredStores, setPreferredStores] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("wellora_preferred_stores") ?? "[]"); }
    catch { return []; }
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("wellora_recent_searches") ?? "[]"); }
    catch { return []; }
  });
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const saveSearch = (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 4);
      try { localStorage.setItem("wellora_recent_searches", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();
    return products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query]);

  const allStores = useMemo(() => {
    const seen = new Set<string>();
    const result: { store: string; logo: string }[] = [];
    for (const p of products) {
      for (const pr of p.prices) {
        if (!seen.has(pr.store)) { seen.add(pr.store); result.push({ store: pr.store, logo: pr.logo }); }
      }
    }
    return result.sort((a, b) => a.store.localeCompare(b.store, "he"));
  }, []);

  const allBrands = useMemo(() => {
    const seen = new Set<string>();
    for (const p of products) {
      for (const pr of p.prices) {
        if (pr.brand && pr.brand !== "Generic") seen.add(pr.brand);
      }
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b, "he"));
  }, []);

  const LIFESTYLE_VALUES: { label: string; emoji: string; match: string }[] = [
    { label: "כשר",          emoji: "✡️",  match: "כשר" },
    { label: "טבעי",        emoji: "🌿", match: "טבעי" },
    { label: "אורגני",      emoji: "🌱", match: "אורגני" },
    { label: "טבעוני",      emoji: "🐰", match: "טבעוני" },
    { label: "ללא גלוטן",   emoji: "🌾", match: "ללא גלוטן" },
    { label: "GOTS",         emoji: "✅", match: "GOTS" },
    { label: "ישראלי",      emoji: "🇮🇱", match: "ישראל" },
    { label: "ללא כימיקלים", emoji: "🚫", match: "כימיקל" },
    { label: "חלבון גבוה",   emoji: "💪", match: "חלבון" },
  ];

  const activeFilterCount =
    (priceMax !== "" ? 1 : 0) +
    selectedBrands.length +
    selectedTags.length;

  const clearAllFilters = () => {
    setPriceMax("");
    setSelectedBrands([]);
    setSelectedTags([]);
  };

  const toggleStore = (store: string) => {
    const next = preferredStores.includes(store)
      ? preferredStores.filter(s => s !== store)
      : [...preferredStores, store];
    setPreferredStores(next);
    try { localStorage.setItem("wellora_preferred_stores", JSON.stringify(next)); } catch {}
  };

  const clearStores = () => {
    setPreferredStores([]);
    try { localStorage.removeItem("wellora_preferred_stores"); } catch {}
  };

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCat) result = result.filter((p) => p.category === selectedCat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (priceMax !== "") {
      result = result.filter(p =>
        Math.min(...p.prices.map(pr => pr.price)) <= (priceMax as number)
      );
    }
    if (selectedBrands.length > 0) {
      result = result.filter(p =>
        p.prices.some(pr =>
          selectedBrands.includes(pr.brand ?? "") || selectedBrands.includes(pr.store)
        )
      );
    }
    if (selectedTags.length > 0) {
      result = result.filter(p =>
        selectedTags.some(tag =>
          p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }
    return result.sort((a, b) => {
      if (sortBy === "best_price")
        return Math.min(...a.prices.map((p) => p.price)) - Math.min(...b.prices.map((p) => p.price));
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_per_unit") {
        const getBestPPU = (prod: typeof a) => {
          const vals = prod.prices
            .map(p => calcPricePerUnitNumeric(p.price, p.sizeValue, p.sizeUnit))
            .filter((v): v is number => v !== null);
          return vals.length > 0 ? Math.min(...vals) : Infinity;
        };
        return getBestPPU(a) - getBestPPU(b);
      }
      return a.name.localeCompare(b.name, "he");
    });
  }, [query, selectedCat, sortBy]);

  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)" }}>

        {/* ─── כותרת חיפוש ─── */}
        <div style={{
          background: "linear-gradient(150deg, #E0EDE6 0%, #FDFAF4 55%, #F4ECD8 100%)",
          borderBottom: "1px solid var(--border-light)",
          padding: "36px 20px",
        }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h1 style={{
              fontSize: 22,
              fontWeight: 900,
              color: "var(--text)",
              marginBottom: 18,
              fontFamily: "Heebo, sans-serif",
              letterSpacing: "-0.3px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <Search size={20} color="var(--sage)" />
              חיפוש מוצרי וולנס + השוואת מחירים
            </h1>
            <div style={{ position: "relative" }}>
              <input
                className="search-input"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => { setShowSuggestions(false); if (query.trim().length >= 2) saveSearch(query); }, 150)}
                onKeyDown={(e) => { if (e.key === "Enter" && query.trim().length >= 2) saveSearch(query); }}
                placeholder="חפש מוצר, קטגוריה או תגית..."
                style={{ paddingRight: 52 }}
              />
              <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                <Search size={18} />
              </span>

              {/* חיפושים אחרונים — מוצג רק כשהשדה ריק */}
              {showSuggestions && query.trim().length === 0 && recentSearches.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0, left: 0,
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  boxShadow: "var(--shadow-md)",
                  zIndex: 100,
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "10px 18px 6px",
                    fontSize: 11, color: "var(--text-muted)", fontWeight: 700,
                    fontFamily: "Heebo, sans-serif",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span>חיפושים אחרונים</span>
                    <button
                      onMouseDown={() => {
                        setRecentSearches([]);
                        try { localStorage.removeItem("wellora_recent_searches"); } catch {}
                      }}
                      style={{ background: "none", border: "none", fontSize: 11, color: "var(--sage)", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontWeight: 600 }}
                    >
                      נקה
                    </button>
                  </div>
                  {recentSearches.map((s, i) => (
                    <button
                      key={s}
                      onMouseDown={() => { setQuery(s); setShowSuggestions(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "10px 18px",
                        background: "transparent",
                        border: "none",
                        borderBottom: i < recentSearches.length - 1 ? "1px solid var(--border-light)" : "none",
                        cursor: "pointer",
                        textAlign: "right",
                        fontFamily: "Heebo, sans-serif",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)", display: "flex" }}><Clock size={14} /></span>
                      <span style={{ flex: 1, fontSize: 14, color: "var(--text)", fontWeight: 500, textAlign: "right" }}>{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* אוטוקומפליט — מוצג כשיש טקסט */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0, left: 0,
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  boxShadow: "var(--shadow-md)",
                  zIndex: 100,
                  overflow: "hidden",
                }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={s.id}
                      onMouseDown={() => { setQuery(s.name); setShowSuggestions(false); saveSearch(s.name); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "11px 20px",
                        background: "transparent",
                        border: "none",
                        borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-light)" : "none",
                        cursor: "pointer",
                        textAlign: "right",
                        fontFamily: "Heebo, sans-serif",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", color: "var(--text-muted)" }}>{getCategoryIcon(s.category, 16)}</span>
                      <span style={{ flex: 1, fontSize: 14, color: "var(--text)", fontWeight: 500, textAlign: "right" }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-alt)", padding: "2px 8px", borderRadius: 50, whiteSpace: "nowrap" }}>{s.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

          {/* ─── פילטרים ─── */}
          <div style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 20,
            alignItems: "center",
            padding: "16px 20px",
            background: "white",
            borderRadius: 16,
            border: "1px solid var(--border-light)",
          }}>
            <span style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 13, marginLeft: 4 }}>קטגוריה:</span>
            {[{ name: "הכל" }, ...categories.map((c) => ({ name: c.name }))].map((item) => {
              const isAll = item.name === "הכל";
              const active = isAll ? !selectedCat : selectedCat === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setSelectedCat(isAll ? "" : selectedCat === item.name ? "" : item.name)}
                  style={{
                    border: `1.5px solid ${active ? "var(--sage)" : "var(--border)"}`,
                    background: active ? "var(--sage-light)" : "white",
                    color: active ? "var(--sage)" : "var(--text-secondary)",
                    borderRadius: 50,
                    padding: "5px 14px",
                    cursor: "pointer",
                    fontFamily: "Heebo, sans-serif",
                    fontWeight: active ? 700 : 400,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.15s",
                  }}
                >
                  {!isAll && (
                    <span style={{ display: "flex", alignItems: "center", color: active ? "var(--sage)" : "var(--text-muted)" }}>
                      {getCategoryIcon(item.name, 13)}
                    </span>
                  )}
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* ─── פילטרים מתקדמים ─── */}
          <div style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid var(--border-light)",
            marginBottom: 12,
            overflow: "hidden",
          }}>
            <button
              onClick={() => setShowAdvancedFilters(v => !v)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                  <SlidersHorizontal size={14} color="var(--sage)" /> פילטרים
                </span>
                {activeFilterCount > 0 && (
                  <span style={{ background: "var(--sage)", color: "white", borderRadius: 50, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                    {activeFilterCount} פעילים
                  </span>
                )}
                {activeFilterCount === 0 && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>תקציב · ערכי חיים · מותגים</span>
                )}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {activeFilterCount > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); clearAllFilters(); }}
                    style={{ background: "none", border: "none", fontSize: 12, color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "Heebo, sans-serif" }}
                  >
                    <X size={12} /> נקה הכל
                  </button>
                )}
                <span style={{ fontSize: 13, color: "var(--sage)", fontWeight: 600 }}>
                  {showAdvancedFilters ? "סגור ↑" : "פתח ↓"}
                </span>
              </div>
            </button>

            {showAdvancedFilters && (
              <div style={{ borderTop: "1px solid var(--border-light)", padding: "20px" }}>

                {/* תקציב */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10, fontFamily: "Heebo, sans-serif" }}>
                    💰 תקציב מקסימלי
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {([
                      { label: "הכל", val: "" },
                      { label: "עד ₪50",  val: 50 },
                      { label: "עד ₪100", val: 100 },
                      { label: "עד ₪200", val: 200 },
                      { label: "עד ₪500", val: 500 },
                    ] as { label: string; val: number | "" }[]).map(opt => {
                      const active = priceMax === opt.val;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => setPriceMax(opt.val)}
                          style={{
                            border: `1.5px solid ${active ? "var(--sage)" : "var(--border)"}`,
                            background: active ? "var(--sage-light)" : "white",
                            color: active ? "var(--sage)" : "var(--text-secondary)",
                            borderRadius: 50,
                            padding: "6px 16px",
                            cursor: "pointer",
                            fontFamily: "Heebo, sans-serif",
                            fontWeight: active ? 700 : 400,
                            fontSize: 13,
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ערכי חיים */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10, fontFamily: "Heebo, sans-serif" }}>
                    🌿 ערכי חיים
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {LIFESTYLE_VALUES.map(lv => {
                      const active = selectedTags.includes(lv.match);
                      return (
                        <button
                          key={lv.match}
                          onClick={() => setSelectedTags(prev =>
                            prev.includes(lv.match) ? prev.filter(t => t !== lv.match) : [...prev, lv.match]
                          )}
                          style={{
                            border: `1.5px solid ${active ? "var(--sage)" : "var(--border)"}`,
                            background: active ? "var(--sage-light)" : "white",
                            color: active ? "var(--sage)" : "var(--text-secondary)",
                            borderRadius: 50,
                            padding: "6px 14px",
                            cursor: "pointer",
                            fontFamily: "Heebo, sans-serif",
                            fontWeight: active ? 700 : 400,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            transition: "all 0.15s",
                          }}
                        >
                          <span>{lv.emoji}</span>
                          <span>{lv.label}</span>
                          {active && <span style={{ fontSize: 11 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* מותגים */}
                {allBrands.length > 0 && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10, fontFamily: "Heebo, sans-serif" }}>
                      🏷️ מותגים
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {allBrands.map(brand => {
                        const active = selectedBrands.includes(brand);
                        return (
                          <button
                            key={brand}
                            onClick={() => setSelectedBrands(prev =>
                              prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                            )}
                            style={{
                              border: `1.5px solid ${active ? "#7B6FAB" : "var(--border)"}`,
                              background: active ? "#F0EEF9" : "white",
                              color: active ? "#7B6FAB" : "var(--text-secondary)",
                              borderRadius: 50,
                              padding: "6px 14px",
                              cursor: "pointer",
                              fontFamily: "Heebo, sans-serif",
                              fontWeight: active ? 700 : 400,
                              fontSize: 13,
                              transition: "all 0.15s",
                            }}
                          >
                            {brand}
                            {active && <span style={{ marginRight: 4, fontSize: 11 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── פילטר אתרים ─── */}
          <div style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid var(--border-light)",
            marginBottom: 12,
            overflow: "hidden",
          }}>
            <button
              onClick={() => setShowStoreFilter(v => !v)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Globe size={14} color="var(--sage)" /> אתרים מועדפים
                </span>
                {preferredStores.length > 0 && (
                  <span style={{
                    background: "var(--sage)",
                    color: "white",
                    borderRadius: 50,
                    padding: "2px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    {preferredStores.length} נבחרו
                  </span>
                )}
                {preferredStores.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>כל האתרים מוצגים</span>
                )}
              </span>
              <span style={{ fontSize: 13, color: "var(--sage)", fontWeight: 600 }}>
                {showStoreFilter ? "סגור ↑" : "בחר אתרים ↓"}
              </span>
            </button>

            {showStoreFilter && (
              <div style={{ borderTop: "1px solid var(--border-light)", padding: "16px 20px" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, fontFamily: "Heebo, sans-serif" }}>
                  בחר אתרים שיודגשו ויופיעו ראשונים בהשוואת המחירים. ללא בחירה — כל האתרים מוצגים שווה.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {allStores.map(({ store, logo }) => {
                    const active = preferredStores.includes(store);
                    return (
                      <button
                        key={store}
                        onClick={() => toggleStore(store)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          border: `1.5px solid ${active ? "var(--sage)" : "var(--border)"}`,
                          background: active ? "var(--sage-light)" : "white",
                          color: active ? "var(--sage)" : "var(--text-secondary)",
                          borderRadius: 50,
                          padding: "6px 14px",
                          cursor: "pointer",
                          fontFamily: "Heebo, sans-serif",
                          fontWeight: active ? 700 : 400,
                          fontSize: 13,
                          transition: "all 0.15s",
                        }}
                      >
                        <span>{store}</span>
                        {active && <span style={{ fontSize: 11 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                {preferredStores.length > 0 && (
                  <button
                    onClick={clearStores}
                    style={{
                      border: "1px solid var(--border)",
                      background: "white",
                      color: "var(--text-muted)",
                      borderRadius: 50,
                      padding: "5px 14px",
                      cursor: "pointer",
                      fontFamily: "Heebo, sans-serif",
                      fontSize: 12,
                    }}
                  >
                    נקה בחירה
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── שורת "סרקנו בשבילך" ─── */}
          {(() => {
            const uniqueStores = new Set(filtered.flatMap(p => p.prices.map(pr => pr.store)));
            const maxSaving = Math.max(...filtered.map(p => Math.max(...p.prices.map(pr => pr.price)) - Math.min(...p.prices.map(pr => pr.price))));
            return (
              <div style={{
                background: "linear-gradient(135deg, var(--sage-light) 0%, #FDF8F0 100%)",
                border: "1px solid rgba(61,107,84,0.15)",
                borderRadius: 14,
                padding: "12px 20px",
                marginBottom: 16,
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                alignItems: "center",
              }}>
                {[
                  { icon: <Globe size={15} />, label: `סרקנו ${uniqueStores.size} אתרים` },
                  { icon: <Target size={15} />, label: `${filtered.length} מוצרים תואמים` },
                  { icon: <DollarSign size={15} />, label: `חיסכון עד ₪${maxSaving} אפשרי` },
                  { icon: <Zap size={15} />, label: "תוך שניות" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--sage)", display: "flex" }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ─── מיון + ספירה ─── */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}>
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
              נמצאו <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> מוצרים
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>מיין לפי:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 10,
                  padding: "7px 14px",
                  fontFamily: "Heebo, sans-serif",
                  fontSize: 13,
                  background: "white",
                  color: "var(--text)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="best_price">מחיר נמוך ביותר</option>
                <option value="rating">דירוג גבוה</option>
                <option value="name">שם</option>
                <option value="price_per_unit">הכי משתלם ליחידה</option>
              </select>
            </div>
          </div>

          {/* ─── תוצאות ─── */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "white",
              borderRadius: 20,
              border: "1px solid var(--border-light)",
            }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--sage-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Search size={36} color="var(--sage)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "Heebo, sans-serif", marginBottom: 8, color: "var(--text)" }}>
                לא נמצאו מוצרים
              </h3>
              <p style={{ color: "var(--text-muted)" }}>נסה חיפוש אחר או שנה את הפילטרים</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((product) => {
                const bestPrice = Math.min(...product.prices.map((p) => p.price));
                const worstPrice = Math.max(...product.prices.map((p) => p.price));
                const bestStore = product.prices.find((p) => p.price === bestPrice)!;
                const isExpanded = expandedProduct === product.id;

                return (
                  <div key={product.id} className="card" style={{ overflow: "hidden" }}>
                    {/* ─ שורה ראשית ─ */}
                    <div style={{ display: "flex", gap: 18, padding: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

                      {/* תמונה */}
                      <div style={{
                        width: 96, height: 96,
                        borderRadius: 16, flexShrink: 0,
                        border: "1px solid var(--border-light)",
                        overflow: "hidden",
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>

                      {/* מידע */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
                          <span style={{
                            background: "var(--sage-light)",
                            color: "var(--sage)",
                            borderRadius: 50,
                            padding: "3px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            border: "1px solid rgba(61,107,84,0.18)",
                          }}>
                            {product.category}
                          </span>
                          <span style={{ color: "#F59E0B", fontSize: 13 }}>
                            ★ {product.rating}
                          </span>
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                            ({product.reviews} ביקורות)
                          </span>
                        </div>
                        <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                          <h3 style={{
                            fontSize: 17,
                            fontWeight: 700,
                            marginBottom: 6,
                            color: "var(--text)",
                            fontFamily: "Heebo, sans-serif",
                          }}>
                            {product.name}
                          </h3>
                        </Link>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
                          {product.description}
                        </p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {product.tags.map((tag) => (
                            <span key={tag} style={{
                              background: "var(--bg-alt)",
                              borderRadius: 50,
                              padding: "3px 10px",
                              fontSize: 11,
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-light)",
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* מחיר */}
                      <div style={{
                        textAlign: "center",
                        minWidth: 155,
                        background: "var(--bg)",
                        borderRadius: 16,
                        padding: "16px 14px",
                        border: "1px solid var(--border-light)",
                      }}>
                        <span className="badge-best-price" style={{ fontSize: 11 }}>מחיר הכי טוב</span>
                        <div className="brand-gradient-text" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginTop: 8 }}>
                          ₪{bestPrice}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                          ב-{bestStore.store}
                        </div>
                        {worstPrice > bestPrice && (() => {
                          const worstStore = product.prices.find(p => p.price === worstPrice)!;
                          const savingPct = Math.round(((worstPrice - bestPrice) / worstPrice) * 100);
                          return (
                            <div style={{
                              background: "#F0FDF4",
                              border: "1px solid #86EFAC",
                              borderRadius: 8,
                              padding: "6px 8px",
                              marginBottom: 10,
                              textAlign: "center",
                            }}>
                              <div style={{ fontSize: 14, fontWeight: 900, color: "#059669" }}>
                                חסכת ₪{worstPrice - bestPrice} ({savingPct}%)
                              </div>
                              <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>
                                לעומת ₪{worstPrice} ב-{worstStore.store}
                              </div>

                            </div>
                          );
                        })()}
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
                          <a href={bestStore.url} style={{ textDecoration: "none" }}>
                            <button className="findus-btn" style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}>
                              קנה ב-₪{bestPrice}
                            </button>
                          </a>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                              className="btn-outline"
                              style={{ flex: 1, padding: "7px 8px", fontSize: 12 }}
                            >
                              {isExpanded ? "הסתר ↑" : "השוואה ↓"}
                            </button>
                            <FavoriteButton productId={product.id} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ─ השוואת מחירים ─ */}
                    {isExpanded && (() => {
                      const ct = product.comparisonType;
                      const attrs = product.compareAttributes ?? [];
                      const allStoreAttrs = attrs.length > 0
                        ? product.prices.map(p => p.attributes ?? {})
                        : [];

                      // badge config per comparison type
                      const badge = ct === "identical"
                        ? { icon: <CheckCircle2 size={20} color="#059669" />, color: "#059669", bg: "#F0FDF4", border: "#86EFAC",
                            title: "השוואה ישירה — אותו מוצר בדיוק",
                            sub: `${product.prices[0]?.brand ?? ""} · ${product.size ?? ""} · רק המחיר שונה בין חנויות` }
                        : ct === "similar"
                        ? { icon: <Scale size={20} color="var(--gold)" />, color: "var(--gold)", bg: "#FDF8F0", border: "#E4C98A",
                            title: "מוצרים דומים — מפרטים זהים, מותגים שונים",
                            sub: "ניתן להשוות אך בדוק את ההבדלים בטבלה למטה לפני הרכישה" }
                        : { icon: <AlertTriangle size={20} color="#DC2626" />, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA",
                            title: "אותה קטגוריה — מוצרים שונים",
                            sub: "אלה מוצרים שונים! השוואת מחיר ישירה אינה תקינה — בדוק את ההבדלים" };

                      return (
                      <div style={{ borderTop: "1px solid var(--border-light)", padding: 20, background: "var(--bg)" }}>

                        {/* badge סוג ההשוואה */}
                        <div style={{
                          background: badge.bg, border: `1.5px solid ${badge.border}`,
                          borderRadius: 14, padding: "12px 16px", marginBottom: 16,
                          display: "flex", alignItems: "flex-start", gap: 12,
                        }}>
                          <span style={{ display: "flex", flexShrink: 0 }}>{badge.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: badge.color, fontFamily: "Heebo, sans-serif", marginBottom: 3 }}>
                              {badge.title}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                              {badge.sub}
                            </div>
                          </div>
                        </div>

                        {/* טבלת השוואת מאפיינים — רק ל-similar ו-category */}
                        {attrs.length > 0 && allStoreAttrs.length > 0 && (
                          <div style={{ marginBottom: 16, overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "Heebo, sans-serif" }}>
                              <thead>
                                <tr style={{ background: "white" }}>
                                  <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 700, borderBottom: "1px solid var(--border-light)", width: 100 }}>מאפיין</th>
                                  {product.prices.map(p => (
                                    <th key={p.store} style={{ textAlign: "center", padding: "8px 10px", color: "var(--text)", fontWeight: 700, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                                      {p.store}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {attrs.map((attr, ai) => {
                                  const vals = product.prices.map(p => p.attributes?.[attr] ?? "—");
                                  const allSame = vals.every(v => v === vals[0]);
                                  return (
                                    <tr key={attr} style={{ background: ai % 2 === 0 ? "white" : "var(--bg)" }}>
                                      <td style={{ padding: "8px 12px", fontWeight: 700, color: "var(--text-secondary)", borderBottom: "1px solid var(--border-light)" }}>{attr}</td>
                                      {vals.map((val, vi) => (
                                        <td key={vi} style={{
                                          padding: "8px 10px", textAlign: "center",
                                          borderBottom: "1px solid var(--border-light)",
                                          color: val.includes("✓") ? "#059669" : val === "ללא" || val.includes("לא") ? "#DC2626" : "var(--text)",
                                          fontWeight: !allSame ? 700 : 400,
                                          background: !allSame && val.includes("✓") ? "#F0FDF4" : "transparent",
                                        }}>
                                          {val}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                                <tr style={{ background: "white" }}>
                                  <td style={{ padding: "8px 12px", fontWeight: 800, color: "var(--text)", borderBottom: "1px solid var(--border-light)" }}>מחיר</td>
                                  {product.prices.map(p => {
                                    const cheapest = p.price === Math.min(...product.prices.map(x => x.price));
                                    const ppu = calcPricePerUnit(p.price, p.sizeValue, p.sizeUnit);
                                    return (
                                      <td key={p.store} style={{
                                        padding: "8px 10px", textAlign: "center", fontWeight: 900,
                                        borderBottom: "1px solid var(--border-light)",
                                        color: cheapest ? "#059669" : "var(--text)",
                                        background: cheapest ? "#F0FDF4" : "transparent",
                                        fontSize: 14,
                                      }}>
                                        ₪{p.price}
                                        {cheapest && <div style={{ fontSize: 10, color: "#059669" }}>הכי זול</div>}
                                        {ppu && <div style={{ fontSize: 10, color: cheapest ? "#059669" : "var(--text-muted)", fontWeight: 400 }}>{ppu}</div>}
                                      </td>
                                    );
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        <h4 style={{
                          fontWeight: 700,
                          marginBottom: 10,
                          fontFamily: "Heebo, sans-serif",
                          fontSize: 14,
                          color: "var(--text)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}>
                          <BarChart3 size={14} color="var(--sage)" />
                          {ct === "identical" ? "מחירים לאותו מוצר" : ct === "similar" ? "מחירים לפי חנות" : "מחירים — שים לב להבדלים"}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {product.prices
                            .slice()
                            .sort((a, b) => {
                              const aP = preferredStores.length > 0 && preferredStores.includes(a.store);
                              const bP = preferredStores.length > 0 && preferredStores.includes(b.store);
                              if (aP && !bP) return -1;
                              if (!aP && bP) return 1;
                              return a.price - b.price;
                            })
                            .map((priceItem) => {
                              const isCheapest = priceItem.price === Math.min(...product.prices.map(p => p.price));
                              const isPreferred = preferredStores.length > 0 && preferredStores.includes(priceItem.store);
                              const ppu = calcPricePerUnit(priceItem.price, priceItem.sizeValue, priceItem.sizeUnit);
                              return (
                                <div
                                  key={priceItem.store}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "12px 16px",
                                    background: isCheapest ? "#F0FDF4" : isPreferred ? "var(--sage-light)" : "white",
                                    border: `1.5px solid ${isCheapest ? "#86EFAC" : isPreferred ? "rgba(61,107,84,0.3)" : "var(--border-light)"}`,
                                    borderRadius: 12,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div style={{ flex: 1, minWidth: 140 }}>
                                    <div style={{
                                      fontWeight: isCheapest || isPreferred ? 700 : 600,
                                      fontFamily: "Heebo, sans-serif",
                                      color: "var(--text)",
                                      fontSize: 14,
                                      marginBottom: priceItem.productTitle ? 2 : 0,
                                    }}>
                                      {priceItem.store}
                                    </div>
                                    {priceItem.productTitle && (
                                      <div style={{
                                        fontSize: 11, color: "var(--text-muted)",
                                        lineHeight: 1.4, fontFamily: "Heebo, sans-serif",
                                        direction: "ltr", textAlign: "right",
                                      }}>
                                        {priceItem.productTitle}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    {isCheapest && (
                                      <span className="badge-best-price" style={{ fontSize: 11 }}>הכי זול</span>
                                    )}
                                    {isPreferred && !isCheapest && (
                                      <span style={{
                                        background: "var(--sage-light)",
                                        color: "var(--sage)",
                                        border: "1px solid rgba(61,107,84,0.2)",
                                        borderRadius: 50,
                                        padding: "2px 8px",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}>
                                        <Star size={10} fill="currentColor" /> מועדף
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ textAlign: "center" }}>
                                    <div style={{
                                      fontSize: 18,
                                      fontWeight: 800,
                                      color: isCheapest ? "#059669" : "var(--text)",
                                    }}>
                                      ₪{priceItem.price}
                                    </div>
                                    {ppu && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{ppu}</div>}
                                  </div>
                                  <a href={priceItem.url} style={{ textDecoration: "none" }}>
                                    <button style={{
                                      background: isCheapest ? "#059669" : isPreferred ? "var(--sage)" : "var(--bg)",
                                      color: isCheapest || isPreferred ? "white" : "var(--text-secondary)",
                                      border: `1px solid ${isCheapest ? "#059669" : isPreferred ? "var(--sage)" : "var(--border-light)"}`,
                                      borderRadius: 50,
                                      padding: "6px 14px",
                                      cursor: "pointer",
                                      fontFamily: "Heebo, sans-serif",
                                      fontSize: 13,
                                      fontWeight: 600,
                                    }}>
                                      לאימות ורכישה →
                                    </button>
                                  </a>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      );
                    })()}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontFamily: "Heebo, sans-serif" }}>
        טוען...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
