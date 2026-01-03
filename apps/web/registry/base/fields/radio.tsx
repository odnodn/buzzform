"use client";

import type {
  RadioField as RadioFieldType,
  SelectOption,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface RadioFieldProps {
  field: RadioFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

/** Helper to extract value from option */
function getOptionValue(option: SelectOption | string): string {
  if (typeof option === "string") return option;
  const val = option.value;
  return typeof val === "string" ? val : String(val);
}

/** Helper to extract label from option */
function getOptionLabel(option: SelectOption | string): React.ReactNode {
  if (typeof option === "string") return option;
  return option.label ?? String(option.value);
}

/** Helper to extract description from option */
function getOptionDescription(option: SelectOption | string): React.ReactNode {
  if (typeof option === "string") return null;
  return option.description;
}

/** Helper to extract icon from option */
function getOptionIcon(option: SelectOption | string): React.ReactNode {
  if (typeof option === "string") return null;
  return option.icon;
}

/** Helper to check if option is disabled */
function isOptionDisabled(option: SelectOption | string): boolean {
  if (typeof option === "string") return false;
  return option.disabled === true;
}

/** Card size classes */
const cardSizeClasses = {
  sm: "p-2.5 sm:p-3",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5",
} as const;

export function RadioField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: RadioFieldProps) {
  const value = form.watch<string>(path) ?? "";

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

  const label = field.label !== false ? (field.label ?? field.name) : null;
  const fieldId = field.id ?? generateFieldId(path);

  // UI options with defaults
  const variant = field.ui?.variant ?? "default";
  const direction = field.ui?.direction ?? "vertical";
  const columns = field.ui?.columns ?? 1;
  const cardSize = field.ui?.card?.size ?? "md";
  const cardBordered = field.ui?.card?.bordered ?? true;

  const isCardVariant = variant === "card";

  // Get options (only static for now, async would need useEffect)
  const options = Array.isArray(field.options) ? field.options : [];

  const handleChange = (val: unknown) => {
    if (typeof val === "string") {
      form.setValue(path, val, {
        shouldDirty: true,
      });
    }
  };

  // Grid classes based on variant and columns
  const gridClasses = cn(
    "grid gap-2",
    // For default variant with horizontal direction
    !isCardVariant && direction === "horizontal" && columns === 1
      ? "grid-flow-col auto-cols-fr"
      : undefined,
    // Column classes
    columns === 2 && "sm:grid-cols-2",
    columns === 3 && "sm:grid-cols-2 md:grid-cols-3",
    columns === 4 && "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  );

  return (
    <div
      className={cn("flex flex-col gap-2", field.style?.className)}
      data-invalid={hasError}
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
      {/* Label */}
      {label && (
        <FieldLabel htmlFor={`${fieldId}-0`}>
          {field.required && <span className="text-destructive">*</span>}
          {label}
        </FieldLabel>
      )}

      {/* Description */}
      {field.description && (
        <FieldDescription className="-mt-1 mb-1" id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {/* Radio Group */}
      <RadioGroup
        value={value}
        onValueChange={(val) => handleChange(val)}
        disabled={isDisabled}
        className={gridClasses}
        aria-describedby={
          field.description ? `${fieldId}-description` : undefined
        }
      >
        {options.map((opt, i) => {
          const val = getOptionValue(opt);
          const optLabel = getOptionLabel(opt);
          const optDesc = getOptionDescription(opt);
          const optIcon = getOptionIcon(opt);
          const optDisabled = isOptionDisabled(opt) || isDisabled;
          const isSelected = value === val;
          const id = `${fieldId}-${i}`;

          // Card variant
          if (isCardVariant) {
            const showDescription = optDesc && cardSize !== "sm";

            return (
              <label
                key={val}
                htmlFor={id}
                className={cn(
                  // Base styles
                  "cursor-pointer transition-all duration-150 rounded-lg",
                  "flex items-start gap-3",
                  cardSizeClasses[cardSize],
                  // Border styles
                  cardBordered && "border",
                  cardBordered &&
                    isSelected &&
                    "border-primary ring-1 ring-primary/20 bg-primary/5 dark:bg-primary/10",
                  cardBordered &&
                    !isSelected &&
                    "border-border hover:border-foreground/20 hover:bg-accent/30",
                  // Non-bordered styles
                  !cardBordered && "hover:bg-accent/50",
                  !cardBordered && isSelected && "bg-accent",
                  // Disabled styles
                  optDisabled &&
                    "opacity-50 cursor-not-allowed pointer-events-none"
                )}
                data-checked={isSelected}
                data-disabled={optDisabled}
              >
                <RadioGroupItem
                  value={val}
                  id={id}
                  disabled={optDisabled}
                  className="shrink-0 mt-0.5"
                  autoFocus={autoFocus && i === 0}
                />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {optIcon && (
                      <span className="shrink-0 text-muted-foreground">
                        {optIcon}
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-medium",
                        cardSize === "lg" ? "text-base" : "text-sm"
                      )}
                    >
                      {optLabel}
                    </span>
                  </div>
                  {showDescription && (
                    <span
                      className={cn(
                        "text-muted-foreground line-clamp-2",
                        cardSize === "lg" ? "text-sm" : "text-xs"
                      )}
                    >
                      {optDesc}
                    </span>
                  )}
                </div>
              </label>
            );
          }

          // Default variant
          return (
            <Field
              key={val}
              orientation="horizontal"
              className={cn(
                "items-center gap-2.5 space-y-0",
                optDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <RadioGroupItem
                value={val}
                id={id}
                disabled={optDisabled}
                autoFocus={autoFocus && i === 0}
              />
              <FieldLabel
                htmlFor={id}
                className={cn(
                  "font-normal cursor-pointer m-0 flex items-center gap-2 text-sm",
                  optDisabled && "cursor-not-allowed"
                )}
              >
                {optIcon && (
                  <span className="shrink-0 text-muted-foreground">
                    {optIcon}
                  </span>
                )}
                <span>{optLabel}</span>
              </FieldLabel>
            </Field>
          );
        })}
      </RadioGroup>

      {/* Error */}
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </div>
  );
}

export function RadioFieldSkeleton({ field }: { field: RadioFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const variant = field.ui?.variant ?? "default";
  const columns = field.ui?.columns ?? 1;
  const cardSize = field.ui?.card?.size ?? "md";
  const cardBordered = field.ui?.card?.bordered ?? true;

  const isCardVariant = variant === "card";
  const optionCount = Math.min(
    Array.isArray(field.options) ? field.options.length : 3,
    6
  );

  // Grid classes
  const gridClasses = cn(
    "grid gap-2",
    columns === 2 && "sm:grid-cols-2",
    columns === 3 && "sm:grid-cols-2 md:grid-cols-3",
    columns === 4 && "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  );

  // Card height based on size
  const cardHeights = {
    sm: "h-12",
    md: "h-16",
    lg: "h-20",
  };

  return (
    <div
      className={cn("flex flex-col gap-2", field.style?.className)}
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
      {/* Label skeleton */}
      {label && <div className="h-4 w-28 animate-pulse rounded bg-muted" />}

      {/* Description skeleton */}
      {field.description && (
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      )}

      {/* Options skeleton */}
      <div className={gridClasses}>
        {Array.from({ length: optionCount }).map((_, i) => {
          if (isCardVariant) {
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-lg",
                  cardHeights[cardSize],
                  cardBordered && "border border-border p-3",
                  !cardBordered && "bg-muted/30 p-3"
                )}
              >
                <div className="h-4 w-4 rounded-full animate-pulse bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  {cardSize !== "sm" && (
                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  )}
                </div>
              </div>
            );
          }

          // Default variant skeleton
          return (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-4 w-4 rounded-full animate-pulse bg-muted shrink-0" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
