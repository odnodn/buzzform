---
name: buzzform-schema
description: >
  Generate BuzzForm schema-driven form definitions for React and shadcn/ui.
  Use when building forms, creating form schemas, or when the user mentions
  BuzzForm, buzzform, form fields, form schema, or form builder. Covers all
  19 field types, validation, conditional logic, nested data, and layout.
metadata:
  author: buildnbuzz
  version: "0.1"
---

# BuzzForm Schema Authoring

BuzzForm is a schema-driven React form library for shadcn/ui. You declare fields as data and BuzzForm handles rendering, validation, and state management.

## Core Pattern

Every BuzzForm follows three steps:

```tsx
import { createSchema, InferType } from "@buildnbuzz/buzzform";
import { Form } from "@/components/buzzform/form";

// 1. Define fields
const schema = createSchema([
  { type: "text", name: "name", label: "Name", required: true },
  { type: "email", name: "email", label: "Email", required: true },
]);

// 2. Infer types
type FormData = InferType<typeof schema>;

// 3. Render
export function MyForm() {
  const handleSubmit = async (data: FormData) => {
    console.log(data);
  };
  return <Form schema={schema} onSubmit={handleSubmit} />;
}
```

## Field Types

### Data Fields (collect user input)

| Type             | Output Type                  | Key Props                                                       |
| ---------------- | ---------------------------- | --------------------------------------------------------------- |
| `text`           | `string`                     | `minLength`, `maxLength`, `pattern`, `ui.copyable`              |
| `email`          | `string`                     | Auto email validation, `ui.copyable`                            |
| `password`       | `string`                     | `minLength`, `maxLength`, `criteria`, `ui.generate`             |
| `textarea`       | `string`                     | `rows`, `autoResize`, `minLength`, `maxLength`, `ui.copyable`   |
| `number`         | `number`                     | `min`, `max`, `precision`, `ui.step`, `ui.prefix`, `ui.suffix`  |
| `date`           | `Date`                       | `minDate`, `maxDate`, `ui.format`, `ui.presets`                 |
| `datetime`       | `Date`                       | `minDate`, `maxDate`, `ui.timePicker`                           |
| `select`         | `string \| string[]`         | `options`, `dependencies`, `ui.searchable`, `ui.multiSelect`    |
| `radio`          | `string`                     | `options`, `ui.variant`, `ui.direction`, `ui.columns`           |
| `checkbox`       | `boolean`                    | `defaultValue`                                                  |
| `checkbox-group` | `(string\|number\|boolean)[]`| `options`, `minSelected`, `maxSelected`, `ui.variant`           |
| `switch`         | `boolean`                    | `defaultValue`, `ui.alignment`                                  |
| `tags`           | `string[]`                   | `minTags`, `maxTags`, `maxTagLength`, `allowDuplicates`         |
| `upload`         | `File \| File[]`             | `hasMany`, `minFiles`, `maxFiles`, `maxSize`, `ui.accept`       |

### Layout Fields (organize other fields)

| Type          | Purpose                           | Key Props                                          |
| ------------- | --------------------------------- | -------------------------------------------------- |
| `row`         | Horizontal arrangement            | `fields`, `gap`, `align`, `ui.responsive`          |
| `group`       | Nested object `{}`                | `fields`, `ui.variant`, `ui.collapsible`           |
| `collapsible` | Expandable section                | `fields`, `collapsed`, `ui.variant`                |
| `tabs`        | Tabbed interface                  | `tabs: [{ label, fields }]`, `ui.defaultTab`      |
| `array`       | Repeatable items `[]`             | `fields`, `minRows`, `maxRows`, `ui.reorderable`   |

## Common Field Properties

All data fields accept these base properties:

```tsx
{
  type: "text",             // Required: field type
  name: "fieldName",        // Required: key in form data
  label: "Display Label",   // Display label (string, ReactNode, or false)
  description: "Help text", // Help text below field
  placeholder: "Hint...",   // Placeholder text
  required: true,           // Whether field is required
  disabled: false,          // Boolean or (data) => boolean
  hidden: false,            // Boolean or (data) => boolean
  readOnly: false,          // Boolean or (data) => boolean
  defaultValue: "",         // Initial value
  validate: (value, ctx) => true, // Custom validation
  condition: (data) => true,      // Conditional visibility (unregisters when false)
  style: { className: "", width: "" },
  autoComplete: "off",
}
```

## Validation

Validation is auto-generated from field properties. No manual Zod schema needed.

| Field Type         | Auto Validations                                         |
| ------------------ | -------------------------------------------------------- |
| `text`, `textarea` | `required`, `minLength`, `maxLength`, `pattern`          |
| `email`            | `required` + email format                                |
| `password`         | `required`, `minLength`, `maxLength`, `criteria`         |
| `number`           | `required`, `min`, `max`, `precision`                    |
| `date`, `datetime` | `required`, `minDate`, `maxDate`                         |
| `select`, `radio`  | `required`, validates against options                    |
| `tags`             | `minTags`, `maxTags`, `maxTagLength`                     |
| `upload`           | `required`, `minFiles`, `maxFiles`, `maxSize`            |
| `array`            | `minRows`, `maxRows`                                     |

### Custom validation

```tsx
{
  type: "text",
  name: "username",
  validate: (value, { data, siblingData, path }) => {
    if (value.includes(" ")) return "No spaces allowed";
    return true;
  },
}
```

### Cross-field validation

```tsx
{
  type: "password",
  name: "confirmPassword",
  validate: (value, { data }) => {
    if (value !== data.password) return "Passwords do not match";
    return true;
  },
}
```

## Conditional Logic

Use functions for dynamic `disabled`, `hidden`, `readOnly`, and `condition`:

```tsx
{
  type: "text",
  name: "companyName",
  label: "Company Name",
  // hidden: keeps value, just hides UI
  hidden: (data) => data.accountType !== "business",
  // condition: unregisters field entirely when false
  condition: (data) => data.accountType === "business",
}
```

## Nested Data with Groups

```tsx
{
  type: "group",
  name: "address",
  label: "Address",
  ui: { variant: "card" }, // "card" | "flat" | "ghost" | "bordered"
  fields: [
    { type: "text", name: "street", label: "Street" },
    { type: "text", name: "city", label: "City" },
  ],
}
// Output: { address: { street: string, city: string } }
```

## Repeatable Items with Arrays

```tsx
{
  type: "array",
  name: "contacts",
  label: "Contacts",
  minRows: 1,
  maxRows: 5,
  ui: { reorderable: true },
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "email", name: "email", label: "Email" },
  ],
}
// Output: { contacts: Array<{ name: string, email: string }> }
```

## Layout with Rows

```tsx
{
  type: "row",
  fields: [
    { type: "text", name: "firstName", label: "First Name" },
    { type: "text", name: "lastName", label: "Last Name" },
  ],
}
```

## Tabbed Sections

```tsx
{
  type: "tabs",
  name: "profile",  // Optional: creates nested object if provided
  tabs: [
    {
      label: "Personal",
      fields: [
        { type: "text", name: "name", label: "Name" },
      ],
    },
    {
      label: "Work",
      fields: [
        { type: "text", name: "company", label: "Company" },
      ],
    },
  ],
}
```

## Select Field Options

Options can be static, async, or dependent:

```tsx
// Static options
{ type: "select", name: "role", options: ["admin", "user", "guest"] }

// Object options
{ type: "select", name: "role", options: [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
]}

// Async options
{ type: "select", name: "country", options: async () => {
  const res = await fetch("/api/countries");
  return res.json();
}}

// Dependent options
{
  type: "select",
  name: "city",
  options: async ({ data }) => fetchCities(data.country),
  dependencies: ["country"],
  disabled: (data) => !data.country,
}
```

## Form Component Props

```tsx
<Form
  schema={schema}
  onSubmit={(data) => {}}
  defaultValues={{}}
  mode="onBlur"           // "onChange" | "onBlur" | "onSubmit"
  disabled={false}
  requireDirty={false}    // Only allow submit when dirty
  disableIfInvalid={false} // Disable submit until valid
  showSubmit={true}
  submitLabel="Submit"
  className=""
/>
```

## Compound Components (Custom Layout)

```tsx
<Form schema={schema} onSubmit={handleSubmit}>
  <FormContent className="space-y-6">
    <FormMessage />
    <FormFields />
    <FormActions align="between">
      <FormReset>Clear</FormReset>
      <FormSubmit>Save</FormSubmit>
    </FormActions>
  </FormContent>
</Form>
```

## Common Form Patterns

### Login Form

```tsx
const schema = createSchema([
  { type: "email", name: "email", label: "Email", required: true },
  { type: "password", name: "password", label: "Password", required: true },
  { type: "checkbox", name: "remember", label: "Remember me" },
]);
```

### Signup Form

```tsx
const schema = createSchema([
  {
    type: "row",
    fields: [
      { type: "text", name: "firstName", label: "First Name", required: true },
      { type: "text", name: "lastName", label: "Last Name", required: true },
    ],
  },
  { type: "email", name: "email", label: "Email", required: true },
  { type: "password", name: "password", label: "Password", required: true, minLength: 8,
    ui: { generate: true, strengthIndicator: true } },
  { type: "password", name: "confirmPassword", label: "Confirm Password", required: true,
    validate: (v, { data }) => v !== data.password ? "Passwords do not match" : true },
  { type: "checkbox", name: "terms", label: "I agree to the Terms of Service", required: true },
]);
```

### Contact Form

```tsx
const schema = createSchema([
  { type: "text", name: "name", label: "Name", required: true },
  { type: "email", name: "email", label: "Email", required: true },
  { type: "select", name: "subject", label: "Subject", required: true,
    options: ["General Inquiry", "Support", "Feedback", "Other"] },
  { type: "textarea", name: "message", label: "Message", required: true,
    rows: 5, minLength: 10 },
]);
```

### Settings / Profile Form

```tsx
const schema = createSchema([
  {
    type: "tabs",
    tabs: [
      {
        label: "Profile",
        fields: [
          { type: "upload", name: "avatar", label: "Avatar", ui: { variant: "avatar" } },
          { type: "row", fields: [
            { type: "text", name: "firstName", label: "First", required: true },
            { type: "text", name: "lastName", label: "Last", required: true },
          ]},
          { type: "textarea", name: "bio", label: "Bio", rows: 3 },
        ],
      },
      {
        label: "Notifications",
        fields: [
          { type: "switch", name: "emailNotifications", label: "Email notifications" },
          { type: "switch", name: "smsNotifications", label: "SMS notifications" },
        ],
      },
    ],
  },
]);
```

## References

For detailed per-field documentation with all properties and UI options, see [references/FIELDS.md](references/FIELDS.md).
