'use client';

import { useRef, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Control, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import type {
    FormAdapter,
    AdapterOptions,
    FormState,
    FieldError,
    SetValueOptions,
} from '../types';
import { createArrayHelpers } from '../utils';

// =============================================================================
// RHF ADAPTER OPTIONS
// =============================================================================

/**
 * Options specific to the React Hook Form adapter.
 * Extends base AdapterOptions with RHF-specific features.
 */
export interface RhfAdapterOptions<TData extends FieldValues = FieldValues>
    extends AdapterOptions<TData> {
    /**
     * React Hook Form's reValidateMode.
     * When to re-validate after initial validation.
     * @default 'onChange'
     */
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';

    /**
     * Validation strategy before submit.
     * @default false (validate on first submit, then on every change)
     */
    criteriaMode?: 'firstError' | 'all';

    /**
     * Delay validation by specified ms (debounce).
     * Useful for expensive async validation.
     */
    delayError?: number;
}

// =============================================================================
// RHF ADAPTER
// =============================================================================

/**
 * React Hook Form adapter implementing the FormAdapter interface.
 * 
 * @example
 * const form = useRhf({
 *   defaultValues: { email: '', password: '' },
 *   resolver: zodResolver(schema),
 *   onSubmit: async (data) => {
 *     await loginUser(data);
 *   },
 * });
 * 
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     <input {...register('email')} />
 *     <button disabled={form.formState.isSubmitting}>Submit</button>
 *   </form>
 * );
 */
export function useRhf<TData extends FieldValues = FieldValues>(
    options: RhfAdapterOptions<TData>
): FormAdapter<TData> {
    const {
        defaultValues,
        values,
        resolver,
        mode = 'onChange',
        reValidateMode = 'onChange',
        criteriaMode,
        delayError,
        onSubmit,
    } = options;

    // -------------------------------------------------------------------------
    // Initialize React Hook Form
    // -------------------------------------------------------------------------

    const form = useForm<TData>({
        defaultValues: defaultValues as any,
        values: values,
        resolver: resolver as any,
        mode,
        reValidateMode,
        criteriaMode,
        delayError,
    });

    // -------------------------------------------------------------------------
    // Handle controlled values updates
    // -------------------------------------------------------------------------

    const prevValuesRef = useRef(values);

    useEffect(() => {
        if (values && JSON.stringify(values) !== JSON.stringify(prevValuesRef.current)) {
            // RHF handles this via the `values` prop, but we track for reference
            prevValuesRef.current = values;
        }
    }, [values]);

    // -------------------------------------------------------------------------
    // Create stable API reference for submit handler
    // -------------------------------------------------------------------------

    const apiRef = useRef<FormAdapter<TData> | null>(null);

    // -------------------------------------------------------------------------
    // Build submit handler
    // -------------------------------------------------------------------------

    const handleSubmit = form.handleSubmit(async (data) => {
        if (onSubmit) {
            await onSubmit(data as TData);
        }
    });

    // -------------------------------------------------------------------------
    // Build the adapter API
    // -------------------------------------------------------------------------

    const api: FormAdapter<TData> = {
        // The underlying RHF control for field components
        control: form.control,

        // Reactive form state via getter
        get formState(): FormState {
            const state = form.formState;
            return {
                isSubmitting: state.isSubmitting,
                isValidating: state.isValidating,
                isDirty: state.isDirty,
                isValid: state.isValid,
                isLoading: state.isLoading,
                errors: normalizeErrors(state.errors),
                dirtyFields: flattenObject(state.dirtyFields) as Record<string, boolean>,
                touchedFields: flattenObject(state.touchedFields) as Record<string, boolean>,
                submitCount: state.submitCount,
            };
        },

        handleSubmit,

        // --- Value Management ---

        getValues: () => form.getValues(),

        setValue: (name: string, value: unknown, opts?: SetValueOptions) => {
            form.setValue(name as any, value as any, {
                shouldValidate: opts?.shouldValidate,
                shouldDirty: opts?.shouldDirty ?? true,
                shouldTouch: opts?.shouldTouch,
            });
        },

        reset: (vals) => form.reset(vals as any),

        watch: <T = unknown>(name: string): T => {
            // Note: This creates a subscription. For non-reactive reads, use getValues
            return form.watch(name as any) as T;
        },

        // --- Validation ---

        validate: async (name) => {
            if (name) {
                const names = Array.isArray(name) ? name : [name];
                return form.trigger(names as any);
            }
            return form.trigger();
        },

        setError: (name: string, error: FieldError) => {
            form.setError(name as any, {
                type: error.type || 'manual',
                message: error.message,
            });
        },

        clearErrors: (name) => {
            if (name) {
                const names = Array.isArray(name) ? name : [name];
                names.forEach(n => form.clearErrors(n as any));
            } else {
                form.clearErrors();
            }
        },

        // --- Arrays ---

        array: createArrayHelpers(
            (path) => form.getValues(path as any) as unknown[],
            (path, value) => form.setValue(path as any, value as any, { shouldDirty: true })
        ),
    };

    // Store reference for potential use in submit handler
    apiRef.current = api;

    return api;
}

// =============================================================================
// HELPER: Watch hook for external use
// =============================================================================

/**
 * Hook to watch specific field values reactively.
 * Use this when you need to react to field changes outside of components.
 * 
 * @param control - The control object from useRhf
 * @param name - Field path(s) to watch
 */
export function useRhfWatch<TData, TValue = unknown>(
    control: Control<TData & Record<string, any>>,
    name: string | string[]
): TValue {
    return useWatch({ control, name: name as any }) as TValue;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Normalize RHF's nested error structure to flat string map.
 */
function normalizeErrors(
    errors: Record<string, any>
): Record<string, string | string[] | undefined> {
    const result: Record<string, string | string[] | undefined> = {};

    function traverse(obj: Record<string, any>, prefix = '') {
        for (const key in obj) {
            const path = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];

            if (value?.message) {
                // Leaf error
                result[path] = value.message;
            } else if (value?.root?.message) {
                // Array root error
                result[path] = value.root.message;
            } else if (typeof value === 'object' && value !== null) {
                // Nested object, traverse deeper
                traverse(value, path);
            }
        }
    }

    traverse(errors);
    return result;
}

/**
 * Flatten nested objects to dot-notation paths.
 */
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, boolean> {
    const result: Record<string, boolean> = {};

    for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (typeof value === 'boolean') {
            result[path] = value;
        } else if (typeof value === 'object' && value !== null) {
            Object.assign(result, flattenObject(value, path));
        }
    }

    return result;
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export type { UseFormReturn as RhfForm } from 'react-hook-form';
