// Generates responsive WebP variants for every JPEG in public/img,
// a small logo, and the 1200×630 social share image.
// Usage: npm run images   (re-run after adding or replacing a photo)
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { publicImgDir } from "./lib.js";

export const WIDTHS = [480, 960];
const QUALITY = 72;

const imgDir = publicImgDir();
const publicDir = path.dirname(imgDir);

async function variants(file) {
  const base = file.replace(/\.(jpe?g)$/i, "");
  const source = path.join(imgDir, file);
  const { width } = await sharp(source).metadata();
  for (const target of WIDTHS) {
    const out = path.join(imgDir, `${base}-${target}.webp`);
    await sharp(source)
      .resize({ width: Math.min(target, width), withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);
  }
}

const files = readdirSync(imgDir).filter((name) => /\.jpe?g$/i.test(name));
for (const file of files) {
  await variants(file);
  console.log(`webp  ${file}`);
}

await sharp(path.join(imgDir, "logo.jpeg"))
  .resize(96, 96, { fit: "cover" })
  .webp({ quality: 80 })
  .toFile(path.join(imgDir, "logo-96.webp"));
console.log("logo  logo-96.webp");

const ogSource = path.join(imgDir, "achu.jpg");
if (existsSync(ogSource)) {
  await sharp(ogSource)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(publicDir, "og-image.jpg"));
  console.log("og    og-image.jpg");
}
