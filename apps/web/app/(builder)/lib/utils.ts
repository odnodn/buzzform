import type { Node, FieldType } from "./types";
import { isContainerType } from "./types";

export function getDropLocation(
    nodes: Record<string, Node>,
    rootIds: string[],
    overId: string,
    position: "before" | "after" | "inside"
) {
    if (overId === "root") {
        return {
            parentId: null,
            index: rootIds.length,
        };
    }

    const overNode = nodes[overId];
    if (!overNode) return null;

    if (position === "inside" && isContainerType(overNode.field.type)) {
        return {
            parentId: overId,
            index: overNode.children.length,
        };
    }

    const parentId = overNode.parentId;
    const siblings =
        parentId === null ? rootIds : nodes[parentId].children;

    const overIndex = siblings.indexOf(overId);

    return {
        parentId,
        index: position === "before" ? overIndex : overIndex + 1,
    };
}

export function canDrop(
    parentType: FieldType | null,
    childType: FieldType | undefined
) {
    if (!childType) return false;

    if (parentType === null) return true;

    if (parentType === "row") {
        return !isContainerType(childType);
    }

    if (parentType === "group" || parentType === "collapsible") {
        return true;
    }

    return false;
}

export function isDescendant(
    nodes: Record<string, Node>,
    parentId: string,
    childId: string
): boolean {
    const parent = nodes[parentId];
    if (!parent) return false;

    if (parent.children.includes(childId)) return true;

    return parent.children.some(id =>
        isDescendant(nodes, id, childId)
    );
}

export function isInsideContainerPadding(
    containerEl: HTMLElement,
    pointerY: number
) {
    const rect = containerEl.getBoundingClientRect();

    return pointerY >= rect.top && pointerY <= rect.bottom;
}
