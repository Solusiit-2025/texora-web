// Ekstrak gambar data-URI base64 dari DB menjadi file di /public, lalu
// update kolomnya menjadi path biasa. Tujuan: HTML/SSR tidak lagi membawa
// blob base64 raksasa (hero 4,3 MB + thumbnail 153 KB + galeri 380 KB).
//
// Jalankan: node scripts/extract-embedded-images.cjs
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const PUBLIC_DIR = path.join(process.cwd(), "public");

function dataUriToFile(dataUri, outDir, baseName) {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(dataUri);
  if (!m) return null;
  const mime = m[1].toLowerCase();
  const ext =
    mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "jpg";
  const dir = path.join(PUBLIC_DIR, ...outDir.split("/"));
  fs.mkdirSync(dir, { recursive: true });
  const fileName = `${baseName}.${ext}`;
  const buf = Buffer.from(m[2], "base64");
  fs.writeFileSync(path.join(dir, fileName), buf);
  return { url: `/${outDir}/${fileName}`, bytes: buf.length };
}

(async () => {
  let saved = 0;
  let freed = 0;

  // 1) Hero slide secondaryImage
  const slides = await p.heroSlide.findMany();
  for (const s of slides) {
    if (!String(s.secondaryImage || "").startsWith("data:")) continue;
    const res = dataUriToFile(s.secondaryImage, "images/hero", `hero-${s.id.slice(-6)}-sub`);
    if (!res) continue;
    await p.heroSlide.update({ where: { id: s.id }, data: { secondaryImage: res.url } });
    freed += String(s.secondaryImage).length;
    saved++;
    console.log(`hero.slide ${s.id.slice(-6)} -> ${res.url} (${(res.bytes / 1024).toFixed(0)} KB file)`);
  }

  // 2) Product thumbnailUrl + galleryImages
  const products = await p.fabricProduct.findMany();
  for (const prod of products) {
    const slug = prod.slug || prod.id.slice(-6);

    if (String(prod.thumbnailUrl || "").startsWith("data:")) {
      const res = dataUriToFile(prod.thumbnailUrl, "images/fabrics", `${slug}-thumb`);
      if (res) {
        await p.fabricProduct.update({ where: { id: prod.id }, data: { thumbnailUrl: res.url } });
        freed += String(prod.thumbnailUrl).length;
        saved++;
        console.log(`product ${slug} thumbnail -> ${res.url} (${(res.bytes / 1024).toFixed(0)} KB file)`);
      }
    }

    if (String(prod.galleryImages || "").includes("data:")) {
      let arr = [];
      try {
        arr = JSON.parse(prod.galleryImages);
      } catch {
        continue;
      }
      if (!Array.isArray(arr)) continue;
      let changed = false;
      const next = arr.map((item, i) => {
        if (typeof item === "string" && item.startsWith("data:")) {
          const res = dataUriToFile(item, "images/fabrics", `${slug}-gallery-${i + 1}`);
          if (res) {
            freed += item.length;
            changed = true;
            console.log(`product ${slug} gallery[${i}] -> ${res.url} (${(res.bytes / 1024).toFixed(0)} KB file)`);
            return res.url;
          }
        }
        return item;
      });
      if (changed) {
        await p.fabricProduct.update({
          where: { id: prod.id },
          data: { galleryImages: JSON.stringify(next) },
        });
        saved++;
      }
    }
  }

  console.log(`\nSelesai: ${saved} kolom diupdate, ~${(freed / 1024 / 1024).toFixed(2)} MB base64 dihapus dari DB/payload.`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
