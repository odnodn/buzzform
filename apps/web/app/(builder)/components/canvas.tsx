"use client";

import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "../lib/store";
import { Container } from "./container";
import { BuilderFormProvider, type BuilderMode } from "./builder-form-context";

interface CanvasProps {
  mode?: BuilderMode;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

export function Canvas({ mode = "edit", onSubmit }: CanvasProps) {
  const rootIds = useBuilderStore((s) => s.rootIds);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const { setNodeRef } = useDroppable({ id: "root" });

  const handleBackgroundClick = () => {
    selectNode(null);
  };

  return (
    <BuilderFormProvider mode={mode} onSubmit={onSubmit}>
      <div
        ref={setNodeRef}
        data-id="root"
        className="flex-1 p-8 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/10 min-h-125"
        onClick={handleBackgroundClick}
      >
        <Container childrenIds={rootIds} />
      </div>
    </BuilderFormProvider>
  );
}
