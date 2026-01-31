"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBuilderStore } from "../lib/store";
import { cn } from "@/lib/utils";
import { isContainerType } from "../lib/types";
import { useBuilderFormContext } from "./builder-form-context";
import { FieldRenderer } from "@/registry/base/fields/render";
import { builderFieldRegistry } from "../lib/registry";
import { NodeActionsToolbar } from "./node-actions-toolbar";

export function NodeRenderer({ id }: { id: string }) {
  const node = useBuilderStore((s) => s.nodes[id]);
  const { form, mode } = useBuilderFormContext();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const selectNode = useBuilderStore((s) => s.selectNode);
  const removeNode = useBuilderStore((s) => s.removeNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const isSelected = selectedId === id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(id);
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

  const actionToolbar = (
    <div
      className={cn(
        "absolute right-2 top-2 z-20",
        "transition-all duration-200",
        isSelected
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto",
      )}
    >
      <NodeActionsToolbar
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </div>
  );

  const wrapperClasses = cn(
    "group relative mb-2 touch-none rounded-lg border transition-all hover:p-4",
    isSelected
      ? "border-primary ring-1 ring-primary/20 p-4"
      : "border-transparent hover:border-border/50",
  );

  // For layout containers
  if (isContainer) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        data-id={id}
        onClick={handleSelect}
        className={wrapperClasses}
      >
        {isEditMode && actionToolbar}
        {renderLayoutContent()}
      </div>
    );
  }

  // For data fields
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-id={id}
      onClick={handleSelect}
      className={wrapperClasses}
    >
      {isEditMode && actionToolbar}
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
    </div>
  );
}
