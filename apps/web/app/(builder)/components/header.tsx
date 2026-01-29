import Image from "next/image";
import { CodeExportDialog } from "./code-export-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-header w-full items-center gap-2 px-4 text-foreground">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg invert dark:invert-0">
          <Link href="/">
            <Image src="/bb-icon.svg" alt="Logo" width={24} height={24} />
            <span className="sr-only">Buildnbuzz</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <CodeExportDialog />
        </div>
      </div>
    </header>
  );
}
