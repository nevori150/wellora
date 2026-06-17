import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wellzy.co.il"),
  title: {
    default: "WELLZY — Live the Wellness Life | השוואת מחירי וולנס",
    template: "%s | WELLZY",
  },
  description: "מנוע החיפוש של עולם הוולנס — בגדי בד איכותי, ויטמינים, מזון אורגני, ציוד כושר וטיפוח טבעי. השוואת מחירים מ-20+ אתרים, הכל במקום אחד.",
  keywords: ["wellness", "וולנס", "השוואת מחירים", "ויטמינים", "מזון אורגני", "ספורט וכושר", "טיפוח טבעי", "iHerb", "Shein", "yes style", "iHerb ישראל"],
  authors: [{ name: "WELLZY" }],
  creator: "WELLZY",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "WELLZY",
    title: "WELLZY — Live the Wellness Life",
    description: "מנוע החיפוש של עולם הוולנס — השוואת מחירים מ-20+ אתרים.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "WELLZY" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WELLZY — Live the Wellness Life",
    description: "מנוע החיפוש של עולם הוולנס — השוואת מחירים מ-20+ אתרים.",
    images: ["/og-default.png"],
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
