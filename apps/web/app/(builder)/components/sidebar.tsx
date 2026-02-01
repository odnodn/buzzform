"use client";

import { useDraggable } from "@dnd-kit/core";
import type { FieldType } from "../lib/types";
import { getSidebarGroups } from "../lib/registry";
import { useBuilderStore } from "../lib/store";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  inputs: "Inputs",
  selection: "Selection",
  layout: "Layout",
};

export function Sidebar() {
  const groups = getSidebarGroups();
  const mode = useBuilderStore((s) => s.mode);
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(mode !== "preview");
  }, [mode, setOpen]);

  return (
    <ShadcnSidebar className="pt-header" collapsible="offExamples">
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
  disabled = false,
}: {
  type: FieldType;
  label: string;
  icon: IconSvgElement;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `sidebar-${type}`,
    data: { from: "sidebar", type },
    disabled,
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={cn(
          "cursor-grab",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <HugeiconsIcon icon={icon} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
