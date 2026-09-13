import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSitePages } from "./build-site-pages.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const files = [
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

const directories = ["public"];

rmSync(dist, { force: true, recursive: true });
mkdirSync(dist, { recursive: true });

for (const entry of [...files, ...directories]) {
  const source = resolve(root, entry);
  if (!existsSync(source)) continue;
  cpSync(source, resolve(dist, entry), { recursive: true });
}

await buildSitePages({ outputDirectory: dist });

console.log(`Built static site in ${dist}`);
