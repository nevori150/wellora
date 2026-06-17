import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "חיפוש מוצרי וולנס — השוואת מחירים",
  description: "חפש ויטמינים, מזון אורגני, ציוד ספורט וטיפוח טבעי. WELLZY משווה מחירים מ-iHerb, Shein, YesStyle ועוד — בשניות אחדות.",
  openGraph: {
    title: "חיפוש וולנס | WELLZY",
    description: "השוואת מחירים חכמה ממאות מוצרי wellness ב-20+ אתרים.",
    url: "https://wellzy.co.il/search",
  },
  alternates: { canonical: "https://wellzy.co.il/search" },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
