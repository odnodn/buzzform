import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { siteConfig, navLinks } from "@/lib/constants";
import { MobileNav } from "@/components/landing/mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-8">
        <Link to="/" className="mr-4 flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg invert dark:invert-0">
            <img
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={24}
              height={24}
            />
          </div>
          <span className="hidden text-sm font-semibold tracking-tight md:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        <div className="ml-auto flex items-center space-x-2">
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <a href={siteConfig.github} target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={GithubIcon} className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            }
          />
          <ThemeToggle />
          <Button
            size="sm"
            className="gap-2 h-8 hidden sm:flex"
            nativeButton={false}
            render={
              <Link to="/builder">
                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
                Create Form
              </Link>
            }
          />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
