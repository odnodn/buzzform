"use client";

import * as React from "react";
import { createContext, useContext } from "react";
import { createSchema, type Field } from "@buildnbuzz/buzzform";
import { Form, useFormContext } from "@/registry/base/form";
import { useBuilderStore } from "../lib/store";
import { nodesToFields } from "../lib/schema-builder";
import { extractDefaults, generateSchemaKey } from "../lib/properties";

export type BuilderMode = "edit" | "preview";

interface BuilderContextValue {
  mode: BuilderMode;
  fields: readonly Field[];
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

// Hook to access builder-specific context (mode)
export function useBuilderContext() {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error(
      "useBuilderContext must be used within <BuilderFormProvider>",
    );
  }
  return ctx;
}

// Combined hook for convenience (builder + form context)
export function useBuilderFormContext() {
  const builderCtx = useBuilderContext();
  const formCtx = useFormContext();
  return { ...builderCtx, ...formCtx };
}

// Re-export form context for components that only need form state
export { useFormContext } from "@/registry/base/form";

interface BuilderFormProviderProps {
  children: React.ReactNode;
  mode?: BuilderMode;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

export function BuilderFormProvider({
  children,
  mode = "edit",
  onSubmit,
}: BuilderFormProviderProps) {
  const nodes = useBuilderStore((s) => s.nodes);
  const rootIds = useBuilderStore((s) => s.rootIds);

  const fields = nodesToFields(nodes, rootIds);
  const schema = createSchema(fields);

  // Extract default values with deep cloning to avoid frozen object references
  const defaultValues = React.useMemo(() => extractDefaults(fields), [fields]);

  // Generate a stable key to force form remount when structural changes occur
  const schemaKey = React.useMemo(() => generateSchemaKey(fields), [fields]);

  const builderValue: BuilderContextValue = { mode, fields };

  return (
    <BuilderContext.Provider value={builderValue}>
      <Form
        key={schemaKey}
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={onSubmit ?? (() => {})}
        mode="onChange"
        showSubmit={false}
      >
        {children}
      </Form>
    </BuilderContext.Provider>
  );
}
