import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/basePath";

// basePath + assetPrefix are read from the single hardcoded BASE_PATH constant
// (see src/lib/basePath.ts) — NOT an env var — so the Cloudflare production
// build always has the sub-path set. They are intentionally identical so pages
// and assets resolve under the same prefix.
//
// Next's static export is FLAT (index.html lands at out/index.html, not under
// the basePath). scripts/nest-export.mjs runs after `next build` to physically
// move the export under out/<basePath>/ so the whole site can be served at
// perezfajardo.com/supply-chain-control-tower via the router Worker.
const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
};

export default nextConfig;
