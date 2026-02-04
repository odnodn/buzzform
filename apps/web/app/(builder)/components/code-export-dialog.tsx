"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBuilderStore } from "../lib/store";
import { generateComponentCode } from "../lib/code-generator";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { HugeiconsIcon } from "@hugeicons/react";
import { SourceCodeIcon } from "@hugeicons/core-free-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
export function CodeExportDialog() {
  const nodes = useBuilderStore((s) => s.nodes);
  const rootIds = useBuilderStore((s) => s.rootIds);
  const formName = useBuilderStore((s) => s.formName);
  const [open, setOpen] = useState(false);
  const starterCommand =
    "npx shadcn@latest add https://form.buildnbuzz.com/r/starter.json";

  // Generate code on the fly when dialog opens
  const code = open ? generateComponentCode(nodes, rootIds, formName) : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <HugeiconsIcon icon={SourceCodeIcon} />
            Export
          </Button>
        }
      />
      <DialogContent className="sm:max-w-4xl w-full flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Export Component</DialogTitle>
          <DialogDescription>
            Copy this code to use your form in your application.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-medium">Required Setup</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  You must install BuzzForm specific dependencies before using
                  the generated code.
                </p>
                <div className="mt-3 [&_figure]:my-0!">
                  <DynamicCodeBlock lang="bash" code={starterCommand} />
                </div>
              </div>

              <div className="[&_figure]:my-0!">
                <DynamicCodeBlock lang="tsx" code={code} />
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
