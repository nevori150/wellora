/**
 * iHerb Affiliate Feed Importer
 *
 * Usage:
 *   npx tsx scripts/import-iherb.ts --file path/to/iherb-feed.csv --code YOUR_RCODE
 *
 * iHerb sends the CSV with these columns (tab-separated):
 *   Product Id, Product Name, Brand Name, Catalog Category Name,
 *   Price USD, Sale Price USD, Product URL, Small Image URL, Large Image URL,
 *   Short Description, UPC, Size
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const prisma = new PrismaClient();

// iHerb category → WELLZY category mapping
const CATEGORY_MAP: Record<string, string> = {
  "vitamins": "ויטמינים ותוספים",
  "vitamin": "ויטמינים ותוספים",
  "supplements": "ויטמינים ותוספים",
  "supplement": "ויטמינים ותוספים",
  "minerals": "ויטמינים ותוספים",
  "protein": "ספורט וכושר",
  "sports": "ספורט וכושר",
  "fitness": "ספורט וכושר",
  "amino": "ספורט וכושר",
  "creatine": "ספורט וכושר",
  "beauty": "מוצרי טיפוח טבעיים",
  "skin care": "מוצרי טיפוח טבעיים",
  "hair care": "מוצרי טיפוח טבעיים",
  "personal care": "מוצרי טיפוח טבעיים",
  "food": "מזון בריא וסופרפוד",
  "grocery": "מזון בריא וסופרפוד",
  "superfoods": "מזון בריא וסופרפוד",
  "organic": "מזון בריא וסופרפוד",
  "sleep": "שינה וריקברי",
  "recovery": "שינה וריקברי",
  "women": "בריאות האישה",
  "home": "בית ירוק וניקוי טבעי",
  "cleaning": "בית ירוק וניקוי טבעי",
};

function mapCategory(iherbCategory: string): string {
  const lower = iherbCategory.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "ויטמינים ותוספים"; // default
}

function toSlug(name: string, id: string): string {
  return `iherb-${id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
}

function addAffiliateCode(url: string, rcode: string): string {
  if (!rcode) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}rcode=${rcode}`;
}

function extractTags(name: string, brand: string, category: string): string[] {
  const tags: string[] = [];
  const text = `${name} ${brand} ${category}`.toLowerCase();
  if (text.includes("organic") || text.includes("אורגני")) tags.push("אורגני");
  if (text.includes("vegan") || text.includes("plant")) tags.push("טבעוני");
  if (text.includes("gluten")) tags.push("גלוטן פרי");
  if (text.includes("vitamin c")) tags.push("ויטמין C");
  if (text.includes("vitamin d")) tags.push("ויטמין D");
  if (text.includes("omega")) tags.push("אומגה 3");
  if (text.includes("protein")) tags.push("חלבון");
  if (text.includes("probiotic")) tags.push("פרוביוטיקה");
  if (text.includes("collagen")) tags.push("קולגן");
  if (text.includes("magnesium")) tags.push("מגנזיום");
  if (text.includes("zinc")) tags.push("אבץ");
  return tags;
}

async function parseCsv(filePath: string): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, "utf8"),
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let isFirst = true;

  for await (const line of rl) {
    // iHerb feed is tab-separated
    const cols = line.split("\t").map(c => c.replace(/^"|"$/g, "").trim());
    if (isFirst) {
      headers = cols;
      isFirst = false;
      continue;
    }
    if (cols.length < 3) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });
    rows.push(row);
  }

  return rows;
}

async function importFeed(filePath: string, rcode: string, limit?: number) {
  console.log(`\n📦 Reading iHerb feed: ${filePath}`);
  const rows = await parseCsv(filePath);
  const toProcess = limit ? rows.slice(0, limit) : rows;
  console.log(`Found ${rows.length} products — importing ${toProcess.length}\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of toProcess) {
    const id = row["Product Id"] || row["id"] || "";
    const name = row["Product Name"] || row["name"] || "";
    const brand = row["Brand Name"] || row["brand"] || "";
    const category = row["Catalog Category Name"] || row["category"] || "";
    const priceRaw = parseFloat(row["Sale Price USD"] || row["Price USD"] || "0");
    const originalPriceRaw = parseFloat(row["Price USD"] || "0");
    const url = row["Product URL"] || row["url"] || "";
    const image = row["Large Image URL"] || row["Small Image URL"] || row["image"] || "";
    const description = row["Short Description"] || row["description"] || "";
    const size = row["Size"] || row["size"] || "";

    if (!name || !url || priceRaw <= 0) { skipped++; continue; }

    const slug = toSlug(name, id);
    const affiliateUrl = addAffiliateCode(url, rcode);
    const mappedCategory = mapCategory(category);
    const tags = extractTags(name, brand, category);
    const price = Math.round(priceRaw * 3.7 * 100) / 100; // USD → ILS (approximate)
    const originalPrice = Math.round(originalPriceRaw * 3.7 * 100) / 100;

    try {
      const existing = await prisma.product.findUnique({ where: { slug } });

      if (existing) {
        await prisma.storePrice.upsert({
          where: { productId_store: { productId: existing.id, store: "iHerb" } },
          update: { price, originalPrice, url: affiliateUrl, productTitle: name, brand, lastChecked: new Date(), inStock: true },
          create: { productId: existing.id, store: "iHerb", price, originalPrice, url: affiliateUrl, productTitle: name, brand, inStock: true },
        });
        updated++;
      } else {
        const product = await prisma.product.create({
          data: {
            slug,
            name,
            category: mappedCategory,
            description: description || `${name} מאת ${brand}`,
            image: image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
            tags: JSON.stringify(tags),
            source: "iherb",
            size: size || undefined,
            comparisonType: "identical",
          },
        });
        await prisma.storePrice.create({
          data: {
            productId: product.id,
            store: "iHerb",
            price,
            originalPrice,
            url: affiliateUrl,
            productTitle: name,
            brand,
            inStock: true,
          },
        });
        created++;
      }

      if ((created + updated) % 100 === 0) {
        process.stdout.write(`  ✓ ${created + updated} processed...\r`);
      }
    } catch (e) {
      skipped++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
}

// Parse CLI args
const args = process.argv.slice(2);
const fileIdx = args.indexOf("--file");
const codeIdx = args.indexOf("--code");
const limitIdx = args.indexOf("--limit");

const filePath = fileIdx !== -1 ? args[fileIdx + 1] : null;
const rcode = codeIdx !== -1 ? args[codeIdx + 1] : "";
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) : undefined;

if (!filePath || !fs.existsSync(filePath)) {
  console.error("❌ Usage: npx tsx scripts/import-iherb.ts --file path/to/feed.csv --code YOUR_RCODE");
  console.error("   Optional: --limit 500  (import only first N products)");
  process.exit(1);
}

importFeed(path.resolve(filePath), rcode, limit)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
