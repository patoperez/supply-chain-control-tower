/**
 * Single source of truth for the sub-path this site is served from.
 *
 * The portfolio lives at perezfajardo.com/ and this case study is mounted at
 * perezfajardo.com/supply-chain-control-tower/. This constant feeds three things:
 *   1. `basePath` + `assetPrefix` in next.config.ts (imports BASE_PATH from here),
 *   2. the post-build nesting step (scripts/nest-export.mjs),
 *   3. `withBasePath()` for hand-written runtime URLs (see below).
 *
 * It is HARDCODED on purpose — not read from an env var — so the production
 * build on Cloudflare can never end up with an empty basePath. Set to "" to
 * serve the site at the domain root again.
 *
 * NOTE: this module is imported by next.config.ts, so it must stay
 * dependency-free (no imports, no `@/` aliases) to load in that context.
 */

export const BASE_PATH = "/supply-chain-control-tower";

/**
 * Prefix an absolute, root-relative asset path with the basePath.
 * Next's basePath/assetPrefix auto-rewrite routes and bundled assets, but NOT
 * hand-written runtime URLs like `fetch("/data/..")` — those need this.
 */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
