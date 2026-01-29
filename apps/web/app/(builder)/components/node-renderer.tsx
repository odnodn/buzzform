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

  const selectNode = useBuilderStore((s) => s.selectNode);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const isSelected = selectedId === id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  };

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
        onClick={handleSelect}
        className={cn(
          "mb-2 touch-none border border-transparent rounded-lg transition-colors",
          isSelected && "border-primary ring-1 ring-primary/20",
        )}
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
      onClick={handleSelect}
      className="mb-2 touch-none"
    >
      <Card
        className={cn(
          "relative p-4 cursor-default bg-card transition-all border",
          isSelected
            ? "border-primary ring-1 ring-primary/20"
            : "border-border",
        )}
      >
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
