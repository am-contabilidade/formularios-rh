import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
