import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FEATURED_COLLECTIONS,
  getFeaturedCollection,
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
