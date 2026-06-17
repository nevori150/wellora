"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { products, categories as allCategories } from "@/data/products";
import { getCategoryIcon } from "@/lib/categoryIcons";
import {
  Leaf, Activity, Dumbbell, Waves, Bike, Mountain,
  Sprout, Apple, Wheat, Sparkles, Recycle, Search,
  ClipboardList, Lightbulb, Award, Star,
} from "lucide-react";

type Step = "welcome" | "categories" | "sport" | "food" | "done";

interface UserProfile {
  name: string;
  wellnessCategories: string[];
  sportStyle: string[];
  foodPrefs: string[];
  clothingSize: string;
  avoidPlastic: boolean;
}

const defaultProfile: UserProfile = {
  name: "",
  wellnessCategories: [],
  sportStyle: [],
  foodPrefs: [],
  clothingSize: "",
  avoidPlastic: true,
};

function calcWellnessScore(profile: UserProfile): number {
  let score = 20;
  score += Math.min(profile.wellnessCategories.length * 8, 30);
  score += Math.min(profile.sportStyle.length * 8, 20);
  if (profile.foodPrefs.includes("vegan")) score += 15;
  else if (profile.foodPrefs.includes("vegetarian")) score += 10;
  if (profile.foodPrefs.includes("organic")) score += 10;
  if (profile.foodPrefs.includes("glutenfree")) score += 5;
  if (profile.avoidPlastic) score += 5;
  return Math.min(score, 100);
}

function ScoreRing({ score }: { score: number }) {
  const r = 52, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#3D6B54" : score >= 50 ? "#B8955A" : "#6B9E83";
  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 20px" }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#E8F2EC" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

const sportOptions = [
  { label: "ריצה",          icon: <Activity size={24} />,  key: "running" },
  { label: "יוגה ופילאטיס", icon: <Sparkles size={24} />, key: "yoga" },
  { label: "חדר כושר",      icon: <Dumbbell size={24} />, key: "gym" },
  { label: "שחייה",         icon: <Waves size={24} />,    key: "swimming" },
  { label: "אופניים",       icon: <Bike size={24} />,     key: "cycling" },
  { label: "הייקינג",       icon: <Mountain size={24} />, key: "hiking" },
];

const foodOptions = [
  { label: "טבעוני",        icon: <Sprout size={24} />,   key: "vegan" },
  { label: "צמחוני",        icon: <Apple size={24} />,    key: "vegetarian" },
  { label: "גלוטן פרי",    icon: <Wheat size={24} />,    key: "glutenfree" },
  { label: "אורגני",        icon: <Leaf size={24} />,     key: "organic" },
  { label: "סופרפודס",      icon: <Sparkles size={24} />, key: "superfoods" },
  { label: "פרוטאין גבוה",  icon: <Dumbbell size={24} />, key: "highprotein" },
];

export default function ProfilePage() {
  const [step, setStep] = useState<Step>("welcome");
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d.user) {
        setLoggedIn(true);
        setProfile(prev => ({ ...prev, name: d.user.name }));
        fetch("/api/profile").then(r => r.json()).then(pd => {
          if (pd.profile) {
            setProfile(prev => ({
              ...prev,
              wellnessCategories: pd.profile.wellnessCategories ?? [],
              sportStyle: pd.profile.sportStyle ?? [],
              foodPrefs: pd.profile.foodPrefs ?? [],
              clothingSize: pd.profile.clothingSize ?? "",
              avoidPlastic: pd.profile.avoidPlastic ?? true,
            }));
          }
        });
      }
    });
  }, []);

  const saveProfile = async (finalProfile: UserProfile) => {
    if (!loggedIn) return;
    setSaving(true);
    const score = calcWellnessScore(finalProfile);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...finalProfile, wellnessScore: score }),
    });
    setSaving(false);
  };

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const getRecommendations = () => {
    if (profile.wellnessCategories.length > 0) {
      const matches = products.filter(p => profile.wellnessCategories.includes(p.category));
      if (matches.length >= 2) return matches.slice(0, 4);
    }
    let recs = products;
    if (profile.sportStyle.includes("yoga")) {
      recs = recs.filter(p => p.tags.some(t => t.includes("יוג") || t.includes("פילאטיס")) || p.category === "ספורט וכושר");
    }
    if (profile.foodPrefs.includes("organic")) {
      recs = recs.filter(p => p.tags.some(t => t.includes("אורגני")));
    }
    return recs.length >= 2 ? recs.slice(0, 4) : products.slice(0, 4);
  };

  const stepProgress: Record<Step, number> = {
    welcome: 0, categories: 25, sport: 55, food: 80, done: 100,
  };

  const stepLabel: Record<Step, string> = {
    welcome: "ברוך הבא", categories: "שלב 1/3", sport: "שלב 2/3", food: "שלב 3/3", done: "הפרופיל שלך",
  };

  const NavBtn = ({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) => (
    <button
      onClick={onClick}
      className={primary ? "findus-btn" : undefined}
      style={primary ? { flex: 2, padding: 14, fontSize: 16 } : {
        flex: 1,
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 50,
        padding: 14,
        cursor: "pointer",
        fontFamily: "Heebo, sans-serif",
        fontSize: 15,
        color: "var(--text-secondary)",
      }}
    >
      {label}
    </button>
  );

  const OptionBtn = ({ label, icon, selected, onClick }: { label: string; icon: React.ReactNode; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        border: `2px solid ${selected ? "var(--sage)" : "var(--border)"}`,
        background: selected ? "var(--sage-light)" : "white",
        borderRadius: 16,
        padding: "16px 14px",
        cursor: "pointer",
        fontFamily: "Heebo, sans-serif",
        fontSize: 14,
        fontWeight: selected ? 700 : 500,
        color: selected ? "var(--sage)" : "var(--text-secondary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        transition: "all 0.15s",
      }}
    >
      <span style={{ color: selected ? "var(--sage)" : "var(--text-muted)" }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 66px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>

          {step !== "done" && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "Heebo, sans-serif" }}>
                  {stepLabel[step]}
                </span>
                <span style={{ fontSize: 13, color: "var(--sage)", fontWeight: 600 }}>
                  {stepProgress[step]}%
                </span>
              </div>
              <div style={{ height: 6, background: "var(--sage-light)", borderRadius: 50 }}>
                <div style={{
                  height: "100%",
                  background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                  borderRadius: 50,
                  width: `${stepProgress[step]}%`,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          )}

          {/* ── ברוך הבא ── */}
          {step === "welcome" && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #3D6B54, #B8955A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", margin: "0 auto 20px",
                boxShadow: "0 8px 24px rgba(61,107,84,0.22)",
              }}>
                <Leaf size={38} />
              </div>
              <h1 style={{
                fontSize: 28, fontWeight: 900, fontFamily: "Heebo, sans-serif",
                marginBottom: 10,
                background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                ברוך הבא ל-Wellora
              </h1>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                נכיר אותך קצת — כדי שנוכל למצוא לך בדיוק את המוצרים שמתאימים לאורח החיים שלך
              </p>
              <div style={{ marginBottom: 24, textAlign: "right" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "var(--text)", fontFamily: "Heebo, sans-serif" }}>
                  מה שמך?
                </label>
                <input
                  className="search-input"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="שם פרטי..."
                  style={{ borderRadius: 12, padding: "14px 20px" }}
                />
              </div>
              <button
                className="findus-btn"
                style={{ width: "100%", padding: "16px", fontSize: 17 }}
                onClick={() => setStep("categories")}
              >
                {profile.name ? `בוא ${profile.name}, מתחילים →` : "בוא נתחיל →"}
              </button>
            </div>
          )}

          {/* ── קטגוריות wellness ── */}
          {step === "categories" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Leaf size={20} color="var(--sage)" />
                <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "Heebo, sans-serif", color: "var(--text)" }}>
                  מה מעניין אותך בעולם הוולנס?
                </h2>
              </div>
              <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 15 }}>
                בחר תחום אחד או יותר — Wellora יתאים לך מוצרים ממש מדויקים
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
                {allCategories.map(cat => {
                  const selected = profile.wellnessCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setProfile({ ...profile, wellnessCategories: toggleArray(profile.wellnessCategories, cat.name) })}
                      style={{
                        border: `2px solid ${selected ? "var(--sage)" : "var(--border)"}`,
                        background: selected ? "var(--sage-light)" : "white",
                        borderRadius: 50,
                        padding: "11px 20px",
                        cursor: "pointer",
                        fontFamily: "Heebo, sans-serif",
                        fontSize: 14,
                        fontWeight: selected ? 700 : 500,
                        color: selected ? "var(--sage)" : "var(--text-secondary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        transition: "all 0.15s",
                        boxShadow: selected ? "0 2px 10px rgba(61,107,84,0.18)" : "none",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", color: selected ? "var(--sage)" : "var(--text-muted)" }}>
                        {getCategoryIcon(cat.name, 15)}
                      </span>
                      {cat.name}
                      {selected && <span style={{ fontSize: 12 }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              {profile.wellnessCategories.length > 0 && (
                <div style={{
                  background: "var(--sage-light)",
                  border: "1px solid rgba(61,107,84,0.15)",
                  borderRadius: 14,
                  padding: "12px 18px",
                  fontSize: 13,
                  color: "var(--sage)",
                  fontWeight: 600,
                  marginBottom: 20,
                  fontFamily: "Heebo, sans-serif",
                }}>
                  ✓ בחרת {profile.wellnessCategories.length} תחומים — Wellora ידע לחפש בשבילך בדיוק
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <NavBtn label="← חזור" onClick={() => setStep("welcome")} />
                <NavBtn label="הבא →" onClick={() => setStep("sport")} primary />
              </div>
            </div>
          )}

          {/* ── ספורט ── */}
          {step === "sport" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Activity size={20} color="var(--sage)" />
                <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "Heebo, sans-serif", color: "var(--text)" }}>
                  מה סגנון הספורט שלך?
                </h2>
              </div>
              <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>בחר אחד או יותר</p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 10,
                marginBottom: 32,
              }}>
                {sportOptions.map(opt => (
                  <OptionBtn
                    key={opt.key}
                    label={opt.label}
                    icon={opt.icon}
                    selected={profile.sportStyle.includes(opt.key)}
                    onClick={() => setProfile({ ...profile, sportStyle: toggleArray(profile.sportStyle, opt.key) })}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <NavBtn label="← חזור" onClick={() => setStep("categories")} />
                <NavBtn label="הבא →" onClick={() => setStep("food")} primary />
              </div>
            </div>
          )}

          {/* ── תזונה ── */}
          {step === "food" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Apple size={20} color="var(--sage)" />
                <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "Heebo, sans-serif", color: "var(--text)" }}>
                  העדפות תזונה שלך?
                </h2>
              </div>
              <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>בחר כל מה שמתאים לך</p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 10,
                marginBottom: 32,
              }}>
                {foodOptions.map(opt => (
                  <OptionBtn
                    key={opt.key}
                    label={opt.label}
                    icon={opt.icon}
                    selected={profile.foodPrefs.includes(opt.key)}
                    onClick={() => setProfile({ ...profile, foodPrefs: toggleArray(profile.foodPrefs, opt.key) })}
                  />
                ))}
              </div>

              <div style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
                marginBottom: 28,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontFamily: "Heebo, sans-serif", marginBottom: 4, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Recycle size={15} color="var(--sage)" /> העדפה לחומרים טבעיים
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    לסנן מוצרים שמכילים פוליאסטר ופלסטיק
                  </div>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, avoidPlastic: !profile.avoidPlastic })}
                  style={{
                    width: 52, height: 28, borderRadius: 50,
                    background: profile.avoidPlastic ? "var(--sage)" : "var(--border)",
                    border: "none", cursor: "pointer", position: "relative",
                    transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", width: 22, height: 22,
                    background: "white", borderRadius: "50%", top: 3,
                    right: profile.avoidPlastic ? 3 : "auto",
                    left: profile.avoidPlastic ? "auto" : 3,
                    transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <NavBtn label="← חזור" onClick={() => setStep("sport")} />
                <button
                  className="findus-btn"
                  style={{ flex: 2, padding: 14, fontSize: 16 }}
                  onClick={() => { setStep("done"); saveProfile(profile); }}
                >
                  {saving ? "שומר..." : "צור את הפרופיל שלי →"}
                </button>
              </div>
            </div>
          )}

          {/* ── סיום + המלצות ── */}
          {step === "done" && (() => {
            const score = calcWellnessScore(profile);
            const recs = getRecommendations();
            const scoreIcon = score >= 75
              ? <Award size={18} color="var(--sage)" />
              : score >= 50
              ? <Star size={18} color="var(--gold)" />
              : <Sprout size={18} color="var(--sage)" />;
            const scoreTxt = score >= 75
              ? "מדהים! אתה חי wellness אמיתי"
              : score >= 50
              ? "טוב! יש עוד מקום לגדול"
              : "התחלה נהדרת — בוא נשפר יחד";

            return (
              <div>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "Heebo, sans-serif", marginBottom: 20, color: "var(--text)" }}>
                    {profile.name ? `${profile.name} — ציון הוולנס שלך` : "ציון הוולנס שלך"}
                  </h2>
                  <ScoreRing score={score} />
                  <div style={{
                    fontSize: 17, fontWeight: 700,
                    color: score >= 75 ? "var(--sage)" : "var(--gold)",
                    marginBottom: 8,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    {scoreIcon} {scoreTxt}
                  </div>
                  {loggedIn && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>הפרופיל נשמר לחשבון שלך ✓</div>
                  )}
                </div>

                {!loggedIn && (
                  <div style={{
                    background: "var(--sage-light)",
                    border: "1px solid rgba(61,107,84,0.2)",
                    borderRadius: 16, padding: 18, marginBottom: 24, textAlign: "center",
                  }}>
                    <p style={{ color: "var(--sage)", fontWeight: 600, marginBottom: 12, fontFamily: "Heebo, sans-serif", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Lightbulb size={15} /> צור חשבון כדי לשמור את הפרופיל והמועדפים שלך
                    </p>
                    <Link href="/register">
                      <button className="findus-btn" style={{ padding: "10px 28px", fontSize: 14 }}>הרשמה בחינם</button>
                    </Link>
                  </div>
                )}

                <div className="card" style={{ padding: "20px 24px", marginBottom: 28 }}>
                  <h3 style={{ fontWeight: 700, fontFamily: "Heebo, sans-serif", marginBottom: 16, fontSize: 15, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                    <ClipboardList size={15} color="var(--sage)" /> הפרופיל שלך
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {profile.wellnessCategories.length > 0 && (
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>תחומי עניין</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {profile.wellnessCategories.map(cat => (
                            <span key={cat} style={{
                              background: "var(--sage-light)",
                              border: "1px solid rgba(61,107,84,0.15)",
                              borderRadius: 50, padding: "4px 12px",
                              fontSize: 12, color: "var(--sage)", fontWeight: 600,
                              fontFamily: "Heebo, sans-serif",
                              display: "inline-flex", alignItems: "center", gap: 5,
                            }}>
                              <span style={{ display: "flex" }}>{getCategoryIcon(cat, 12)}</span>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.sportStyle.length > 0 && (
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Activity size={13} color="var(--sage)" /> ספורט: <strong>{profile.sportStyle.join(" · ")}</strong>
                      </div>
                    )}
                    {profile.foodPrefs.length > 0 && (
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Apple size={13} color="var(--sage)" /> תזונה: <strong>{profile.foodPrefs.join(" · ")}</strong>
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                      <Recycle size={13} color="var(--sage)" />
                      {profile.avoidPlastic ? "מסנן חומרים סינתטיים" : "ללא סינון חומרים"}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: "Heebo, sans-serif", marginBottom: 16, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={17} color="var(--gold)" /> המלצות בשבילך
                </h3>
                {profile.wellnessCategories.length > 0 && (
                  <div style={{
                    fontSize: 13, color: "var(--text-muted)", marginBottom: 14,
                    background: "var(--gold-light)", border: "1px solid var(--border-light)",
                    borderRadius: 10, padding: "8px 14px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Lightbulb size={13} color="var(--gold)" />
                    מציג מוצרים לפי התחומים שבחרת: {profile.wellnessCategories.join(" · ")}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {recs.map(product => {
                    const bestPrice = Math.min(...product.prices.map(p => p.price));
                    const bestStore = product.prices.find(p => p.price === bestPrice)!;
                    return (
                      <div key={product.id} className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 12,
                          background: `url(${product.image}) center/cover`,
                          flexShrink: 0, border: "1px solid var(--border-light)",
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontFamily: "Heebo, sans-serif", marginBottom: 2, fontSize: 14, color: "var(--text)" }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{product.category}</div>
                        </div>
                        <div style={{ textAlign: "center", flexShrink: 0 }}>
                          <div style={{
                            fontSize: 20, fontWeight: 900,
                            background: "linear-gradient(135deg, #3D6B54 0%, #B8955A 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                          }}>
                            ₪{bestPrice}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{bestStore.store}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link href="/search" style={{ textDecoration: "none" }}>
                    <button className="findus-btn" style={{ width: "100%", padding: "15px", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <Search size={16} /> חיפוש מותאם אישית
                    </button>
                  </Link>
                  <button
                    onClick={() => { setStep("welcome"); setProfile(defaultProfile); }}
                    style={{
                      background: "white", border: "1px solid var(--border)",
                      borderRadius: 50, padding: "13px", cursor: "pointer",
                      fontFamily: "Heebo, sans-serif", fontSize: 14,
                      color: "var(--text-muted)", width: "100%",
                    }}
                  >
                    עדכן פרופיל
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </main>
    </>
  );
}
