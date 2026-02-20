import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/claude-agent-sdk", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
