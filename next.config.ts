import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lettertypes voor de voorbeeldkaartjes bij het delen meenemen naar de server.
  outputFileTracingIncludes: {
    "/zaak/[slug]/opengraph-image": ["./src/assets/og-fonts/**/*"],
  },
};

export default nextConfig;
