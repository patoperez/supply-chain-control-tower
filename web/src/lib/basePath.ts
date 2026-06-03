/**
 * Sub-path helper. The site is served from a sub-path of perezfajardo.com
 * (see `basePath` in next.config.ts). Next's basePath/assetPrefix auto-rewrite
 * routes and bundled assets, but NOT hand-written runtime URLs like
 * `fetch("/data/..")`. Prefix those with `withBasePath()` so they resolve under
 * the sub-path. The value comes from NEXT_PUBLIC_BASE_PATH, set once in
 * next.config.ts and inlined at build time.
 */

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix an absolute, root-relative asset path with the configured basePath. */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
