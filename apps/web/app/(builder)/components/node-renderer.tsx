"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "../lib/store";
import { Container } from "./container";
import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isContainerType } from "../lib/types";
import { useBuilderFormContext } from "./builder-form-context";
import { FieldRenderer } from "@/registry/base/fields/render";

export function NodeRenderer({ id }: { id: string }) {
  const node = useBuilderStore((s) => s.nodes[id]);
  const { form, mode } = useBuilderFormContext();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const { setNodeRef: setDropRef } = useDroppable({
    id: id + "-dropzone",
    data: {
      type: node?.field.type,
    },
  });

  if (!node) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fieldType = node.field.type;
  const isContainer = isContainerType(fieldType);
  const isEditMode = mode === "edit";

  // Compute path for the field
  const path = "name" in node.field ? node.field.name : id;

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
            <div className={cn(isEditMode && "pointer-events-none")}>
              <FieldRenderer
                field={
                  isEditMode && "name" in node.field
                    ? ({
                        ...node.field,
                        disabled: true,
                        readOnly: true,
                      } as typeof node.field)
                    : node.field
                }
                path={path}
                form={form}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
