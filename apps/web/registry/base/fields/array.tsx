"use client";

import * as React from "react";
import type {
  ArrayField as ArrayFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import {
  getNestedFieldPaths,
  countNestedErrors,
  resolveFieldState,
  getArrayRowLabel,
} from "@buildnbuzz/buzzform";
import { cn } from "@/lib/utils";
import { FieldRenderer, type FieldRegistry } from "./render";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// =============================================================================
// TYPES
// =============================================================================

export interface ArrayFieldComponentProps {
  field: ArrayFieldType;
  path: string;
  form: FormAdapter;
  registry?: FieldRegistry;
}

interface ArrayRowItem {
  id: string;
  [key: string]: unknown;
}

interface ArrayRowProps {
  id: string;
  index: number;
  field: ArrayFieldType;
  path: string;
  form: FormAdapter;
  registry?: FieldRegistry;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  isOpen: boolean;
  onToggle: (index: number) => void;
  canRemove: boolean;
  isSortable: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isNew?: boolean; // For animation on new rows
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to count errors in nested fields for a row.
 * Memoizes the expensive path calculation.
 */
const useNestedErrors = (
  form: FormAdapter,
  fields: ArrayFieldType["fields"],
  basePath: string
): number => {
  const errors = form.formState.errors;
  const nestedPaths = React.useMemo(
    () => getNestedFieldPaths(fields, basePath),
    [fields, basePath]
  );
  return nestedPaths.filter((p) => errors[p]).length;
};

/**
 * Hook to count total errors across all array rows.
 */
const useArrayErrors = (
  form: FormAdapter,
  fields: ArrayFieldType["fields"],
  path: string,
  rowCount: number
): number => {
  const errors = form.formState.errors;
  let totalErrors = 0;
  for (let i = 0; i < rowCount; i++) {
    const rowPath = `${path}.${i}`;
    totalErrors += countNestedErrors(errors, fields, rowPath);
  }
  return totalErrors;
};

// ARRAY ROW (Memoized)
// =============================================================================

const ArrayRow = React.memo(
  ({
    id,
    index,
    field,
    path,
    form,
    registry,
    onRemove,
    onDuplicate,
    isOpen,
    onToggle,
    canRemove,
    isSortable,
    isDisabled,
    isReadOnly,
    isNew = false,
  }: ArrayRowProps) => {
    const rowRef = React.useRef<HTMLDivElement>(null);
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id, disabled: !isSortable || isDisabled || isReadOnly });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const rowPath = `${path}.${index}`;
    const rowData = form.watch<Record<string, unknown>>(rowPath);

    // Use shared utility for row label
    const rowLabel = getArrayRowLabel(
      rowData,
      field.fields,
      field.ui as { rowLabelField?: string } | undefined,
      `Item ${index + 1}`
    );

    const errorCount = useNestedErrors(form, field.fields, rowPath);

    const handleRemoveClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canRemove && !isDisabled && !isReadOnly) {
          onRemove(index);
        }
      },
      [canRemove, isDisabled, isReadOnly, onRemove, index]
    );

    const handleDuplicateClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDisabled && !isReadOnly) {
          onDuplicate(index);
        }
      },
      [isDisabled, isReadOnly, onDuplicate, index]
    );

    const handleToggleClick = React.useCallback(() => {
      onToggle(index);
    }, [onToggle, index]);

    // Focus first focusable element when row is new and open
    React.useEffect(() => {
      if (isNew && isOpen && rowRef.current) {
        // Delay to allow content to render
        const timer = setTimeout(() => {
          const firstInput = rowRef.current?.querySelector<HTMLElement>(
            'input:not([type="hidden"]), textarea, select, [contenteditable="true"], button[data-focusable]'
          );
          firstInput?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isNew, isOpen]);

    return (
      <Collapsible open={isOpen} onOpenChange={handleToggleClick}>
        <div
          ref={(node) => {
            setNodeRef(node);
            (rowRef as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }}
          role="listitem"
          aria-label={`${rowLabel}, item ${index + 1}`}
          style={style}
          className={cn(
            "bg-card border rounded-lg overflow-hidden transition-all duration-200",
            isDragging && "shadow-lg ring-2 ring-primary/20",
            isDisabled && "opacity-60 pointer-events-none",
            isNew && "animate-in fade-in-0 slide-in-from-top-2 duration-300"
          )}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center gap-3 px-4 py-2 bg-muted/50 transition-colors shrink-0",
              !isDisabled && "hover:bg-muted/75",
              isOpen && "border-b"
            )}
          >
            {isSortable && !isDisabled && !isReadOnly && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="Drag to reorder"
              >
                <IconPlaceholder
                  lucide="GripVertical"
                  hugeicons="DragDropIcon"
                  tabler="IconGripVertical"
                  phosphor="DotsSixVertical"
                  className="size-4"
                />
              </div>
            )}

            <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left min-w-0 font-medium text-sm text-muted-foreground cursor-pointer">
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                  !isOpen && "-rotate-90"
                )}
              />
              <span className="truncate">{rowLabel}</span>
              {errorCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 px-1.5 text-xs ml-1"
                >
                  {errorCount}
                </Badge>
              )}
            </CollapsibleTrigger>

            {!isReadOnly && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleDuplicateClick}
                  disabled={isDisabled}
                  title="Duplicate item"
                  aria-label="Duplicate item"
                >
                  <IconPlaceholder
                    lucide="Copy"
                    hugeicons="Copy01Icon"
                    tabler="IconCopy"
                    phosphor="Copy"
                    className="size-3.5"
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 text-destructive hover:bg-destructive/10",
                    (!canRemove || isDisabled) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!canRemove || isDisabled}
                  onClick={handleRemoveClick}
                  title={
                    canRemove
                      ? "Delete item"
                      : `Minimum ${field.minRows} ${field.minRows === 1 ? "item" : "items"} required`
                  }
                  aria-label={
                    canRemove
                      ? "Delete item"
                      : `Minimum ${field.minRows} items required`
                  }
                >
                  <IconPlaceholder
                    lucide="Trash2"
                    hugeicons="Delete02Icon"
                    tabler="IconTrash"
                    phosphor="Trash"
                    className="size-3.5"
                  />
                </Button>
              </div>
            )}
          </CardHeader>

          <CollapsibleContent>
            <div className="p-4 space-y-4">
              {field.fields.map((f, i) => {
                const nestedPath =
                  "name" in f ? `${rowPath}.${f.name}` : rowPath;
                return (
                  <FieldRenderer
                    key={i}
                    field={f}
                    path={nestedPath}
                    form={form}
                    registry={registry}
                  />
                );
              })}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.index === nextProps.index &&
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.canRemove === nextProps.canRemove &&
      prevProps.isSortable === nextProps.isSortable &&
      prevProps.isDisabled === nextProps.isDisabled &&
      prevProps.isReadOnly === nextProps.isReadOnly &&
      prevProps.path === nextProps.path &&
      prevProps.isNew === nextProps.isNew
    );
  }
);

ArrayRow.displayName = "ArrayRow";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ArrayField = React.forwardRef<
  HTMLDivElement,
  ArrayFieldComponentProps
>(({ field, path, form, registry }: ArrayFieldComponentProps, ref) => {
  const dndContextId = React.useId();

  // UI options with type-safe defaults
  const ui = field.ui;
  const isSortable = ui?.isSortable !== false;
  const addLabel = ui?.addLabel ?? "Add Item";
  const showErrorBadge = ui?.showErrorBadge !== false;
  const emptyMessage = ui?.emptyMessage ?? "No items added yet";

  // Get form data for conditional disabled/readOnly
  const formData = form.watch() as Record<string, unknown>;

  // Resolve disabled and readOnly states using shared utility
  const isDisabled = resolveFieldState(field.disabled, formData);
  const isReadOnly = resolveFieldState(field.readOnly, formData);

  // Initialize collapsed states from UI options
  const [isArrayCollapsed, setIsArrayCollapsed] = React.useState(
    ui?.collapsed ?? false
  );
  const [collapsedRowsMap, setCollapsedRowsMap] = React.useState<
    Record<string, boolean>
  >({});
  const [showDeleteAllDialog, setShowDeleteAllDialog] = React.useState(false);

  // Track newly added rows for animation
  const [newRowIds, setNewRowIds] = React.useState<Set<string>>(new Set());

  // Screen reader announcement
  const [announcement, setAnnouncement] = React.useState<string>("");

  // Use form.array.fields() for stable items with IDs
  const rows = form.array.fields<ArrayRowItem>(path);

  // Initialize row collapsed state when rows change (for ui.rowsCollapsed)
  React.useEffect(() => {
    if (ui?.rowsCollapsed && rows.length > 0) {
      const newMap: Record<string, boolean> = {};
      for (const row of rows) {
        // Only collapse new rows, preserve existing state
        if (collapsedRowsMap[row.id] === undefined) {
          newMap[row.id] = true;
        }
      }
      if (Object.keys(newMap).length > 0) {
        setCollapsedRowsMap((prev) => ({ ...prev, ...newMap }));
      }
    }
  }, [rows, ui?.rowsCollapsed, collapsedRowsMap]);

  // Clear "new" status after animation completes
  React.useEffect(() => {
    if (newRowIds.size > 0) {
      const timer = setTimeout(() => {
        setNewRowIds(new Set());
      }, 500); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [newRowIds]);

  // Calculate total errors across all rows for header badge
  const totalErrorCount = useArrayErrors(form, field.fields, path, rows.length);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = rows.findIndex((r) => r.id === active.id);
        const newIndex = rows.findIndex((r) => r.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          form.array.move(path, oldIndex, newIndex);
        }
      }
    },
    [rows, form, path]
  );

  const handleAdd = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isDisabled && !isReadOnly) {
        form.array.append(path, {});
        // Track new row for animation (get the ID after append)
        setTimeout(() => {
          const updatedRows = form.array.fields<ArrayRowItem>(path);
          const lastRow = updatedRows[updatedRows.length - 1];
          if (lastRow) {
            setNewRowIds((prev) => new Set([...prev, lastRow.id]));
          }
        }, 0);
        setAnnouncement(`Item ${rows.length + 1} added`);
      }
    },
    [form, path, isDisabled, isReadOnly, rows.length]
  );

  const handleRemove = React.useCallback(
    (index: number) => {
      const removedLabel = rows[index] ? `Item ${index + 1}` : "Item";
      form.array.remove(path, index);
      setAnnouncement(`${removedLabel} removed`);
    },
    [form, path, rows]
  );

  const handleDuplicate = React.useCallback(
    (index: number) => {
      const currentValue = rows[index];
      if (currentValue) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = currentValue;
        form.array.insert(path, index + 1, rest);
        // Track new duplicated row for animation
        setTimeout(() => {
          const updatedRows = form.array.fields<ArrayRowItem>(path);
          const newRow = updatedRows[index + 1];
          if (newRow) {
            setNewRowIds((prev) => new Set([...prev, newRow.id]));
          }
        }, 0);
        setAnnouncement(`Item ${index + 1} duplicated`);
      }
    },
    [form, path, rows]
  );

  const handleRemoveAllClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Check if confirmation is required (default: true for safety)
      if (ui?.confirmDelete !== false) {
        setShowDeleteAllDialog(true);
      } else {
        form.array.replace(path, []);
      }
    },
    [ui?.confirmDelete, form, path]
  );

  const handleConfirmRemoveAll = React.useCallback(() => {
    form.array.replace(path, []);
    setShowDeleteAllDialog(false);
  }, [form, path]);

  const handleToggleRow = React.useCallback(
    (index: number) => {
      const rowId = rows[index]?.id;
      if (rowId) {
        setCollapsedRowsMap((prev) => ({
          ...prev,
          [rowId]: !prev[rowId],
        }));
      }
    },
    [rows]
  );

  const handleToggleAllRows = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const allOpen = rows.every((row) => !collapsedRowsMap[row.id]);
      const newMap: Record<string, boolean> = {};
      for (const row of rows) {
        newMap[row.id] = allOpen;
      }
      setCollapsedRowsMap(newMap);
    },
    [rows, collapsedRowsMap]
  );

  const allRowsCollapsed =
    rows.length > 0 && rows.every((row) => collapsedRowsMap[row.id]);
  const canAddMore = !field.maxRows || rows.length < field.maxRows;
  const label = field.label !== false ? field.label || field.name : null;

  const bodyContent = (
    <CardContent className="pt-4 px-4 pb-4">
      {rows.length > 0 ? (
        <DndContext
          id={dndContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className="space-y-3"
              role="list"
              aria-label={`${label} items`}
            >
              {rows.map((row, index) => (
                <ArrayRow
                  key={row.id}
                  id={row.id}
                  index={index}
                  field={field}
                  path={path}
                  form={form}
                  registry={registry}
                  onRemove={handleRemove}
                  onDuplicate={handleDuplicate}
                  isOpen={!collapsedRowsMap[row.id]}
                  onToggle={handleToggleRow}
                  canRemove={!field.minRows || rows.length > field.minRows}
                  isSortable={isSortable}
                  isDisabled={isDisabled}
                  isReadOnly={isReadOnly}
                  isNew={newRowIds.has(row.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg text-center">
          <IconPlaceholder
            lucide="ListPlus"
            hugeicons="InsertRowDownIcon"
            tabler="IconRowInsertBottom"
            phosphor="ListPlus"
            className="size-10 text-muted-foreground/50 mb-3"
          />
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {emptyMessage}
          </p>
          <p className="text-xs text-muted-foreground/75 mb-4">
            Click the button below to add your first item
          </p>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAdd}
              disabled={!canAddMore || isDisabled}
            >
              <IconPlaceholder
                lucide="Plus"
                hugeicons="Add01Icon"
                tabler="IconPlus"
                phosphor="Plus"
                className="size-4 mr-1.5"
              />
              {addLabel}
            </Button>
          )}
        </div>
      )}

      {typeof field.minRows === "number" &&
        field.minRows > 0 &&
        rows.length < field.minRows && (
          <div className="mt-3 text-xs text-destructive flex items-center gap-1.5 px-1 font-medium">
            <IconPlaceholder
              lucide="AlertCircle"
              hugeicons="SecurityBlockIcon"
              tabler="IconAlertCircle"
              phosphor="Warning"
              className="size-3.5"
            />
            Minimum {field.minRows} {field.minRows === 1 ? "item" : "items"}{" "}
            required
          </div>
        )}
    </CardContent>
  );

  return (
    <>
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <IconPlaceholder
                lucide="Trash2"
                hugeicons="Delete02Icon"
                tabler="IconTrash"
                phosphor="Trash"
                className="size-5"
              />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete all items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all {rows.length}{" "}
              {rows.length === 1 ? "item" : "items"} from this list. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmRemoveAll}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Collapsible
        open={!isArrayCollapsed}
        onOpenChange={(open) => setIsArrayCollapsed(!open)}
      >
        <Card
          ref={ref}
          className={cn(
            "py-0 gap-0",
            field.style?.className,
            isDisabled && "opacity-60"
          )}
          style={field.style?.width ? { width: field.style.width } : undefined}
        >
          <CardHeader
            className={cn(
              "flex flex-row items-center justify-between bg-muted/50 transition-colors py-3 px-4",
              !isArrayCollapsed && "border-b"
            )}
          >
            <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                  isArrayCollapsed && "-rotate-90"
                )}
              />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">{label}</span>
                  {field.required && (
                    <span className="text-destructive">*</span>
                  )}
                  {rows.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {rows.length} {rows.length === 1 ? "item" : "items"}
                    </Badge>
                  )}
                  {showErrorBadge && totalErrorCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                      {totalErrorCount}{" "}
                      {totalErrorCount === 1 ? "error" : "errors"}
                    </Badge>
                  )}
                </div>
                {field.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {field.description}
                  </p>
                )}
              </div>
            </CollapsibleTrigger>
            {!isReadOnly && (
              <div className="flex items-center gap-1">
                {rows.length > 0 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={handleToggleAllRows}
                      disabled={isDisabled}
                      title={
                        allRowsCollapsed
                          ? "Expand all items"
                          : "Collapse all items"
                      }
                      aria-label={
                        allRowsCollapsed
                          ? "Expand all items"
                          : "Collapse all items"
                      }
                    >
                      <IconPlaceholder
                        lucide={
                          allRowsCollapsed ? "ChevronsDownUp" : "ChevronsUpDown"
                        }
                        hugeicons={
                          allRowsCollapsed
                            ? "ArrowExpand02Icon"
                            : "ArrowShrink02Icon"
                        }
                        tabler={
                          allRowsCollapsed
                            ? "IconChevronsDown"
                            : "IconChevronsUp"
                        }
                        phosphor={
                          allRowsCollapsed
                            ? "ArrowsInSimple"
                            : "ArrowsOutSimple"
                        }
                        className="size-4"
                      />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={handleRemoveAllClick}
                      disabled={isDisabled}
                      title="Delete all items"
                      aria-label="Delete all items"
                    >
                      <IconPlaceholder
                        lucide="Trash"
                        hugeicons="DeletePutBackIcon"
                        tabler="IconTrash"
                        phosphor="TrashSimple"
                        className="size-4"
                      />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!canAddMore || isDisabled}
                  onClick={handleAdd}
                  title={
                    canAddMore
                      ? "Add item"
                      : `Maximum ${field.maxRows} items reached`
                  }
                  aria-label={
                    canAddMore
                      ? "Add item"
                      : `Maximum ${field.maxRows} items reached`
                  }
                >
                  <IconPlaceholder
                    lucide="Plus"
                    hugeicons="Add01Icon"
                    tabler="IconPlus"
                    phosphor="Plus"
                    className="size-4"
                  />
                </Button>
              </div>
            )}
          </CardHeader>
          <CollapsibleContent>{bodyContent}</CollapsibleContent>
        </Card>
      </Collapsible>
    </>
  );
});

ArrayField.displayName = "ArrayField";

// =============================================================================
// SKELETON
// =============================================================================

export const ArrayFieldSkeleton = React.forwardRef<
  HTMLDivElement,
  { field: ArrayFieldType }
>(({ field }: { field: ArrayFieldType }, ref) => {
  const label = field.label !== false ? field.label || field.name : null;

  return (
    <Card ref={ref} className={cn("py-0", field.style?.className)}>
      <CardHeader className="flex flex-row justify-between items-center py-3 px-4 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          {label && <Skeleton className="h-4 w-24" />}
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border rounded-lg overflow-hidden animate-pulse"
          >
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

ArrayFieldSkeleton.displayName = "ArrayFieldSkeleton";
