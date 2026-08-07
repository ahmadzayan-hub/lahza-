import { db, schema } from "@/db";
import { SAMPLE_PRODUCTS, SAMPLE_REVIEWS } from "@/lib/sample-data";

// Populates the database with the demo catalogue. Run after `db:push`:
//   npm run db:seed
async function seed() {
  for (const p of SAMPLE_PRODUCTS) {
    await db
      .insert(schema.products)
      .values({
        id: p.id,
        slug: p.slug,
        titleEn: p.titleEn,
        titleAr: p.titleAr,
        descriptionEn: p.descriptionEn,
        descriptionAr: p.descriptionAr,
        priceAed: p.priceAed,
        compareAtAed: p.compareAtAed ?? undefined,
        material: p.material,
        cloudinaryIds: p.cloudinaryIds,
        stock: p.stock,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
      })
      .onDuplicateKeyUpdate({ set: { stock: p.stock } });
  }

  for (const r of SAMPLE_REVIEWS) {
    await db
      .insert(schema.reviews)
      .values({ id: r.id, productId: r.productId, author: r.author, rating: r.rating, body: r.body })
      .onDuplicateKeyUpdate({ set: { body: r.body } });
  }

  console.info(`Seeded ${SAMPLE_PRODUCTS.length} products, ${SAMPLE_REVIEWS.length} reviews.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
