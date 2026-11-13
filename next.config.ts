import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lettertypes voor de voorbeeldkaartjes bij het delen meenemen naar de server.
  outputFileTracingIncludes: {
    "/zaak/[slug]/opengraph-image": ["./src/assets/og-fonts/**/*"],
  },
  // "Kindermenu" heet nu "Kinderaanbod": oude link blijft werken.
  async redirects() {
    return [
      { source: "/met/kindermenu", destination: "/met/kinderaanbod", permanent: true },
      { source: "/met/kinderwagenvriendelijk", destination: "/met/kinderwagentoegankelijk", permanent: true },
    ];
  },
};

export default nextConfig;
