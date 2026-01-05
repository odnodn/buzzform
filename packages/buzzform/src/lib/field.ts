import type { ReactNode } from 'react';
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

// =============================================================================
// FIELD STYLE UTILITIES
// Helpers for computing field styling props.
// =============================================================================

/**
 * Compute the inline style object for a field's width.
 * Handles both numeric (px) and string (CSS) width values.
 * 
 * @param style - Field style configuration
 * @returns CSS properties object or undefined if no width specified
 * 
 * @example
 * <Field style={getFieldWidthStyle(field.style)}>
 *   ...
 * </Field>
 */
export function getFieldWidthStyle(
    style: { width?: number | string } | undefined
): { width: string } | undefined {
    if (!style?.width) return undefined;
    return {
        width: typeof style.width === 'number'
            ? `${style.width}px`
            : style.width,
    };
}

// =============================================================================
// SELECT OPTION UTILITIES
// Helpers for normalizing and extracting data from SelectOption | string.
// =============================================================================

type SelectOptionLike = { value: string | number | boolean; label?: ReactNode; description?: ReactNode; icon?: ReactNode; disabled?: boolean } | string;

/**
 * Normalize a select option to always be an object.
 * Converts string options to { value, label } objects.
 * 
 * @param option - String or SelectOption object
 * @returns Normalized SelectOption object
 * 
 * @example
 * normalizeSelectOption('foo') // => { value: 'foo', label: 'foo' }
 * normalizeSelectOption({ value: 'bar', label: 'Bar' }) // => { value: 'bar', label: 'Bar' }
 */
export function normalizeSelectOption(option: SelectOptionLike): {
    value: string | number | boolean;
    label: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
} {
    if (typeof option === 'string') {
        return { value: option, label: option };
    }
    return {
        value: option.value,
        label: option.label ?? String(option.value),
        description: option.description,
        icon: option.icon,
        disabled: option.disabled,
    };
}

/**
 * Get the value from a select option (handles string or object).
 * 
 * @param option - String or SelectOption object
 * @returns The option's value as a string
 * 
 * @example
 * getSelectOptionValue('foo') // => 'foo'
 * getSelectOptionValue({ value: 123, label: 'One Two Three' }) // => '123'
 */
export function getSelectOptionValue(option: SelectOptionLike): string {
    if (typeof option === 'string') return option;
    const val = option.value;
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
}

/**
 * Get the label from a select option (handles string or object).
 * Returns ReactNode to support JSX labels.
 * 
 * @param option - String or SelectOption object
 * @returns The option's label for display
 * 
 * @example
 * getSelectOptionLabel('foo') // => 'foo'
 * getSelectOptionLabel({ value: 'bar', label: <strong>Bar</strong> }) // => <strong>Bar</strong>
 */
export function getSelectOptionLabel(option: SelectOptionLike): ReactNode {
    if (typeof option === 'string') return option;
    return option.label ?? String(option.value);
}

/**
 * Get the string label from a select option (for filtering/comparison).
 * Always returns a string, not ReactNode.
 * 
 * @param option - String or SelectOption object
 * @returns The option's label as a string
 */
export function getSelectOptionLabelString(option: SelectOptionLike): string {
    if (typeof option === 'string') return option;
    if (typeof option.label === 'string') return option.label;
    return String(option.value);
}

/**
 * Check if a select option is disabled.
 * 
 * @param option - String or SelectOption object
 * @returns true if option is disabled
 */
export function isSelectOptionDisabled(option: SelectOptionLike): boolean {
    if (typeof option === 'string') return false;
    return option.disabled === true;
}

// =============================================================================
// NUMBER UTILITIES
// Helpers for number field operations.
// =============================================================================

/**
 * Clamp a number between min and max bounds.
 * 
 * @param value - The number to clamp
 * @param min - Minimum bound (optional)
 * @param max - Maximum bound (optional)
 * @returns Clamped number
 * 
 * @example
 * clampNumber(5, 0, 10) // => 5
 * clampNumber(-5, 0, 10) // => 0
 * clampNumber(15, 0, 10) // => 10
 */
export function clampNumber(value: number, min?: number, max?: number): number {
    let result = value;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
}

/**
 * Apply numeric precision (decimal places) to a number.
 * 
 * @param value - The number to format
 * @param precision - Number of decimal places
 * @returns Formatted number or undefined if input is undefined
 * 
 * @example
 * applyNumericPrecision(3.14159, 2) // => 3.14
 * applyNumericPrecision(10, 2) // => 10
 */
export function applyNumericPrecision(
    value: number | undefined,
    precision?: number
): number | undefined {
    if (value === undefined || precision === undefined) return value;
    return parseFloat(value.toFixed(precision));
}

/**
 * Format a number with thousand separators.
 * 
 * @param value - The number to format
 * @param separator - Separator character (default: ',')
 * @returns Formatted string or empty string if value is undefined/NaN
 * 
 * @example
 * formatNumberWithSeparator(1234567.89) // => '1,234,567.89'
 * formatNumberWithSeparator(1234567, ' ') // => '1 234 567'
 */
export function formatNumberWithSeparator(
    value: number | undefined,
    separator: string = ','
): string {
    if (value === undefined || value === null || isNaN(value)) return '';
    const [intPart, decPart] = value.toString().split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

/**
 * Parse a formatted number string back to a number.
 * 
 * @param str - Formatted string with separators
 * @param separator - Separator character to remove
 * @returns Parsed number or undefined if invalid
 * 
 * @example
 * parseFormattedNumber('1,234,567.89') // => 1234567.89
 * parseFormattedNumber('1 234 567', ' ') // => 1234567
 */
export function parseFormattedNumber(
    str: string,
    separator: string = ','
): number | undefined {
    if (!str || str === '') return undefined;
    const cleaned = str.split(separator).join('');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
}

// =============================================================================
// DATE UTILITIES
// Helpers for date field operations.
// =============================================================================

/**
 * Safely parse a value to a Date object.
 * Handles Date objects, ISO strings, and timestamps.
 * 
 * @param value - Value to parse (Date, string, number, or unknown)
 * @returns Date object or undefined if invalid
 * 
 * @example
 * parseToDate(new Date()) // => Date
 * parseToDate('2024-01-15') // => Date
 * parseToDate(null) // => undefined
 */
export function parseToDate(value: unknown): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? undefined : value;
    }
    if (typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
    }
    if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
}
