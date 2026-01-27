"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { NodeRenderer } from "./node-renderer";
import { useBuilderStore } from "../lib/store";

export function Container({
  childrenIds,
  parentId = null,
}: {
  childrenIds: string[];
  parentId?: string | null;
}) {
  const indicatorIndex = useBuilderStore((s) =>
    s.dropIndicator?.parentId === parentId ? s.dropIndicator.index : null,
  );

  return (
    <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
      {childrenIds.map((id, index) => (
        <div key={id}>
          {indicatorIndex === index && <DropLine />}

          <NodeRenderer id={id} />
        </div>
      ))}

      {indicatorIndex === childrenIds.length && <DropLine />}
    </SortableContext>
  );
}

function DropLine() {
  return <div className="h-1 bg-primary my-1" />;
}
