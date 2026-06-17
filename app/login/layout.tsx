import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "התחברות",
  description: "התחבר לחשבון WELLZY שלך וגישה למועדפים, פרופיל אישי וחיפושים שמורים.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://wellzy.co.il/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
