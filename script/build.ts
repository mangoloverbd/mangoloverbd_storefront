import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { copyFile, mkdir, readFile, rm, writeFile } from "fs/promises";

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

const productSlugs = [
  "stepprs-massage-insoles",
  "massage-insoles",
  "4-in-1-makeup-pen",
  "bordeaux",
  "plum-veil",
  "rosy-bloom",
  "mauve-nude",
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

async function generateStorefrontProducts() {
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
  } catch (error) {
    console.warn("Could not refresh generated storefront products. Using last generated data.", error);
  }
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  await generateStorefrontProducts();

  console.log("building client...");
  await viteBuild();

  console.log("creating product route fallbacks...");
  await Promise.all(
    productSlugs.map(async (slug) => {
      const routeDir = `dist/public/product/${slug}`;
      await mkdir(routeDir, { recursive: true });
      await copyFile("dist/public/index.html", `${routeDir}/index.html`);
    }),
  );

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
