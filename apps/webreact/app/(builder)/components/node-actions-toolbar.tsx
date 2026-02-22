
import React from "react";
import { Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface NodeActionsToolbarProps {
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function NodeActionsToolbar({
  onDuplicate,
  onDelete,
}: NodeActionsToolbarProps) {
  return (
    <div
      className={cn(
        "absolute -top-9 right-0 z-50",
        "flex items-center gap-0.5 p-1",
        "bg-card/75 backdrop-blur-md",
        "border border-border/50 rounded-lg",
        "shadow-lg shadow-black/10",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-6 w-6 rounded-md",
              "text-foreground/80 hover:text-primary hover:bg-primary/10",
            )}
            onClick={onDuplicate}
          >
            <Copy className="w-3 h-3" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={8}
            className="text-xs font-medium px-2 py-1"
          >
            Duplicate
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-3 bg-border/50 mx-0.5" />

        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-6 w-6 rounded-md",
              "text-foreground/80 hover:text-destructive hover:bg-destructive/10",
            )}
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={8}
            className="text-xs font-medium px-2 py-1"
          >
            Delete
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
