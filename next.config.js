/** @type {import('next').NextConfig} */
const path = require("node:path");

const nextConfig = {
  reactStrictMode: true,
  // Automatically memoize React components and hooks during compilation.
  reactCompiler: true,
  // Cache only explicitly marked server data; Next.js manages prerendered pages.
  cacheComponents: true,
  partialPrefetching: true,
  // Respect the project's no-new-files workflow when starting the dev server.
  agentRules: false,
  // Query-specific API responses stay uncached even when they reuse public data.
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    },
  ],
  experimental: {
    // Resolve named imports to individual icons instead of loading the full catalog.
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  images: {
    // Serve source images directly without the optimizer's disk or HTTP cache.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "paullowe.org",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.paullowe.org",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
