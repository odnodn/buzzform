"use client";

import { useDraggable } from "@dnd-kit/core";
import { NodeType } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const items: { type: NodeType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "email", label: "Email" },
  { type: "password", label: "Password" },
  { type: "group", label: "Group" },
  { type: "row", label: "Row" },
];

export function Sidebar() {
  return (
    <Card className="w-62.5 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Components</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.map((item) => (
          <SidebarItem key={item.type} {...item} />
        ))}
      </CardContent>
    </Card>
  );
}

function SidebarItem({ type, label }: { type: NodeType; label: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `sidebar-${type}`,
    data: { from: "sidebar", type },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <Button variant="outline" className="w-full justify-start cursor-grab">
        {label}
      </Button>
    </div>
  );
}
