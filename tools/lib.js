import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function readRoot(relative) {
  return readFileSync(path.join(root, relative), "utf8");
}

export function listSourceFiles(dirRelative, extensions) {
  const dir = path.join(root, dirRelative);
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(path.relative(root, full).replaceAll("\\", "/"), extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      out.push(path.relative(root, full).replaceAll("\\", "/"));
    }
  }
  return out;
}

export function imageExists(ref) {
  const clean = ref.replace(/^\//, "");
  return existsSync(path.join(root, "public", clean));
}

export function publicImgDir() {
  return path.join(root, "public", "img");
}

export function ok(name) {
  return { name, ok: true, errors: [], warnings: [] };
}

export function fail(name, errors, warnings = []) {
  return { name, ok: false, errors, warnings };
}
