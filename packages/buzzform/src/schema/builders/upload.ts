import { z } from 'zod';
import type { UploadField } from '../../types';

/**
 * Check if a file's MIME type matches an accept pattern.
 * Supports wildcards like "image/*" and exact types like "image/png".
 */
function matchesMimePattern(fileType: string, pattern: string): boolean {
    const normalizedPattern = pattern.toLowerCase().trim();
    const normalizedType = fileType.toLowerCase();

    // Wildcard: "image/*", "video/*", etc.
    if (normalizedPattern.endsWith('/*')) {
        const category = normalizedPattern.replace('/*', '');
        return normalizedType.startsWith(category + '/');
    }

    // Extension: ".pdf", ".png", etc.
    if (normalizedPattern.startsWith('.')) {
        // Can't reliably check extension from MIME type alone
        // This is typically handled at the input level by the browser
        return true;
    }

    // Exact match: "image/png", "application/pdf", etc.
    return normalizedType === normalizedPattern;
}

/**
 * Check if a file matches any of the accept patterns.
 */
function isFileTypeAccepted(file: File, acceptPatterns: string[]): boolean {
    if (!file.type) return true; // Can't validate without MIME type
    return acceptPatterns.some(pattern => matchesMimePattern(file.type, pattern));
}

/**
 * Creates Zod schema for upload fields.
 * Uses Zod v4's native z.file() with custom MIME validation for wildcard support.
 */
export function createUploadFieldSchema(field: UploadField): z.ZodTypeAny {
    // Build base file schema with native Zod v4 constraints
    let fileSchema: z.ZodTypeAny = z.file();

    // Size constraint
    if (field.maxSize) {
        const sizeMB = (field.maxSize / 1024 / 1024).toFixed(1);
        fileSchema = (fileSchema as z.ZodFile).max(field.maxSize, {
            error: `File must be smaller than ${sizeMB}MB`,
        });
    }

    // MIME type constraint with wildcard support
    const accept = field.ui?.accept;
    if (accept && accept !== '*') {
        const acceptPatterns = accept.split(',').map(t => t.trim());
        const hasWildcard = acceptPatterns.some(p => p.includes('*') || p.startsWith('.'));

        if (hasWildcard) {
            // Use custom refinement for wildcard patterns
            fileSchema = fileSchema.refine(
                (file) => isFileTypeAccepted(file as File, acceptPatterns),
                `File type not allowed. Accepted: ${accept}`
            );
        } else {
            // Use native .mime() for exact types (better performance)
            fileSchema = (fileSchema as z.ZodFile).mime(acceptPatterns, {
                error: `File type not allowed. Accepted: ${accept}`,
            });
        }
    }

    // Allow string URLs for existing uploads (server returns URL after upload)
    const fileOrUrl = z.union([fileSchema, z.string()]);

    if (field.hasMany) {
        let arraySchema = z.array(fileOrUrl);

        // Min files constraint
        if (field.minFiles !== undefined && field.minFiles > 0) {
            arraySchema = arraySchema.min(field.minFiles, {
                error: `At least ${field.minFiles} file(s) required`,
            });
        }

        // Max files constraint
        if (field.maxFiles !== undefined) {
            arraySchema = arraySchema.max(field.maxFiles, {
                error: `Maximum ${field.maxFiles} file(s) allowed`,
            });
        }

        // Required constraint
        if (field.required) {
            arraySchema = arraySchema.min(1, {
                error: 'At least one file is required',
            });
            return arraySchema;
        }

        return arraySchema.optional().default([]);
    }

    // Single file mode
    if (field.required) {
        return fileOrUrl;
    }

    return fileOrUrl.optional().nullable();
}
