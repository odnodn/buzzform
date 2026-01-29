import { type Field } from "@buildnbuzz/buzzform";

/**
 * Flattens field props to form values for the properties editor.
 * Excludes structural props like children, fields, and type.
 */
export function flattenFieldToFormValues(field: Field): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(field)) {
        if (key === "children" || key === "fields" || key === "type") continue;
        values[key] = value;
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
