import { type Field } from "@buildnbuzz/buzzform";

/**
 * Deep clone a value to break references to frozen objects.
 */
export function deepClone<T>(value: T): T {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(deepClone) as T;
    const result: Record<string, unknown> = {};
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            result[key] = deepClone((value as Record<string, unknown>)[key]);
        }
    }
    return result as T;
}

/**
 * Extract default values from field definitions.
 * Deep clones values to avoid frozen object references from Zustand/immer.
 */
export function extractDefaults(fields: Field[]): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};
    for (const field of fields) {
        if ("name" in field && field.name) {
            if ("defaultValue" in field) {
                // Deep clone to avoid frozen object references from Zustand/immer
                defaults[field.name] = deepClone(
                    (field as unknown as Record<string, unknown>).defaultValue,
                );
            }
            if ("fields" in field && Array.isArray(field.fields)) {
                defaults[field.name] = {
                    ...(defaults[field.name] as object),
                    ...extractDefaults(field.fields),
                };
            }
        } else if ("tabs" in field && Array.isArray(field.tabs)) {
            for (const tab of field.tabs) {
                const tabDefaults = extractDefaults(tab.fields);
                if (tab.name) {
                    defaults[tab.name] = {
                        ...(defaults[tab.name] as object),
                        ...tabDefaults,
                    };
                } else {
                    Object.assign(defaults, tabDefaults);
                }
            }
        } else if ("fields" in field && Array.isArray(field.fields)) {
            Object.assign(defaults, extractDefaults(field.fields));
        }
    }
    return defaults;
}

/**
 * Flattens field props to form values for the properties editor.
 * Excludes structural props like children, fields, and type.
 * Deep clones values to avoid frozen object references from Zustand/immer.
 */
export function flattenFieldToFormValues(field: Field): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(field)) {
        if (key === "children" || key === "fields" || key === "type") continue;
        // Deep clone to break frozen object references
        values[key] = deepClone(value);
    }
    return values;
}

/**
 * Unflattens form values with dot notation (e.g., { "props.foo": "bar" })
 * into a nested object structure (e.g., { props: { foo: "bar" } }).
 */
export function unflattenFormValues(
    values: Record<string, unknown>,
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in values) {
        const parts = key.split(".");
        let current = result;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current)) {
                current[part] = {};
            }
            current = current[part] as Record<string, unknown>;
        }

        current[parts[parts.length - 1]] = values[key];
    }

    return result;
}

/**
 * Generate a stable key for field arrays to detect structural changes.
 * Only tracks properties that require form re-initialization:
 * - type, name (structure)
 * - defaultValue (RHF only applies on mount)
 * Uses string concatenation instead of JSON.stringify for efficiency.
 */
export function generateSchemaKey(fields: Field[]): string {
    const parts: string[] = [];

    const walk = (f: Field) => {
        parts.push(f.type);
        if ("name" in f) parts.push(f.name);
        if ("defaultValue" in f)
            parts.push(
                String((f as unknown as Record<string, unknown>).defaultValue ?? ""),
            );

        if ("fields" in f && Array.isArray(f.fields)) f.fields.forEach(walk);
        if ("tabs" in f && Array.isArray(f.tabs)) {
            for (const tab of f.tabs) {
                if (tab.name) parts.push(tab.name);
                tab.fields.forEach(walk);
            }
        }
    };

    fields.forEach(walk);
    return parts.join("|");
}
