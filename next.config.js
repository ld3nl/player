/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "paullowe.org",
        port: "",
        pathname: "/wp-content/uploads",
      },
    ],
  },
};

module.exports = nextConfig;
