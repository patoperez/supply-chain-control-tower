import type { NextConfig } from "next";

// Single source of truth for the sub-path this site is served from.
// The portfolio lives at perezfajardo.com/ and this case study is mounted at
// perezfajardo.com/supply-chain-control-tower/. Set to "" to serve at root.
const basePath = "/supply-chain-control-tower";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages deployment
  output: "export",

  // Prefix every route and framework/static asset with the sub-path.
  basePath,
  assetPrefix: basePath,

  // basePath rewrites <Link>/<Image>/_next assets automatically, but it does
  // NOT touch hand-written runtime URLs (e.g. fetch("/data/..")). Expose the
  // value to client code so those can be prefixed from this same source.
  // (NEXT_PUBLIC_* is inlined at build time, so it's safe in the static export.)
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
