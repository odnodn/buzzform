import type { ZodSchema } from 'zod';
import type { Field } from './field';
import type { AdapterFactory, Resolver } from './adapter';

// =============================================================================
// SCHEMA WITH FIELDS
// =============================================================================

/**
 * A Zod schema with field definitions attached.
 * Created by `createSchema([...])` for type inference and field rendering.
 */
export type BuzzFormSchema<TData = unknown, TFields extends readonly Field[] = Field[]> =
    ZodSchema<TData> & { fields: TFields };

// =============================================================================
// FORM SETTINGS
// =============================================================================

/**
 * Form-level behavior settings.
 * These control how the form behaves during user interaction.
 */
export interface FormSettings {
    /**
     * Prevent submission when form has no changes.
     * When true, handleSubmit is a no-op if formState.isDirty is false.
     * @default false
     */
    submitOnlyWhenDirty?: boolean;

    /**
     * Auto-focus first visible, enabled field on mount.
     * Note: This is a hint to the renderer component.
     * @default false
     */
    autoFocus?: boolean;
}

// =============================================================================
// GLOBAL FORM CONFIG (Provider Level)
// =============================================================================

/**
 * Global form configuration set at the provider level.
 * These defaults apply to all forms unless overridden.
 * 
 * @example
 * <FormProvider
 *   adapter={useRhfAdapter}
 *   resolver={zodResolver}
 *   mode="onBlur"
 * >
 *   <App />
 * </FormProvider>
 */
export interface FormConfig {
    /**
     * Adapter factory function.
     * Determines which form library handles state management.
     * 
     * @example
     * import { useRhfAdapter } from '@buildnbuzz/buzzform/rhf';
     * adapter: useRhfAdapter
     */
    adapter: AdapterFactory;

    /**
     * Validation resolver factory.
     * Converts a Zod schema into a form-compatible resolver.
     * @default zodResolver
     * 
     * @example
     * import { zodResolver } from '@buildnbuzz/buzzform/resolvers/zod';
     * resolver: zodResolver
     */
    resolver?: <T>(schema: ZodSchema<T>) => Resolver<T>;

    /**
     * Default validation mode for all forms.
     * - 'onChange': Validate on every change (default)
     * - 'onBlur': Validate when fields lose focus
     * - 'onSubmit': Validate only on submit
     * @default 'onChange'
     */
    mode?: 'onChange' | 'onBlur' | 'onSubmit';

    /**
     * When to re-validate after initial validation error.
     * - 'onChange': Re-validate on every change (default)
     * - 'onBlur': Re-validate when fields lose focus
     * - 'onSubmit': Re-validate only on submit
     * @default 'onChange'
     */
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// =============================================================================
// USE FORM OPTIONS (Per-Form Level)
// =============================================================================

/**
 * Options passed to useForm hook.
 * 
 * @example
 * const loginSchema = createSchema([
 *   { type: 'email', name: 'email', required: true },
 *   { type: 'password', name: 'password', required: true },
 * ]);
 * 
 * const form = useForm({
 *   schema: loginSchema,
 *   onSubmit: async (data) => {
 *     await auth.login(data);
 *   },
 * });
 */
export interface UseFormOptions<TData = Record<string, unknown>> {
    // =========================================================================
    // PRIMARY CONFIGURATION
    // =========================================================================

    /**
     * Zod schema for validation.
     * - Use `createSchema([...])` for schema with fields attached (recommended)
     * - Use raw Zod schema for validation-only (manual field rendering)
     */
    schema: ZodSchema<TData> | BuzzFormSchema<TData>;

    /**
     * Default values for the form.
     * If not provided and schema has fields, extracted from field definitions.
     * Can be static, sync function, or async function.
     */
    defaultValues?: TData | (() => TData) | (() => Promise<TData>);

    /**
     * Form submission handler.
     * Called with validated data after all validation passes.
     */
    onSubmit?: (data: TData) => Promise<void> | void;

    // =========================================================================
    // PROVIDER OVERRIDES
    // =========================================================================

    /**
     * Override the adapter for this specific form.
     * Uses provider's adapter if not specified.
     */
    adapter?: AdapterFactory;

    /**
     * Override the validation mode for this form.
     * Uses provider's mode if not specified.
     */
    mode?: 'onChange' | 'onBlur' | 'onSubmit';

    /**
     * Override the re-validation mode for this form.
     * Uses provider's reValidateMode if not specified.
     */
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';

    // =========================================================================
    // BEHAVIOR
    // =========================================================================

    /**
     * Form behavior settings.
     */
    settings?: FormSettings;
}
