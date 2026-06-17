import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/favorites", "/profile"],
      },
    ],
    sitemap: "https://wellzy.co.il/sitemap.xml",
  };
}
