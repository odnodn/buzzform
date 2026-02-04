"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "../../lib/store";

interface WindowFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function WindowFrame({ children, className }: WindowFrameProps) {
  const viewport = useBuilderStore((state) => state.viewport);
  const zoom = useBuilderStore((state) => state.zoom);
  const mode = useBuilderStore((state) => state.mode);

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl h-150 bg-background border border-border rounded-xl shadow-[0_0_60px_-5px_hsl(var(--primary)/0.4)] flex flex-col relative transition-all duration-300 ease-in-out origin-top overflow-hidden",
        className,
      )}
      style={{
        transform: `scale(${zoom})`,
        width: getViewportWidth(),
        maxWidth: viewport === "desktop" ? "896px" : "none",
      }}
    >
      <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-1.5 w-20">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="text-xs text-muted-foreground font-medium flex-1 text-center">
          {mode === "preview" ? "Preview Mode" : "Edit Mode"}
        </div>
        <div className="w-20 flex justify-end gap-1" />
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 overflow-hidden">{children}</ScrollArea>
    </div>
  );
}
