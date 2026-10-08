import { readdirSync } from "node:fs";
import { listSourceFiles, readRoot, imageExists, publicImgDir, ok, fail } from "./lib.js";

const IMG_REF = /img\/[A-Za-z0-9._-]+/g;

export function run() {
  const errors = [];
  const warnings = [];
  const referenced = new Set();

  const files = [
    "index.html",
    ...listSourceFiles("src", [".js", ".jsx"]),
  ];

  for (const file of files) {
    const content = readRoot(file);
    for (const match of content.match(IMG_REF) ?? []) {
      referenced.add(match);
      if (!imageExists(match)) {
        errors.push(`${file}: referenced image not found "${match}"`);
      }
    }
  }

  for (const entry of readdirSync(publicImgDir())) {
    if (/\s/.test(entry)) {
      errors.push(`public/img: filename contains a space "${entry}"`);
    }
    const ref = `img/${entry}`;
    if (!referenced.has(ref)) {
      warnings.push(`public/img: unreferenced file "${entry}"`);
    }
  }

  return errors.length === 0
    ? ok("check-images")
    : fail("check-images", errors, warnings);
}
