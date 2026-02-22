import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
  // The /api/search route is force-dynamic and is excluded from static exports,
  // so disable search in the UI for GitHub Pages builds to avoid 404s.
  const isGitHubPages = process.env.GITHUB_PAGES === "true";
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      {...(isGitHubPages && { search: false })}
    >
      {children}
    </DocsLayout>
  );
}
