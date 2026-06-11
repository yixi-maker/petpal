import type { NextConfig } from "next";

const skipTypecheck = process.env.SKIP_NEXT_TYPECHECK === "1";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: skipTypecheck,
  },
};

export default nextConfig;
