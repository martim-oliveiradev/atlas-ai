import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    "/api/trips/[id]/pdf": ["./node_modules/@fontsource/inter/files/inter-latin-ext-{400,600,700}-normal.woff"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
