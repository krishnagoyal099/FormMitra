// next.config.mjs
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": resolve(dirname(fileURLToPath(import.meta.url)), "src"),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
