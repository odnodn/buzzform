"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "../lib/store";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isContainerType } from "../lib/types";
import { useBuilderFormContext } from "./builder-form-context";
import { FieldRenderer } from "@/registry/base/fields/render";
import { builderFieldRegistry } from "../lib/registry";

export function NodeRenderer({ id }: { id: string }) {
  const node = useBuilderStore((s) => s.nodes[id]);
  const { form, mode } = useBuilderFormContext();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

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

  // Render layout-specific containers with WYSIWYG feel
  const renderLayoutContent = () => {
    const entry = builderFieldRegistry[fieldType];

    if (entry?.renderer) {
      const Renderer = entry.renderer;
      return (
        <Renderer id={id} field={node.field} childrenIds={node.children} />
      );
    }

    return null;
  };

  // For layout containers, render with layout-specific styling
  if (isContainer) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        data-id={id}
        className="mb-2 touch-none"
      >
        {renderLayoutContent()}
      </div>
    );
  }

  // For data fields, render with card wrapper
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-id={id}
      className="mb-2 touch-none"
    >
      <Card className="relative p-4 cursor-default bg-card">
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
      </Card>
    </div>
  );
}
