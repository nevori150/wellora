import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "חיפוש מוצרי וולנס — השוואת מחירים",
  description: "חפש ויטמינים, מזון אורגני, ציוד ספורט וטיפוח טבעי. Wellora משווה מחירים מ-iHerb, Shein, YesStyle ועוד — בשניות אחדות.",
  openGraph: {
    title: "חיפוש וולנס | Wellora",
    description: "השוואת מחירים חכמה ממאות מוצרי wellness ב-20+ אתרים.",
    url: "https://wellora.com/search",
  },
  alternates: { canonical: "https://wellora.com/search" },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
