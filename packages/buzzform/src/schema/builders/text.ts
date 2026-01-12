import { z } from 'zod';
import type { TextField, EmailField, TextareaField, PasswordField } from '../../types';
import { makeOptional, getPatternErrorMessage, applyCustomValidation } from '../helpers';

/**
 * Creates Zod schema for text fields.
 */
export function createTextFieldSchema(field: TextField | TextareaField): z.ZodTypeAny {
    let schema = z.string();

    // Pattern validation (only for TextField)
    if ('pattern' in field && field.pattern) {
        const pattern = typeof field.pattern === 'string'
            ? new RegExp(field.pattern)
            : field.pattern;

        schema = schema.regex(pattern, {
            error: getPatternErrorMessage(field.pattern),
        });
    }

    // Length constraints
    if (field.minLength) {
        schema = schema.min(field.minLength, {
            error: `Must be at least ${field.minLength} characters`,
        });
    }
    if (field.maxLength) {
        schema = schema.max(field.maxLength, {
            error: `Must be no more than ${field.maxLength} characters`,
        });
    }

    // Required (for strings, use min(1) instead of just required)
    if (field.required) {
        schema = schema.min(1, { error: 'This field is required' });
    }

    // Trim preprocessing (only for TextField)
    let finalSchema: z.ZodTypeAny = schema;
    if ('trim' in field && field.trim) {
        finalSchema = z.preprocess((val) => {
            return typeof val === 'string' ? val.trim() : val;
        }, schema);
    }

    // Apply custom validation
    finalSchema = applyCustomValidation(finalSchema, field, field.name);

    // Return optional if not required
    if (!field.required) {
        return makeOptional(finalSchema, field.type);
    }

    return finalSchema;
}

/**
 * Creates Zod schema for email fields.
 */
export function createEmailFieldSchema(field: EmailField): z.ZodTypeAny {
    // Zod v4: Use top-level z.email() instead of deprecated z.string().email()
    let schema = z.email({ error: 'Invalid email address' });

    // Length constraints (rare for email but supported)
    if (field.minLength) {
        schema = schema.min(field.minLength, {
            error: `Must be at least ${field.minLength} characters`,
        });
    }
    if (field.maxLength) {
        schema = schema.max(field.maxLength, {
            error: `Must be no more than ${field.maxLength} characters`,
        });
    }

    // Required
    if (field.required) {
        schema = schema.min(1, { error: 'Email is required' });
    }

    // Apply custom validation
    const finalSchema: z.ZodTypeAny = applyCustomValidation(schema, field, field.name);

    if (!field.required) {
        return makeOptional(finalSchema, 'email');
    }

    return finalSchema;
}

/**
 * Creates Zod schema for password fields.
 */
export function createPasswordFieldSchema(field: PasswordField): z.ZodTypeAny {
    let schema = z.string();

    if (field.minLength) {
        schema = schema.min(field.minLength, {
            error: `Password must be at least ${field.minLength} characters`,
        });
    }
    if (field.maxLength) {
        schema = schema.max(field.maxLength, {
            error: `Password must be no more than ${field.maxLength} characters`,
        });
    }
    if (field.required) {
        schema = schema.min(1, { error: 'Password is required' });
    }

    const finalSchema: z.ZodTypeAny = applyCustomValidation(schema, field, field.name);

    if (!field.required) {
        return makeOptional(finalSchema, 'password');
    }

    return finalSchema;
}
