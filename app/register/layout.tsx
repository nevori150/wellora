import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הרשמה בחינם",
  description: "הצטרף ל-Wellora בחינם — שמור מועדפים, בנה פרופיל wellness אישי וקבל המלצות מוצרים מותאמות.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://wellora.com/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
