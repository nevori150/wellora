import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "המועדפים שלי",
  description: "מוצרי הוולנס שסימנת כמועדפים — עקוב אחרי מחירים ורכוש בזמן הנכון.",
  robots: { index: false, follow: false },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
