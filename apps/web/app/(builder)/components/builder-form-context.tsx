"use client";

import * as React from "react";
import { createContext, useContext } from "react";
import {
  createSchema,
  useForm,
  type FormAdapter,
  type Field,
} from "@buildnbuzz/buzzform";
import { useBuilderStore } from "../lib/store";
import { nodesToFields } from "../lib/schema-builder";

export type BuilderMode = "edit" | "preview";

interface BuilderFormContextValue {
  mode: BuilderMode;
  form: FormAdapter<Record<string, unknown>>;
  fields: readonly Field[];
}

const BuilderFormContext = createContext<BuilderFormContextValue | null>(null);

export function useBuilderFormContext() {
  const ctx = useContext(BuilderFormContext);
  if (!ctx) {
    throw new Error(
      "useBuilderFormContext must be used within <BuilderFormProvider>",
    );
  }
  return ctx;
}

interface BuilderFormProviderProps {
  children: React.ReactNode;
  mode?: BuilderMode;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

// Inner component that uses the form hook - remounts when schemaKey changes
function FormProviderInner({
  children,
  mode,
  fields,
  onSubmit,
}: {
  children: React.ReactNode;
  mode: BuilderMode;
  fields: Field[];
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}) {
  // Create schema from fields
  const schema = createSchema(fields);

  // Create real form instance
  const form = useForm({
    schema,
    onSubmit: onSubmit ?? (() => {}),
    mode: "onChange",
  }) as unknown as FormAdapter<Record<string, unknown>>;

  const contextValue: BuilderFormContextValue = {
    mode,
    form,
    fields,
  };

  return (
    <BuilderFormContext.Provider value={contextValue}>
      {children}
    </BuilderFormContext.Provider>
  );
}

export function BuilderFormProvider({
  children,
  mode = "edit",
  onSubmit,
}: BuilderFormProviderProps) {
  const nodes = useBuilderStore((s) => s.nodes);
  const rootIds = useBuilderStore((s) => s.rootIds);

  // Convert nodes to BuzzForm Field[]
  const fields = nodesToFields(nodes, rootIds);

  // Generate a stable key based on field structure to force remount when schema changes
  const fieldNames = fields
    .map((f) => ("name" in f ? f.name : f.type))
    .join(",");
  const schemaKey = `form-${fields.length}-${fieldNames}`;

  // Use key to force remount when schema changes - this prevents hook count mismatch
  return (
    <FormProviderInner
      key={schemaKey}
      mode={mode}
      fields={fields}
      onSubmit={onSubmit}
    >
      {children}
    </FormProviderInner>
  );
}
