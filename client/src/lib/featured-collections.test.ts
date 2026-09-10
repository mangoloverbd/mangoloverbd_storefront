import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FEATURED_COLLECTIONS,
  TOP_SELLING_COLLECTION,
  TOP_SELLING_PRODUCT_SLUGS,
  getCollection,
  getFeaturedCollection,
  getTopSellingProducts,
  getProductsForCollection,
  getVisibleFeaturedCollections,
} from "./featured-collections";

test("defines the eight homepage collections", () => {
  assert.deepEqual(FEATURED_COLLECTIONS.map(({ slug }) => slug), [
    "homemade",
    "honey",
    "oil-and-ghee",
    "jaggery",
    "semai",
    "fresh-mango",
    "dates",
    "nuts-and-seeds",
  ]);
});

test("assigns every current product to exactly one collection", () => {
  const assignments = FEATURED_COLLECTIONS.flatMap((collection) =>
    collection.productSlugs.map((productSlug) => ({ collection: collection.slug, productSlug })),
  );
  const productSlugs = [
    "litchi-flower-honey",
    "mustard-oil",
    "seed-nut-mix",
    "seed-mixed",
    "beetroot-powder",
    "kalojira-mixed",
    "honey-nut",
    "chia-seed",
    "pure-ghee",
    "sundarbans-natural-honey",
    "black-seed-flower-honey",
    "sugarcane-juice-powder",
    "amsotto-pickle",
    "lachcha-semai",
  ];

  assert.equal(new Set(assignments.map(({ productSlug }) => productSlug)).size, assignments.length);
  assert.deepEqual(assignments.map(({ productSlug }) => productSlug).sort(), productSlugs.sort());
});

test("filters a catalog by assigned slugs and ignores missing products", () => {
  const products = [
    { slug: "honey-nut", name: "Honey Nut" },
    { slug: "missing", name: "Missing" },
    { slug: "pure-ghee", name: "Pure Ghee" },
  ];
  const collection = getFeaturedCollection("honey");

  assert.deepEqual(getProductsForCollection(products, collection!), [products[0]]);
});

test("returns no assigned products for empty collections", () => {
  const collection = getFeaturedCollection("jaggery");
  assert.deepEqual(getProductsForCollection([], collection!), []);
});

test("hides collections with no matching products without removing their definitions", () => {
  const products = [
    { slug: "honey-nut", name: "Honey Nut" },
    { slug: "lachcha-semai", name: "Lachcha Semai" },
  ];

  assert.deepEqual(
    getVisibleFeaturedCollections(products).map(({ slug }) => slug),
    ["honey", "semai"],
  );
  assert.ok(getFeaturedCollection("jaggery"));
});

test("orders Top Selling Products with the three hero products first", () => {
  assert.equal(TOP_SELLING_COLLECTION.slug, "top-selling-products");
  assert.equal(TOP_SELLING_COLLECTION.label, "Top Selling Products - সেরা বিক্রিত পণ্য");

  const products = TOP_SELLING_PRODUCT_SLUGS.map((slug) => ({ slug, name: slug }));
  assert.deepEqual(
    getTopSellingProducts(products).slice(0, 6).map(({ slug }) => slug),
    [
      "honey-nut",
      "sundarbans-natural-honey",
      "kalojira-mixed",
      "litchi-flower-honey",
      "black-seed-flower-honey",
      "seed-nut-mix",
    ],
  );
});

test("skips missing top-selling products and appends new catalog products", () => {
  const products = [
    { slug: "new-product", name: "New Product" },
    { slug: "seed-mixed", name: "Seed Mixed" },
    { slug: "honey-nut", name: "Honey Nut" },
    { slug: "kalojira-mixed", name: "Kalojira Mixed" },
  ];

  assert.deepEqual(
    getTopSellingProducts(products).map(({ slug }) => slug),
    ["honey-nut", "kalojira-mixed", "seed-mixed", "new-product"],
  );
});

test("resolves Top Selling Products without exposing it as a Featured Category", () => {
  assert.equal(getCollection("top-selling-products")?.slug, "top-selling-products");
  assert.equal(getFeaturedCollection("top-selling-products"), null);
  assert.doesNotMatch(FEATURED_COLLECTIONS.map(({ slug }) => slug).join(" "), /top-selling-products/);
});
