"use client";

import { useDraggable } from "@dnd-kit/core";
import type { FieldType } from "../lib/types";
import { getSidebarGroups } from "../lib/registry";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

const CATEGORY_LABELS: Record<string, string> = {
  inputs: "Inputs",
  selection: "Selection",
  layout: "Layout",
};

export function Sidebar() {
  const groups = getSidebarGroups();

  return (
    <ShadcnSidebar className="pt-header">
      <SidebarContent>
        {Object.entries(groups).map(([category, items]) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel>
              {CATEGORY_LABELS[category] ?? category}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <DraggableSidebarItem
                    key={item.type}
                    type={item.type as FieldType}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </ShadcnSidebar>
  );
}

function DraggableSidebarItem({
  type,
  label,
  icon,
}: {
  type: FieldType;
  label: string;
  icon: IconSvgElement;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `sidebar-${type}`,
    data: { from: "sidebar", type },
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="cursor-grab"
      >
        <HugeiconsIcon icon={icon} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
