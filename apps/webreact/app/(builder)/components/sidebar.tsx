
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
import { Badge } from "@/components/ui/badge";

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
                    disabled={item.disabled}
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

  const content = (
    <SidebarMenuButton
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab group relative",
        disabled && "cursor-not-allowed opacity-50",
      )}
      disabled={disabled}
    >
      <HugeiconsIcon icon={icon} />
      <span>{label}</span>
      {disabled && (
        <Badge
          variant="outline"
          className="ml-auto text-[10px] h-5 px-1.5 py-0 bg-transparent text-muted-foreground border-muted-foreground/40"
        >
          Coming Soon
        </Badge>
      )}
    </SidebarMenuButton>
  );

  return <SidebarMenuItem>{content}</SidebarMenuItem>;
}
