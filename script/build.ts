import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { mkdir, readFile, rm, writeFile } from "fs/promises";

const storefrontId = process.env.VITE_STOREFRONT_ID ?? "2a155750-b11a-4ff2-a7ff-4e26daac46ef";
const configuredMerchantSuiteUrl = (process.env.VITE_MERCHANT_SUITE_URL ?? "").replace(/\/$/, "");
const MERCHANT_SUITE_URL = process.env.NODE_ENV === "production"
  ? "https://admin.mangolover.com.bd"
  : configuredMerchantSuiteUrl;
if (!MERCHANT_SUITE_URL) {
  throw new Error("VITE_MERCHANT_SUITE_URL environment variable is not set");
}
const storefrontProductsUrl = `${MERCHANT_SUITE_URL}/api/public/v1/storefronts/${storefrontId}/products`;
const generatedProductsFile = "client/src/lib/generated-storefront-products.ts";
const SITE_URL = "https://www.mangolover.com.bd";

// Fallback slugs — real Mango Lover catalog only. Never Stepprs template slugs.
const fallbackSlugs = [
  "chia-seed",
  "pure-ghee",
  "sundarbans-natural-honey",
  "black-seed-flower-honey",
];

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

type BuildProduct = {
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  price?: string | number | null;
};

async function generateStorefrontProducts(): Promise<BuildProduct[]> {
  console.log("fetching storefront products...");

  try {
    const response = await fetch(storefrontProductsUrl);

    if (!response.ok) {
      throw new Error(`Merchant Suite returned ${response.status}`);
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];
    const source = `import type { StorefrontProduct } from "./storefront-products";\n\nexport const generatedStorefrontProducts: StorefrontProduct[] = ${JSON.stringify(products, null, 2)};\n`;

    await writeFile(generatedProductsFile, source);
    return products as BuildProduct[];
  } catch (error) {
    console.warn("Could not refresh generated storefront products. Using last generated data.", error);
    try {
      const src = await readFile(generatedProductsFile, "utf-8");
      const match = src.match(/export const generatedStorefrontProducts[^=]*=\s*(\[[\s\S]*\]);?\s*$/);
      if (match) {
        const parsed = JSON.parse(match[1]) as BuildProduct[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      // fall through to fallback slugs
    }
    return fallbackSlugs.map((slug) => ({ slug, name: slug }));
  }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function injectProductMeta(html: string, product: BuildProduct) {
  const desc = String(product.description || "ম্যাংগো লাভার — Mango Lover BD. Fresh, authentic products delivered across Bangladesh.").slice(0, 160);
  const title = `${product.name} | ম্যাংগো লাভার - Mango Lover`;
  const url = `${SITE_URL}/product/${product.slug}`;
  const image = product.image_url || `${SITE_URL}/opengraph.jpg`;
  const price = Number(product.price) || 0;
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(desc)}" />`);
  out = out.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  out = out.replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${escapeHtml(desc)}" />`);
  out = out.replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="product" />`);
  out = out.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  out = out.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${image}" />`);
  out = out.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: desc,
    image,
    url,
    brand: { "@type": "Brand", name: "Mango Lover" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: String(price),
      availability: "https://schema.org/InStock",
      url,
    },
  })}</script>`;
  return out.replace("</head>", `${jsonLd}</head>`);
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  const products = await generateStorefrontProducts();
  const slugs = [...new Set(products.map((p) => p.slug).filter(Boolean))];
  const effective = slugs.length ? slugs : fallbackSlugs;

  console.log("building client...");
  await viteBuild();

  console.log("creating product route fallbacks...");
  const baseHtml = await readFile("dist/public/index.html", "utf-8");
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  await Promise.all(
    effective.map(async (slug) => {
      const routeDir = `dist/public/product/${slug}`;
      await mkdir(routeDir, { recursive: true });
      const product = bySlug.get(slug);
      const html = product ? injectProductMeta(baseHtml, product) : baseHtml;
      await writeFile(`${routeDir}/index.html`, html);
    }),
  );

  console.log("regenerating sitemap...");
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE_URL}/products`, changefreq: "daily", priority: "0.9" },
    ...effective.map((slug) => ({
      loc: `${SITE_URL}/product/${slug}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    { loc: `${SITE_URL}/booking`, changefreq: "monthly", priority: "0.5" },
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`;
  await writeFile("dist/public/sitemap.xml", sitemap);

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
