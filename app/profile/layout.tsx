import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "פרופיל wellness אישי",
  description: "בנה פרופיל wellness מותאם אישית — ספורט, תזונה ותחומי עניין. Wellora ימצא לך מוצרים שמתאימים בדיוק לך.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
