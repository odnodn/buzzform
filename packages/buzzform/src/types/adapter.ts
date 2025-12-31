import type { FormEvent } from 'react';

// =============================================================================
// FORM STATE
// =============================================================================

/**
 * Represents the current reactive state of a form.
 * Adapters must ensure this triggers re-renders when values change.
 */
export interface FormState {
    /** True while the form is being submitted */
    isSubmitting: boolean;

    /** True while validation is running (async validators) */
    isValidating: boolean;

    /** True if any field has been modified from its default value */
    isDirty: boolean;

    /** True if all validations pass (no errors) */
    isValid: boolean;

    /** True while async default values are being resolved */
    isLoading: boolean;

    /** 
     * Field-level errors.
     * Key is the field path (e.g., "email", "address.city", "items.0.name")
     * Value is the error message(s)
     */
    errors: Record<string, string | string[] | undefined>;

    /** Map of field paths to whether they've been modified */
    dirtyFields: Record<string, boolean>;

    /** Map of field paths to whether they've been touched (blurred) */
    touchedFields: Record<string, boolean>;

    /** Number of times the form has been submitted */
    submitCount: number;
}

// =============================================================================
// VALUE MANAGEMENT
// =============================================================================

/**
 * Options when programmatically setting a field value.
 */
export interface SetValueOptions {
    /** Run validation after setting the value (default: false) */
    shouldValidate?: boolean;

    /** Mark the field as dirty (default: true) */
    shouldDirty?: boolean;

    /** Mark the field as touched (default: false) */
    shouldTouch?: boolean;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Represents a field-level error.
 */
export interface FieldError {
    /** Error type (e.g., 'required', 'pattern', 'server', 'custom') */
    type?: string;

    /** Human-readable error message */
    message: string;
}

/**
 * Result from a validation resolver.
 */
export interface ResolverResult<TData> {
    /** Parsed/transformed values (if validation passes) */
    values?: TData;

    /** Field errors (if validation fails) */
    errors?: Record<string, FieldError>;
}

/**
 * A validation resolver function.
 * Adapters use this to validate form values against a schema.
 * 
 * @example
 * // Zod resolver
 * const zodResolver = (schema) => async (values) => {
 *   const result = schema.safeParse(values);
 *   if (result.success) return { values: result.data };
 *   return { errors: mapZodErrors(result.error) };
 * };
 */
export type Resolver<TData> = (
    values: TData
) => Promise<ResolverResult<TData>> | ResolverResult<TData>;

// =============================================================================
// ARRAY HELPERS
// =============================================================================

/**
 * Helper methods for manipulating array fields.
 * All methods operate on a field path (e.g., "items", "users.0.tags").
 */
export interface ArrayHelpers {
    /**
     * Get array items with stable IDs for React keys.
     * @param path - Field path to the array
     * @returns Array of items, each with an `id` property
     */
    fields: <T = unknown>(path: string) => Array<T & { id: string }>;

    /**
     * Add an item to the end of the array.
     */
    append: (path: string, value: unknown) => void;

    /**
     * Add an item to the beginning of the array.
     */
    prepend: (path: string, value: unknown) => void;

    /**
     * Insert an item at a specific index.
     */
    insert: (path: string, index: number, value: unknown) => void;

    /**
     * Remove an item at a specific index.
     */
    remove: (path: string, index: number) => void;

    /**
     * Move an item from one index to another.
     */
    move: (path: string, from: number, to: number) => void;

    /**
     * Swap two items by their indices.
     */
    swap: (path: string, indexA: number, indexB: number) => void;

    /**
     * Replace the entire array with new values.
     */
    replace: (path: string, values: unknown[]) => void;

    /**
     * Update an item at a specific index.
     */
    update: (path: string, index: number, value: unknown) => void;
}

// =============================================================================
// ADAPTER OPTIONS
// =============================================================================

/**
 * Options passed to an adapter when creating a form instance.
 * These are the inputs an adapter needs to set up form state management.
 * 
 * @typeParam TData - The shape of form data
 */
export interface AdapterOptions<TData = Record<string, unknown>> {
    /**
     * Initial values for the form.
     * Can be:
     * - A static object
     * - A sync function returning values
     * - An async function returning values (form shows loading state)
     */
    defaultValues?: TData | (() => TData) | (() => Promise<TData>);

    /**
     * Controlled values - when provided, form becomes controlled.
     * Changes to this prop will update form values.
     */
    values?: TData;

    /**
     * Validation resolver.
     * Called to validate form values before submission and optionally on change/blur.
     */
    resolver?: Resolver<TData>;

    /**
     * When to run validation.
     * - 'onChange': Validate on every value change (default)
     * - 'onBlur': Validate when fields lose focus
     * - 'onSubmit': Validate only on submit
     * - 'all': Validate on all events
     */
    mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';

    /**
     * Callback when form is submitted (after validation passes).
     */
    onSubmit?: (values: TData) => Promise<void> | void;
}

// =============================================================================
// FORM ADAPTER INTERFACE
// =============================================================================

/**
 * The contract any form adapter must fulfill.
 * 
 * Implement this interface to integrate any form library (RHF, TanStack, Formik, custom).
 * The adapter handles form state management; UI rendering is handled separately.
 * 
 * @typeParam TData - The shape of form data
 * 
 * @example
 * // Creating a custom adapter
 * function useMyAdapter<T>(options: AdapterOptions<T>): FormAdapter<T> {
 *   // Set up your form library...
 *   return {
 *     control: myFormInstance,
 *     get formState() { return mapToFormState(myFormInstance) },
 *     handleSubmit: (e) => { ... },
 *     // ... implement all methods
 *   };
 * }
 */
export interface FormAdapter<TData = Record<string, unknown>> {
    /**
     * The underlying form library's control/instance.
     * Used by field components to connect to form state.
     * 
     * - React Hook Form: `Control<TData>`
     * - TanStack Form: `FormApi<TData>`
     * - Custom: Whatever your fields need
     */
    control: unknown;

    /**
     * Current form state.
     * MUST be implemented as a getter to ensure reactivity.
     * 
     * @example
     * get formState() {
     *   return {
     *     isSubmitting: form.formState.isSubmitting,
     *     // ...
     *   };
     * }
     */
    formState: FormState;

    /**
     * Submit handler to attach to a form element.
     * Should prevent default, run validation, and call onSubmit if valid.
     * 
     * @example
     * <form onSubmit={adapter.handleSubmit}>
     */
    handleSubmit: (e?: FormEvent) => Promise<void> | void;

    // -------------------------------------------------------------------------
    // Value Management
    // -------------------------------------------------------------------------

    /**
     * Get all current form values.
     */
    getValues: () => TData;

    /**
     * Set a single field's value.
     * 
     * @param name - Field path (e.g., "email", "address.city")
     * @param value - New value
     * @param options - Additional options
     */
    setValue: (
        name: string,
        value: unknown,
        options?: SetValueOptions
    ) => void;

    /**
     * Reset form to default values or provided values.
     * 
     * @param values - Optional new values to reset to
     */
    reset: (values?: Partial<TData>) => void;

    /**
     * Watch a field's value reactively.
     * Returns current value and causes re-render when value changes.
     * 
     * @param name - Field path to watch
     * @returns Current value of the field
     */
    watch: <T = unknown>(name: string) => T;

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    /**
     * Manually trigger validation.
     * 
     * @param name - Field(s) to validate, or undefined for entire form
     * @returns True if validation passes
     */
    validate: (name?: string | string[]) => Promise<boolean>;

    /**
     * Set a field error programmatically.
     * Useful for server-side validation errors.
     * 
     * @param name - Field path
     * @param error - Error details
     */
    setError: (name: string, error: FieldError) => void;

    /**
     * Clear validation errors.
     * 
     * @param name - Field(s) to clear, or undefined for all errors
     */
    clearErrors: (name?: string | string[]) => void;

    // -------------------------------------------------------------------------
    // Arrays
    // -------------------------------------------------------------------------

    /**
     * Helpers for manipulating array fields.
     */
    array: ArrayHelpers;
}

// =============================================================================
// ADAPTER FACTORY TYPE
// =============================================================================

/**
 * Type for an adapter factory function (hook).
 * 
 * @example
 * const useRhfAdapter: AdapterFactory = (options) => {
 *   const form = useForm(options);
 *   return { ... };
 * };
 */
export type AdapterFactory<TData = Record<string, unknown>> = (
    options: AdapterOptions<TData>
) => FormAdapter<TData>;
