/**
 * Post-build step. Next's static export is FLAT: with basePath set, the HTML
 * still lands at out/index.html while its internal URLs point at
 * /supply-chain-control-tower/... . Served from a host root (e.g. Cloudflare
 * Pages), that means pages load with no assets and the sub-path 404s.
 *
 * This moves the whole export under out/<BASE_PATH>/ so the files physically
 * live where their own URLs reference them. The result can be served at a host
 * root and visited directly at /supply-chain-control-tower/, or proxied 1:1 by
 * the router Worker at perezfajardo.com/supply-chain-control-tower.
 *
 * Runs as part of `npm run build` (see package.json) so it's automatic on
 * Cloudflare too. BASE_PATH is read from src/lib/basePath.ts (the single
 * source) by text — not imported — so this works on any Node version without
 * TypeScript loader support.
 */
import { readdir, mkdir, rename, readFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");

// Single-source the slug: parse BASE_PATH out of src/lib/basePath.ts.
const src = await readFile(join(process.cwd(), "src", "lib", "basePath.ts"), "utf8");
const match = src.match(/export const BASE_PATH\s*=\s*["'`]([^"'`]*)["'`]/);
if (!match) {
  console.error("[nest-export] Could not find BASE_PATH in src/lib/basePath.ts");
  process.exit(1);
}
const slug = match[1].replace(/^\/+/, ""); // "supply-chain-control-tower"

if (!slug) {
  console.log("[nest-export] BASE_PATH is empty — serving at root, nothing to nest.");
  process.exit(0);
}

const dest = join(OUT, slug);
const entries = await readdir(OUT);

// Idempotent: if a previous run already nested, `out` contains only the slug dir.
if (entries.length === 1 && entries[0] === slug) {
  console.log(`[nest-export] Already nested under out/${slug}/ — skipping.`);
  process.exit(0);
}

await mkdir(dest, { recursive: true });
for (const name of entries) {
  if (name === slug) continue;
  await rename(join(OUT, name), join(dest, name));
}

console.log(`[nest-export] Moved export into out/${slug}/`);
