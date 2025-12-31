'use client';

import { useRef, useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import type {
    FormAdapter,
    AdapterOptions,
    FormState,
    FieldError,
    SetValueOptions,
} from '../types';
import { createArrayHelpers } from '../utils';

// =============================================================================
// TANSTACK ADAPTER OPTIONS
// =============================================================================

/**
 * Options specific to the TanStack Form adapter.
 * Extends base AdapterOptions with TanStack-specific features.
 */
export interface TanstackAdapterOptions<TData extends Record<string, unknown> = Record<string, unknown>>
    extends AdapterOptions<TData> {
    /**
     * Async validation debounce in milliseconds.
     * TanStack Form has built-in debouncing for async validators.
     * @default 300
     */
    asyncDebounceMs?: number;

    /**
     * Whether to validate on mount.
     * @default false
     */
    validateOnMount?: boolean;
}

// =============================================================================
// TANSTACK ADAPTER
// =============================================================================

/**
 * TanStack Form adapter implementing the FormAdapter interface.
 * 
 * @example
 * const form = useTanstack({
 *   defaultValues: { email: '', password: '' },
 *   onSubmit: async (data) => {
 *     await loginUser(data);
 *   },
 * });
 * 
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     ...
 *   </form>
 * );
 */
export function useTanstack<TData extends Record<string, unknown> = Record<string, unknown>>(
    options: TanstackAdapterOptions<TData>
): FormAdapter<TData> {
    const {
        defaultValues,
        values,
        resolver,
        mode = 'onChange',
        asyncDebounceMs = 300,
        validateOnMount = false,
        onSubmit,
    } = options;

    // -------------------------------------------------------------------------
    // Track manual errors (TanStack doesn't have built-in setError like RHF)
    // -------------------------------------------------------------------------

    const [manualErrors, setManualErrors] = useState<Record<string, FieldError>>({});

    // -------------------------------------------------------------------------
    // Handle async default values
    // -------------------------------------------------------------------------

    const [resolvedDefaults, setResolvedDefaults] = useState<TData | undefined>(
        typeof defaultValues === 'function' ? undefined : defaultValues
    );
    const [isLoadingDefaults, setIsLoadingDefaults] = useState(
        typeof defaultValues === 'function'
    );

    useEffect(() => {
        if (typeof defaultValues === 'function') {
            setIsLoadingDefaults(true);
            Promise.resolve(defaultValues()).then((resolved) => {
                setResolvedDefaults(resolved);
                setIsLoadingDefaults(false);
            });
        }
    }, [defaultValues]);

    // -------------------------------------------------------------------------
    // Initialize TanStack Form
    // -------------------------------------------------------------------------

    const form = useForm({
        defaultValues: (resolvedDefaults ?? {}) as TData,
        // TanStack Form uses a different validator API - we'll handle validation differently
        asyncDebounceMs,
        onSubmit: async ({ value }) => {
            // Run resolver validation before submit
            if (resolver) {
                const result = await resolver(value as TData);
                if (result.errors && Object.keys(result.errors).length > 0) {
                    // Set errors manually
                    Object.entries(result.errors).forEach(([field, error]) => {
                        setManualErrors(prev => ({
                            ...prev,
                            [field]: error,
                        }));
                    });
                    return; // Don't submit if validation fails
                }
            }

            if (onSubmit) {
                await onSubmit(value as TData);
            }
        },
    });
    // -------------------------------------------------------------------------
    // Handle controlled values updates
    // -------------------------------------------------------------------------

    const prevValuesRef = useRef(values);

    useEffect(() => {
        if (values && JSON.stringify(values) !== JSON.stringify(prevValuesRef.current)) {
            // Update all fields with new values
            Object.entries(values).forEach(([key, value]) => {
                form.setFieldValue(key as any, value as any);
            });
            prevValuesRef.current = values;
        }
    }, [values, form]);

    // -------------------------------------------------------------------------
    // Reset form when resolved defaults become available
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (resolvedDefaults && !form.state.isDirty) {
            form.reset(resolvedDefaults);
        }
    }, [resolvedDefaults, form]);

    // -------------------------------------------------------------------------
    // Create stable API reference
    // -------------------------------------------------------------------------

    const apiRef = useRef<FormAdapter<TData> | null>(null);

    // -------------------------------------------------------------------------
    // Build the adapter API
    // -------------------------------------------------------------------------

    const api: FormAdapter<TData> = {
        control: form,

        get formState(): FormState {
            const state = form.state;

            // Derive dirtyFields from TanStack's fieldMeta
            const dirtyFields: Record<string, boolean> = {};
            const fieldMeta = state.fieldMeta as Record<string, { isDirty?: boolean }>;
            for (const [key, meta] of Object.entries(fieldMeta)) {
                if (meta?.isDirty) {
                    dirtyFields[key] = true;
                }
            }

            // Derive touchedFields from fieldMeta
            const touchedFields: Record<string, boolean> = {};
            for (const [key, meta] of Object.entries(fieldMeta)) {
                if ((meta as any)?.isTouched) {
                    touchedFields[key] = true;
                }
            }

            // Merge TanStack errors with manual errors
            const errors = normalizeErrors(state.fieldMeta);
            Object.entries(manualErrors).forEach(([key, err]) => {
                errors[key] = err.message;
            });

            return {
                isSubmitting: state.isSubmitting,
                isValidating: state.isValidating,
                isDirty: state.isDirty,
                isValid: state.isValid && Object.keys(manualErrors).length === 0,
                isLoading: isLoadingDefaults,
                errors,
                dirtyFields,
                touchedFields,
                submitCount: state.submissionAttempts,
            };
        },

        handleSubmit: (e) => {
            e?.preventDefault();
            e?.stopPropagation();
            // Clear manual errors before submission
            setManualErrors({});
            return form.handleSubmit() as any;
        },

        // --- Value Management ---

        getValues: () => form.state.values,

        setValue: (name: string, value: unknown, opts?: SetValueOptions) => {
            form.setFieldValue(name as any, value as any);
            if (opts?.shouldValidate) {
                form.validateField(name as any, 'change');
            }
        },

        reset: (vals) => {
            form.reset(vals as TData);
            setManualErrors({});
        },

        watch: <T = unknown>(name: string): T => {
            // Navigate the values object using dot notation
            const parts = name.split('.');
            return parts.reduce((acc: any, key) => acc?.[key], form.state.values) as T;
        },

        // --- Validation ---

        validate: async (name) => {
            if (name) {
                const names = Array.isArray(name) ? name : [name];
                const results = await Promise.all(
                    names.map(n => form.validateField(n as any, 'change'))
                );
                // Check if all validations passed
                return names.every(n => {
                    const meta = (form.state.fieldMeta as any)[n];
                    return !meta?.errors?.length;
                });
            }
            // Validate entire form
            await form.validateAllFields('change');
            return form.state.isValid;
        },

        setError: (name: string, error: FieldError) => {
            setManualErrors(prev => ({
                ...prev,
                [name]: error,
            }));
        },

        clearErrors: (name) => {
            if (name) {
                const names = Array.isArray(name) ? name : [name];
                setManualErrors(prev => {
                    const next = { ...prev };
                    names.forEach(n => delete next[n]);
                    return next;
                });
            } else {
                setManualErrors({});
            }
        },

        // --- Arrays ---

        array: createArrayHelpers(
            (path) => {
                const parts = path.split('.');
                const val = parts.reduce((acc: any, key) => acc?.[key], form.state.values);
                return Array.isArray(val) ? val : [];
            },
            (path, value) => form.setFieldValue(path as any, value as any)
        ),
    };

    apiRef.current = api;

    return api;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Normalize TanStack's fieldMeta errors to flat string map.
 */
function normalizeErrors(
    fieldMeta: Record<string, any>
): Record<string, string | string[] | undefined> {
    const result: Record<string, string | string[] | undefined> = {};

    for (const [key, meta] of Object.entries(fieldMeta)) {
        if (meta?.errors?.length) {
            // TanStack stores errors as array of strings
            result[key] = meta.errors.length === 1 ? meta.errors[0] : meta.errors;
        }
    }

    return result;
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export type { FormApi as TanstackForm } from '@tanstack/react-form';
