import type { NextConfig } from "next";

// In CI (GitHub Actions) we set NEXT_PUBLIC_BASE_PATH=/prototypes so the site works
// under https://<org>.github.io/prototypes/. Locally the env var is unset, so the dev
// server stays at http://localhost:3000/ with no prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
