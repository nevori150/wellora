import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "התחברות",
  description: "התחבר לחשבון Wellora שלך וגישה למועדפים, פרופיל אישי וחיפושים שמורים.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://wellora.com/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
