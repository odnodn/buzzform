"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "@/components/buzzform/form";
import { unflattenFormValues } from "../../lib/properties";

interface FormWatcherProps {
  onUpdate: (updates: Record<string, unknown>) => void;
}

/** Watches form values and calls onUpdate when they change. */
export function FormWatcher({ onUpdate }: FormWatcherProps) {
  const { form } = useFormContext();
  const lastValuesRef = useRef<string>("");

  // Watch all values
  const currentValues = form.watch() as Record<string, unknown>;
  const currentValuesJson = JSON.stringify(currentValues);

  useEffect(() => {
    // Only trigger if values actually changed
    if (currentValuesJson !== lastValuesRef.current) {
      // Check if this is the first render (mount) to avoid initial update loop
      const isFirstRun = lastValuesRef.current === "";
      lastValuesRef.current = currentValuesJson;

      if (!isFirstRun) {
        // Ensure nested structure for store updates (redundant if watch() is already nested)
        const updates = unflattenFormValues(currentValues);
        onUpdate(updates);
      }
    }
  }, [currentValuesJson, currentValues, onUpdate]);

  return null;
}
