"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "../lib/store";
import { Container } from "./container";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NodeRenderer({ id }: { id: string }) {
  const node = useBuilderStore((s) => s.nodes[id]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const { setNodeRef: setDropRef } = useDroppable({
    id: id + "-dropzone",
    data: {
      type: node?.type,
    },
  });

  if (!node) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isContainer = node.type === "group" || node.type === "row";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-id={id}
      className="mb-2 touch-none"
    >
      <Card
        className={cn(
          "relative p-4 cursor-default",
          isContainer ? "bg-card" : "bg-card",
        )}
      >
        <div className="flex flex-col gap-3">
          <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider">
            {node.type}
          </Label>

          {isContainer && (
            <div
              ref={setDropRef}
              data-container-padding
              className={cn(
                "p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30 transition-colors",
                "hover:border-primary/50 hover:bg-muted/50",
              )}
              style={{
                minHeight: node.children.length === 0 ? 80 : "auto",
              }}
            >
              {node.children.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                  Drop items here
                </div>
              )}
              <Container childrenIds={node.children} parentId={id} />
            </div>
          )}

          {!isContainer && (
            <Input
              readOnly
              placeholder={`Enter ${node.type}...`}
              className="cursor-pointer"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
