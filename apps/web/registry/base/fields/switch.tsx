"use client";

import type {
  SwitchField as SwitchFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

export interface SwitchFieldProps {
  field: SwitchFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

export function SwitchField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: SwitchFieldProps) {
  const value = form.watch<boolean>(path) ?? false;

  const error = form.formState.errors[path];
  const errorMessage =
    typeof error === "string"
      ? error
      : Array.isArray(error)
        ? error[0]
        : undefined;
  const hasError = !!errorMessage;

  const isDisabled =
    (typeof field.disabled === "function"
      ? field.disabled(formValues, siblingData)
      : (field.disabled ?? false)) || form.formState.isSubmitting;

  const isReadOnly =
    typeof field.readOnly === "function"
      ? field.readOnly(formValues, siblingData)
      : (field.readOnly ?? false);

  const label = field.label !== false ? (field.label ?? field.name) : null;
  const fieldId = field.id ?? generateFieldId(path);
  const alignment = field.ui?.alignment ?? "between";

  const handleChange = (checked: boolean) => {
    if (isReadOnly) return;
    form.setValue(path, checked, {
      shouldDirty: true,
    });
  };

  const switchElement = (
    <Switch
      id={fieldId}
      checked={value}
      onCheckedChange={handleChange}
      disabled={isDisabled}
      aria-invalid={hasError}
      aria-describedby={
        field.description ? `${fieldId}-description` : undefined
      }
      aria-readonly={isReadOnly}
      autoFocus={autoFocus}
    />
  );

  const contentElement = (
    <FieldContent className={alignment === "between" ? "flex-1" : undefined}>
      {label && (
        <FieldLabel
          htmlFor={fieldId}
          className="cursor-pointer m-0 font-normal flex-none gap-1 items-baseline"
        >
          {field.required && <span className="text-destructive">*</span>}
          {label}
        </FieldLabel>
      )}

      {field.description && (
        <FieldDescription id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </FieldContent>
  );

  return (
    <Field
      orientation="horizontal"
      className={`${field.style?.className ?? ""} ${
        alignment === "between" ? "w-full justify-between" : ""
      }`.trim()}
      data-invalid={hasError}
      data-disabled={isDisabled}
      style={
        field.style?.width
          ? {
              width:
                typeof field.style.width === "number"
                  ? `${field.style.width}px`
                  : field.style.width,
            }
          : undefined
      }
    >
      {alignment === "start" && (
        <>
          {switchElement}
          {contentElement}
        </>
      )}
      {(alignment === "end" || alignment === "between") && (
        <>
          {contentElement}
          {switchElement}
        </>
      )}
    </Field>
  );
}

export function SwitchFieldSkeleton({ field }: { field: SwitchFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const alignment = field.ui?.alignment ?? "between";

  const switchSkeleton = (
    <div className="h-4.5 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
  );

  const contentSkeleton = (
    <FieldContent className={alignment === "between" ? "flex-1" : undefined}>
      {label && <div className="h-4 w-24 animate-pulse rounded bg-muted" />}
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}
    </FieldContent>
  );

  return (
    <Field
      orientation="horizontal"
      className={`${field.style?.className ?? ""} ${
        alignment === "between" ? "w-full justify-between" : ""
      }`.trim()}
      style={
        field.style?.width
          ? {
              width:
                typeof field.style.width === "number"
                  ? `${field.style.width}px`
                  : field.style.width,
            }
          : undefined
      }
    >
      {alignment === "start" && (
        <>
          {switchSkeleton}
          {contentSkeleton}
        </>
      )}
      {(alignment === "end" || alignment === "between") && (
        <>
          {contentSkeleton}
          {switchSkeleton}
        </>
      )}
    </Field>
  );
}
