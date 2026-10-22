import type { NextConfig } from "next";

// Cache Components is left off: every page here is per-user and read
// behind auth, so there is no static shell worth prerendering.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
