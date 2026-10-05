import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // The floating dev badge covers the bottom tab bar on mobile; build/runtime errors still show.
  devIndicators: false,
};

export default withNextIntl(nextConfig);
