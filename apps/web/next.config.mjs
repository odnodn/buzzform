import { createMDX } from "fumadocs-mdx/next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isGitHubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname, "../../"),
    ...(isGitHubPages && {
      // Swap server actions with client-side implementation for static export
      resolveAlias: {
        "@/app/(builder)/lib/actions": "@/app/(builder)/lib/actions.client",
      },
    }),
  },
  ...(isGitHubPages && {
    output: "export",
    basePath: process.env.BASE_PATH || "",
    images: { unoptimized: true },
  }),
};

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

export default withMDX(config);
