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
  const { setNodeRef } = useDroppable({ id: "root" });

  return (
    <BuilderFormProvider mode={mode} onSubmit={onSubmit}>
      <div
        ref={setNodeRef}
        data-id="root"
        className="flex-1 p-8 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/10"
      >
        <Container childrenIds={rootIds} />
      </div>
    </BuilderFormProvider>
  );
}
