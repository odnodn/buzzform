import { type z } from 'zod';
import type { Resolver, FieldError, ResolverResult } from '../types';

// =============================================================================
// ZOD RESOLVER
// =============================================================================

// Zod v4 types from core
type ZodIssue = z.core.$ZodIssue;
type ZodError = z.ZodError;

/**
 * Creates a validation resolver from a Zod schema.
 * 
 * The resolver validates form values against the schema and returns:
 * - `{ values }` if validation passes (with transformed/parsed data)
 * - `{ errors }` if validation fails (with field-level error messages)
 * 
 * @param schema - A Zod schema to validate against
 * @returns A Resolver function compatible with BuzzForm adapters
 * 
 * @example
 * import { z } from '@buildnbuzz/buzzform/zod';
 * import { zodResolver } from '@buildnbuzz/buzzform';
 * 
 * const schema = z.object({
 *   email: z.email('Invalid email'),
 *   age: z.number().min(18, 'Must be at least 18'),
 * });
 * 
 * const form = useRhf({
 *   resolver: zodResolver(schema),
 *   defaultValues: { email: '', age: 0 },
 * });
 */
export function zodResolver<TData>(
    schema: z.ZodType<TData>
): Resolver<TData> {
    return async (values: TData): Promise<ResolverResult<TData>> => {
        try {
            // Parse and validate - this also transforms the data
            const parsed = await schema.parseAsync(values);

            return {
                values: parsed,
                errors: {},
            };
        } catch (error) {
            // Handle Zod validation errors
            if (isZodError(error)) {
                return {
                    values: {} as TData,
                    errors: mapZodErrors(error),
                };
            }

            // Re-throw unexpected errors
            throw error;
        }
    };
}

// =============================================================================
// ERROR MAPPING
// =============================================================================

/**
 * Maps Zod validation errors to our FieldError format.
 * Handles nested paths (e.g., "address.city", "items.0.name").
 */
function mapZodErrors(error: ZodError): Record<string, FieldError> {
    const errors: Record<string, FieldError> = {};

    for (const issue of error.issues) {
        const path = issuePath(issue);

        // Only set the first error for each path
        if (!errors[path]) {
            errors[path] = {
                type: issueType(issue),
                message: issue.message,
            };
        }
    }

    return errors;
}

/**
 * Convert Zod issue path to dot-notation string.
 * ['address', 'city'] → 'address.city'
 * ['items', 0, 'name'] → 'items.0.name'
 */
function issuePath(issue: ZodIssue): string {
    return issue.path.map(String).join('.');
}

/**
 * Map Zod issue code to a simpler type string.
 * Zod v4: Uses string literal codes instead of ZodIssueCode enum.
 */
function issueType(issue: ZodIssue): string {
    switch (issue.code) {
        case 'invalid_type':
            if ('received' in issue && issue.received === 'undefined') return 'required';
            return 'type';
        case 'too_small':
            if ('origin' in issue && issue.origin === 'string') return 'minLength';
            return 'min';
        case 'too_big':
            if ('origin' in issue && issue.origin === 'string') return 'maxLength';
            return 'max';
        case 'invalid_format': {
            const formatIssue = issue as { format?: string };
            if (formatIssue.format === 'regex') return 'pattern';
            if (typeof formatIssue.format === 'string') return formatIssue.format;
            return 'pattern';
        }
        case 'custom':
            return 'custom';
        default:
            return issue.code ?? 'validation';
    }
}

/**
 * Type guard to check if an error is a ZodError.
 */
function isZodError(error: unknown): error is ZodError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'issues' in error &&
        Array.isArray((error as ZodError).issues)
    );
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export type { ZodType as ZodSchema } from 'zod';
export { z } from 'zod';