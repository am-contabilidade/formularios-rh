import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shell estático por rota + streaming do que vem do banco (ver
  // node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md).
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-s3.amautomacao.cloud",
        pathname: "/colaboradores/**",
      },
    ],
  },
};

export default nextConfig;
