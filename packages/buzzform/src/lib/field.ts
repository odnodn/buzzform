import type { Field } from '../types';

// =============================================================================
// FIELD PATH UTILITIES
// These utilities help work with nested field definitions and form data.
// =============================================================================

/**
 * Recursively extracts all field paths from a field definition tree.
 * Handles nested groups, arrays, and layout fields (rows, tabs, collapsibles).
 * 
 * @param fields - Array of field definitions
 * @param basePath - Base path prefix (e.g., "contacts.0" for array items)
 * @returns Array of all field paths
 * 
 * @example
 * const fields = [
 *   { type: 'text', name: 'name' },
 *   { type: 'group', name: 'address', fields: [
 *     { type: 'text', name: 'city' },
 *     { type: 'text', name: 'zip' }
 *   ]}
 * ];
 * getNestedFieldPaths(fields, 'contact')
 * // => ['contact.name', 'contact.address', 'contact.address.city', 'contact.address.zip']
 */
export function getNestedFieldPaths(fields: Field[], basePath: string): string[] {
    const paths: string[] = [];

    for (const field of fields) {
        // Data fields with names
        if ('name' in field && field.name) {
            const fieldPath = basePath ? `${basePath}.${field.name}` : field.name;
            paths.push(fieldPath);

            // Recurse into group/array fields
            if (field.type === 'group' && 'fields' in field) {
                paths.push(...getNestedFieldPaths(field.fields, fieldPath));
            }
            if (field.type === 'array' && 'fields' in field) {
                paths.push(...getNestedFieldPaths(field.fields, fieldPath));
            }
        }

        // Layout fields (row, tabs, collapsible) - pass through without adding to path
        if ('fields' in field && field.type !== 'group' && field.type !== 'array') {
            const layoutField = field as Field & { fields: Field[] };
            paths.push(...getNestedFieldPaths(layoutField.fields, basePath));
        }

        // Tabs field - iterate through tabs
        if (field.type === 'tabs' && 'tabs' in field) {
            for (const tab of field.tabs) {
                const tabPath = tab.name ? (basePath ? `${basePath}.${tab.name}` : tab.name) : basePath;
                paths.push(...getNestedFieldPaths(tab.fields, tabPath));
            }
        }
    }

    return paths;
}

/**
 * Count validation errors in nested fields.
 * Useful for showing error badges on collapsible sections, array rows, tabs, etc.
 * 
 * @param errors - Form errors object from FormAdapter.formState.errors
 * @param fields - Field definitions to check
 * @param basePath - Base path for the fields
 * @returns Number of fields with errors
 * 
 * @example
 * const errorCount = countNestedErrors(form.formState.errors, arrayField.fields, `items.0`);
 */
export function countNestedErrors(
    errors: Record<string, unknown>,
    fields: Field[],
    basePath: string
): number {
    const paths = getNestedFieldPaths(fields, basePath);
    return paths.filter((path) => errors[path]).length;
}

/**
 * Resolve a potentially dynamic field property (disabled, readOnly, hidden).
 * These properties can be boolean or a function that receives form data.
 * 
 * @param value - The property value (boolean or function)
 * @param formData - Current form data
 * @param siblingData - Data at the same level (for arrays, this is the row data)
 * @returns Resolved boolean value
 * 
 * @example
 * const isDisabled = resolveFieldState(field.disabled, formData, siblingData);
 */
export function resolveFieldState<TData = Record<string, unknown>>(
    value: boolean | ((data: TData, siblingData: Record<string, unknown>) => boolean) | undefined,
    formData: TData,
    siblingData: Record<string, unknown> = formData as Record<string, unknown>
): boolean {
    if (typeof value === 'function') {
        return value(formData, siblingData);
    }
    return Boolean(value);
}

/**
 * Get the label value for an array row based on field configuration.
 * First checks for a specific rowLabelField in ui options, then falls back
 * to the first named field's value.
 * 
 * @param rowData - Data for the row
 * @param fields - Field definitions for the array
 * @param uiOptions - UI options that may contain rowLabelField
 * @param fallbackLabel - Default label if no value found
 * @returns Label string for the row
 * 
 * @example
 * const label = getArrayRowLabel(rowData, field.fields, field.ui, `Item ${index + 1}`);
 */
export function getArrayRowLabel(
    rowData: Record<string, unknown> | undefined,
    fields: Field[],
    uiOptions: { rowLabelField?: string } | undefined,
    fallbackLabel: string
): string {
    // First try explicit rowLabelField
    if (uiOptions?.rowLabelField && rowData?.[uiOptions.rowLabelField]) {
        return String(rowData[uiOptions.rowLabelField]);
    }

    // Fall back to first named field
    const firstNamedField = fields.find((f) => 'name' in f && f.name);
    if (firstNamedField && 'name' in firstNamedField) {
        const value = rowData?.[firstNamedField.name];
        if (value) {
            return String(value);
        }
    }

    return fallbackLabel;
}
