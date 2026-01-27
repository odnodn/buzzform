"use client";

import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "../lib/store";
import { Container } from "./container";

export function Canvas() {
  const rootIds = useBuilderStore((s) => s.rootIds);
  const { setNodeRef } = useDroppable({ id: "root" });

  return (
    <div
      ref={setNodeRef}
      data-id="root"
      className="flex-1 p-8 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/10"
    >
      <Container childrenIds={rootIds} />
    </div>
  );
}
