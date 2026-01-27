"use client";

import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  CollisionDetection,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import { useBuilderStore } from "../lib/store";
import {
  canDrop,
  getDropLocation,
  isDescendant,
  isInsideContainerPadding,
} from "../lib/utils";

function customCollisionDetection(args: Parameters<CollisionDetection>[0]) {
  // First: prefer items directly under pointer
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // Fallback: intersecting rectangles
  return rectIntersection(args);
}

export function BuilderDndProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const setDropIndicator = useBuilderStore((s) => s.setDropIndicator);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragMove(event: DragMoveEvent) {
    const { over, activatorEvent, active } = event;

    const isSidebarDrag = Boolean(active.data.current?.from === "sidebar");
    if (!over) return;

    const store = useBuilderStore.getState();
    const { nodes, rootIds } = store;

    const activeId = active.id as string;

    // Sidebar items don't exist in nodes yet
    const activeType = active.data.current?.type ?? nodes[activeId]?.type;

    // -----------------------------
    // Clean ID for DropZone
    // -----------------------------
    let overId = over.id as string;
    let isDropZone = false;

    if (overId.endsWith("-dropzone")) {
      overId = overId.replace("-dropzone", "");
      isDropZone = true;
    }

    // -----------------------------
    // 1️⃣ Measure real DOM geometry
    // -----------------------------
    const overElement =
      overId === "root"
        ? document.querySelector(`[data-id="root"]`)
        : document.querySelector(`[data-id="${overId}"]`);

    if (!overElement) return;

    const rect = overElement.getBoundingClientRect();

    // Use the center of the dragged element as the pointer position for better accuracy
    // active.rect.current.translated reflects the current position on screen
    const activeRect = active.rect.current.translated;
    const pointerY = activeRect
      ? activeRect.top + activeRect.height / 2
      : (activatorEvent as MouseEvent).clientY;

    const middle = rect.top + rect.height / 2;

    let position: "before" | "after" | "inside";

    if (pointerY < middle) {
      position = "before";
    } else {
      position = "after";
    }

    // -----------------------------
    // 2️⃣ Allow INSIDE only for containers
    // -----------------------------
    if (overId === "root") {
      position = "inside";
    } else if (isDropZone) {
      // Force inside if we dropped on the inner zone
      position = "inside";
    } else {
      const overNode = nodes[overId];

      if (overNode && (overNode.type === "group" || overNode.type === "row")) {
        const paddingEl = overElement.querySelector(
          "[data-container-padding]",
        ) as HTMLElement | null;

        if (paddingEl && isInsideContainerPadding(paddingEl, pointerY)) {
          position = "inside";
        }
      }
    }

    // -----------------------------
    // 3️⃣ Translate to tree location
    // -----------------------------
    const location = getDropLocation(nodes, rootIds, overId, position);

    if (!location) {
      setDropIndicator(null);
      return;
    }

    const { parentId } = location;
    const parentType = parentId ? nodes[parentId]?.type : null;

    // -----------------------------
    // 4️⃣ Drop rules (canDrop)
    // -----------------------------
    if (!canDrop(parentType, activeType)) {
      setDropIndicator(null);
      return;
    }

    // -----------------------------
    // 5️⃣ Prevent self-nesting
    // -----------------------------
    if (
      !isSidebarDrag &&
      parentId &&
      activeId &&
      isDescendant(nodes, activeId, parentId)
    ) {
      setDropIndicator(null);
      return;
    }

    const currentIndicator = store.dropIndicator;
    if (
      currentIndicator?.parentId === location.parentId &&
      currentIndicator?.index === location.index
    ) {
      return;
    }

    // -----------------------------
    // 6️⃣ Valid drop → show indicator
    // -----------------------------
    setDropIndicator(location);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active } = event;

    const store = useBuilderStore.getState();
    const { nodes, rootIds, dropIndicator } = store;

    if (!dropIndicator) return;

    const { parentId, index } = dropIndicator;
    const activeId = active.id as string;

    const isSidebarDrag = Boolean(active.data.current?.from === "sidebar");

    // --------------------------------------------------
    // 1️⃣ NO-OP MOVE GUARD (only for existing nodes)
    // --------------------------------------------------
    if (!isSidebarDrag) {
      const node = nodes[activeId];
      if (!node) {
        store.setDropIndicator(null);
        return;
      }

      const oldParentId = node.parentId;
      const oldSiblings =
        oldParentId === null ? rootIds : nodes[oldParentId].children;

      const oldIndex = oldSiblings.indexOf(activeId);

      // If nothing actually changed, do nothing
      if (oldParentId === parentId && oldIndex === index) {
        store.setDropIndicator(null);
        return;
      }
    }

    // --------------------------------------------------
    // 2️⃣ COMMIT THE MOVE
    // --------------------------------------------------
    if (isSidebarDrag) {
      store.createNode(active?.data?.current?.type, parentId, index);
    } else {
      store.moveNode(activeId, parentId, index);
    }

    // --------------------------------------------------
    // 3️⃣ CLEANUP
    // --------------------------------------------------
    store.setDropIndicator(null);
    setActiveId(null);
  }

  return (
    <DndContext
      id="buzzform-builder-dnd"
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setDropIndicator(null);
      }}
    >
      {children}
      <DragOverlay>
        {activeId ? <DragOverlayItem id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

import { Card } from "@/components/ui/card";

function DragOverlayItem({ id }: { id: string }) {
  const store = useBuilderStore();
  const node = store.nodes[id];

  const type = node?.type ?? "field";

  return (
    <Card className="p-4 cursor-grabbing shadow-xl opacity-90 w-[300px]">
      <div className="uppercase text-xs text-muted-foreground font-semibold tracking-wider">
        {type}
      </div>
    </Card>
  );
}
