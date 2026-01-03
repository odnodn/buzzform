// Form adapters inherently require `any` for compatibility with TanStack Form's generic types
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import type { DeepKeys, DeepValue } from '@tanstack/react-form';
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
        validateOnMount,
        asyncDebounceMs = 300,
        onSubmit,
    } = options;

    // -------------------------------------------------------------------------
    // Track manual errors (TanStack doesn't have built-in setError like RHF)
    // -------------------------------------------------------------------------

    const [manualErrors, setManualErrors] = useState<Record<string, FieldError>>({});

    // -------------------------------------------------------------------------
    // Shared Validation Logic
    // -------------------------------------------------------------------------

    /**
     * Runs the resolver against current values and updates manual errors.
     * Returns true if valid, false if invalid.
     */
    const validateForm = useCallback(async (formValues: TData) => {
        if (!resolver) return true;

        const result = await resolver(formValues);

        if (result.errors && Object.keys(result.errors).length > 0) {
            setManualErrors((prev) => {
                // Optimization: prevent unnecessary re-renders if errors match
                if (JSON.stringify(prev) === JSON.stringify(result.errors)) {
                    return prev;
                }
                return result.errors!;
            });
            return false;
        }

        // Clear errors if valid
        setManualErrors((prev) => {
            if (Object.keys(prev).length === 0) return prev;
            return {};
        });
        return true;
    }, [resolver]);

    // -------------------------------------------------------------------------
    // Handle async default values
    // -------------------------------------------------------------------------

    const [resolvedDefaults, setResolvedDefaults] = useState<TData | undefined>(
        typeof defaultValues === 'function' ? undefined : defaultValues as TData
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

    const form = useForm<TData>({
        defaultValues: (resolvedDefaults ?? {}) as TData,
        asyncDebounceMs,
        // Integrate mode-based validation
        // Note: We use sync validators that fire-and-forget the async validateForm.
        // The validateForm updates React state (manualErrors) which triggers re-render.
        validators: {
            onChange: (mode === 'onChange' || mode === 'all')
                ? ({ value }) => { void validateForm(value); return undefined; }
                : undefined,
            onBlur: (mode === 'onBlur' || mode === 'all')
                ? ({ value }) => { void validateForm(value); return undefined; }
                : undefined,
        },
        onSubmit: async ({ value }) => {
            // Always validate on submit
            const isValid = await validateForm(value);

            if (!isValid) {
                return; // Don't submit if validation fails
            }

            if (onSubmit) {
                await onSubmit(value);
            }
        },
    });

    // -------------------------------------------------------------------------
    // Validate on Mount
    // -------------------------------------------------------------------------

    const hasValidatedOnMount = useRef(false);

    useEffect(() => {
        if (
            validateOnMount &&
            !hasValidatedOnMount.current &&
            !isLoadingDefaults // Wait for async defaults
        ) {
            hasValidatedOnMount.current = true;
            validateForm(form.state.values);
        }
    }, [validateOnMount, isLoadingDefaults, validateForm, form.state.values]);

    // -------------------------------------------------------------------------
    // Handle controlled values updates
    // -------------------------------------------------------------------------

    const prevValuesRef = useRef(values);

    useEffect(() => {
        if (values && JSON.stringify(values) !== JSON.stringify(prevValuesRef.current)) {
            // Update all fields with new values
            Object.entries(values).forEach(([key, value]) => {
                form.setFieldValue(key as DeepKeys<TData>, value as DeepValue<TData, DeepKeys<TData>>);
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
            const fieldMeta = state.fieldMeta;

            // Iterate over keys safely
            const keys = Object.keys(fieldMeta) as Array<keyof typeof fieldMeta>;
            for (const key of keys) {
                const meta = fieldMeta[key];
                if (meta?.isDirty) {
                    dirtyFields[key as string] = true;
                }
            }

            // Derive touchedFields from fieldMeta
            const touchedFields: Record<string, boolean> = {};
            for (const key of keys) {
                const meta = fieldMeta[key];
                if (meta?.isTouched) {
                    touchedFields[key as string] = true;
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
            // Clear manual errors before submission (they will be re-set by onSubmit validation)
            setManualErrors({});
            return form.handleSubmit();
        },

        // --- Value Management ---

        getValues: () => form.state.values,

        setValue: (name: string, value: unknown, opts?: SetValueOptions) => {
            form.setFieldValue(name as DeepKeys<TData>, value as DeepValue<TData, DeepKeys<TData>>);
            if (opts?.shouldValidate) {
                form.validateField(name as DeepKeys<TData>, 'change');
            }
        },

        reset: (vals) => {
            form.reset(vals as TData);
            setManualErrors({});
        },

        watch: <T = unknown>(name?: string): T => {
            if (!name) return form.state.values as unknown as T;
            // Navigate the values object using dot notation
            const parts = name.split('.');
            let current: unknown = form.state.values;

            for (const part of parts) {
                if (isRecord(current)) {
                    current = current[part];
                } else {
                    return undefined as T;
                }
            }
            return current as T;
        },

        onBlur: (name: string) => {
            form.setFieldMeta(name as DeepKeys<TData>, (prev) => ({
                ...prev,
                isTouched: true,
            }));
            if (mode === 'onBlur') {
                form.validateField(name as DeepKeys<TData>, 'blur');
            }
        },

        // --- Validation ---

        validate: async (name) => {
            if (name) {
                const names = Array.isArray(name) ? name : [name];
                await Promise.all(
                    names.map(n => form.validateField(n as DeepKeys<TData>, 'change'))
                );
                // Check if all validations passed
                return names.every(n => {
                    // Safe access to fieldMeta using generic constraint
                    const meta = form.getFieldMeta(n as DeepKeys<TData>);
                    return !meta?.errors.length;
                });
            }
            // Validate entire form
            await form.validateAllFields('change');
            // Also run global resolver
            const isValid = await validateForm(form.state.values);
            return form.state.isValid && isValid;
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
                let current: unknown = form.state.values;
                for (const part of parts) {
                    if (isRecord(current)) {
                        current = current[part];
                    } else {
                        current = undefined;
                        break;
                    }
                }
                return Array.isArray(current) ? current : [];
            },
            (path, value) => form.setFieldValue(path as DeepKeys<TData>, value as DeepValue<TData, DeepKeys<TData>>)
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
    fieldMeta: Record<string, unknown>
): Record<string, string | string[] | undefined> {
    const result: Record<string, string | string[] | undefined> = {};

    for (const [key, meta] of Object.entries(fieldMeta)) {
        if (isRecord(meta) && Array.isArray(meta.errors) && meta.errors.length > 0) {
            const firstError = meta.errors[0];
            // TanStack stores errors as array of strings or objects
            if (typeof firstError === 'string') {
                result[key] = meta.errors.length === 1 ? firstError : meta.errors as string[];
            } else if (isRecord(firstError) && typeof firstError.message === 'string') {
                // If error is an object with message property
                result[key] = firstError.message;
            }
        }
    }

    return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export type { FormApi as TanstackForm } from '@tanstack/react-form';