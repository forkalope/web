import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const files = [
  "index.html",
  "styles.css",
  "script.js",
  "landscape.css",
  "developer.css",
  "developer.js",
  "legal.css",
  "network.css",
  "business.css",
  "faq.css",
  "CNAME",
];

const directories = ["public", "landscape", "co-sysops", "developer", "business", "partners", "faq", "privacy", "terms"];

rmSync(dist, { force: true, recursive: true });
mkdirSync(dist, { recursive: true });

for (const entry of [...files, ...directories]) {
  const source = resolve(root, entry);
  if (!existsSync(source)) continue;
  cpSync(source, resolve(dist, entry), { recursive: true });
}

console.log(`Built static site in ${dist}`);
