// Cari nilai kolom teks yang menyimpan data-URI base64 (pembengkak HTML/SSR).
// Hanya membaca prefix & panjang — tidak mencetak isi gambar.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const queries = [
  ['cms_hero_slides.mainImage', 'SELECT id, "mainImage" AS v FROM cms_hero_slides'],
  ['cms_hero_slides.secondaryImage', 'SELECT id, "secondaryImage" AS v FROM cms_hero_slides'],
  ['fabric_products.thumbnailUrl', 'SELECT id, "thumbnailUrl" AS v FROM fabric_products'],
  ['fabric_products.galleryImages', 'SELECT id, "galleryImages" AS v FROM fabric_products'],
  ['cms_articles.coverImage', 'SELECT id, "coverImage" AS v FROM cms_articles'],
  ['cms_articles.galleryImages', 'SELECT id, "galleryImages" AS v FROM cms_articles'],
  ['cms_site_content.value', 'SELECT id, value AS v FROM cms_site_content'],
  ['cms_testimonials.quote', 'SELECT id, quote AS v FROM cms_testimonials'],
  ['social_comments.aiReply', 'SELECT id, "aiReply" AS v FROM social_comments'],
];

(async () => {
  for (const [label, sql] of queries) {
    let rows = [];
    try {
      rows = await p.$queryRawUnsafe(sql);
    } catch (e) {
      console.log(`SKIP ${label}: ${e.message.split("\n")[0]}`);
      continue;
    }
    for (const r of rows) {
      const v = r.v == null ? "" : String(r.v);
      if (v.startsWith("data:") || v.length > 50000) {
        console.log(
          `${label} id=${String(r.id).slice(-6)} len=${v.length} prefix=${v.slice(0, 40)}`
        );
      }
    }
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
