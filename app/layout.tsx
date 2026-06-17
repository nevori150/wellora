import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wellora.com"),
  title: {
    default: "Wellora — Your Wellness Universe | השוואת מחירי וולנס",
    template: "%s | Wellora",
  },
  description: "מנוע החיפוש של עולם הוולנס — בגדי בד איכותי, ויטמינים, מזון אורגני, ציוד כושר וטיפוח טבעי. השוואת מחירים מ-20+ אתרים, הכל במקום אחד.",
  keywords: ["wellness", "וולנס", "השוואת מחירים", "ויטמינים", "מזון אורגני", "ספורט וכושר", "טיפוח טבעי", "iHerb", "Shein", "yes style", "iHerb ישראל"],
  authors: [{ name: "Wellora" }],
  creator: "Wellora",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "Wellora",
    title: "Wellora — Your Wellness Universe",
    description: "מנוע החיפוש של עולם הוולנס — השוואת מחירים מ-20+ אתרים.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Wellora" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wellora — Your Wellness Universe",
    description: "מנוע החיפוש של עולם הוולנס — השוואת מחירים מ-20+ אתרים.",
    images: ["/og-default.png"],
  },
  other: {
    "impact-site-verification": "d07c5a7a-25dc-4d0c-a9ef-66ebdb978ed3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
<body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
