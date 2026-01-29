"use client";

import { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormContent, FormFields } from "@/components/buzzform/form";
import { createSchema, type Field } from "@buildnbuzz/buzzform";
import type { Node } from "../../lib/types";
import { useBuilderStore } from "../../lib/store";
import { FormWatcher } from "./form-watcher";
import { flattenFieldToFormValues } from "../../lib/properties";

interface PropertiesFormProps {
  config: Field[];
  node: Node;
}

export function PropertiesForm({ config, node }: PropertiesFormProps) {
  const updateNode = useBuilderStore((state) => state.updateNode);

  const handleUpdate = (updates: Partial<Field>) => {
    updateNode(node.id, updates);
  };

  const defaultValues = flattenFieldToFormValues(node.field);
  const schema = createSchema(config);

  // Debounce updates
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedUpdate = (updates: Record<string, unknown>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleUpdate(updates);
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 h-full">
        <div className="px-4 py-2">
          <Form
            key={node.id} // Re-mount form when selection changes
            schema={schema}
            defaultValues={defaultValues}
            showSubmit={false}
            mode="onChange"
          >
            <FormWatcher onUpdate={debouncedUpdate} />
            <FormContent>
              <FormFields />
            </FormContent>
          </Form>
        </div>
      </ScrollArea>
    </div>
  );
}
