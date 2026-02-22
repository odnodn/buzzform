# BuzzForm Field Reference

Detailed properties for every BuzzForm field type. All fields also accept [common properties](#common-properties).

## Common Properties

| Property       | Type                           | Description                         |
| -------------- | ------------------------------ | ----------------------------------- |
| `type`         | `string`                       | Field type (required)               |
| `name`         | `string`                       | Key in form data (required)         |
| `label`        | `string \| ReactNode \| false` | Display label                       |
| `description`  | `string \| ReactNode`          | Help text below field               |
| `placeholder`  | `string`                       | Placeholder text                    |
| `required`     | `boolean`                      | Whether field is required           |
| `disabled`     | `boolean \| (data) => boolean` | Disable input                       |
| `hidden`       | `boolean \| (data) => boolean` | Hide field (keeps value)            |
| `readOnly`     | `boolean \| (data) => boolean` | Read-only mode                      |
| `defaultValue` | `any`                          | Initial value                       |
| `schema`       | `ZodSchema`                    | Direct Zod schema override          |
| `validate`     | `(value, ctx) => true \| string` | Custom validation                 |
| `condition`    | `(data, siblingData, ctx) => boolean` | Conditional visibility (unregisters when false) |
| `autoComplete` | `string`                       | HTML autocomplete attribute         |
| `style`        | `{ className?: string, width?: string \| number }` | Styling       |
| `meta`         | `object`                       | Custom metadata for extensions      |

---

## Text Field (`type: "text"`)

| Prop        | Type     | Description              |
| ----------- | -------- | ------------------------ |
| `minLength` | `number` | Minimum character length |
| `maxLength` | `number` | Maximum character length |
| `pattern`   | `RegExp` | Regex validation         |

| UI Option    | Type      | Default | Description      |
| ------------ | --------- | ------- | ---------------- |
| `ui.copyable`| `boolean` | `false` | Show copy button |

---

## Email Field (`type: "email"`)

Same as text, with automatic email format validation. Supports `ui.copyable`.

---

## Password Field (`type: "password"`)

| Prop        | Type     | Description              |
| ----------- | -------- | ------------------------ |
| `minLength` | `number` | Minimum character length |
| `maxLength` | `number` | Maximum character length |
| `criteria`  | `object` | Password requirements    |

| UI Option                | Type      | Default | Description                |
| ------------------------ | --------- | ------- | -------------------------- |
| `ui.generate`            | `boolean` | `false` | Show password generator    |
| `ui.strengthIndicator`   | `boolean` | `false` | Show strength meter        |
| `ui.showRequirements`    | `boolean` | `false` | Show requirements checklist|

---

## Textarea Field (`type: "textarea"`)

| Prop         | Type      | Default | Description              |
| ------------ | --------- | ------- | ------------------------ |
| `rows`       | `number`  | `3`     | Visible rows             |
| `autoResize` | `boolean` | `false` | Auto-grow with content   |
| `minLength`  | `number`  | -       | Minimum character length |
| `maxLength`  | `number`  | -       | Maximum character length |

| UI Option    | Type      | Default | Description      |
| ------------ | --------- | ------- | ---------------- |
| `ui.copyable`| `boolean` | `false` | Show copy button |

---

## Number Field (`type: "number"`)

| Prop        | Type     | Description    |
| ----------- | -------- | -------------- |
| `min`       | `number` | Minimum value  |
| `max`       | `number` | Maximum value  |
| `precision` | `number` | Decimal places |

| UI Option              | Type                                        | Default     | Description            |
| ---------------------- | ------------------------------------------- | ----------- | ---------------------- |
| `ui.step`              | `number`                                    | `1`         | Increment amount       |
| `ui.variant`           | `'default' \| 'stacked' \| 'pill' \| 'plain'` | `'default'` | Stepper style       |
| `ui.prefix`            | `string`                                    | -           | Prefix text (e.g. "$")|
| `ui.suffix`            | `string`                                    | -           | Suffix text (e.g. "kg")|
| `ui.thousandSeparator` | `boolean \| string`                         | `false`     | Format with separators |
| `ui.hideSteppers`      | `boolean`                                   | `false`     | Hide +/- buttons       |
| `ui.copyable`          | `boolean`                                   | `false`     | Show copy button       |

---

## Date Field (`type: "date"`)

| Prop      | Type             | Description          |
| --------- | ---------------- | -------------------- |
| `minDate` | `Date \| string` | Earliest allowed     |
| `maxDate` | `Date \| string` | Latest allowed       |

| UI Option        | Type              | Default | Description          |
| ---------------- | ----------------- | ------- | -------------------- |
| `ui.format`      | `string`          | `"PPP"` | Display format       |
| `ui.inputFormat` | `string`          | -       | Manual input format  |
| `ui.presets`     | `boolean \| Array`| -       | Quick date presets   |

---

## Datetime Field (`type: "datetime"`)

Same as date, plus:

| UI Option                     | Type      | Default | Description         |
| ----------------------------- | --------- | ------- | ------------------- |
| `ui.timePicker.interval`      | `number`  | `15`    | Time step (minutes) |
| `ui.timePicker.use24hr`       | `boolean` | `false` | 24-hour format      |
| `ui.timePicker.includeSeconds`| `boolean` | `false` | Show seconds        |

---

## Select Field (`type: "select"`)

| Prop           | Type                          | Description                    |
| -------------- | ----------------------------- | ------------------------------ |
| `options`      | `string[] \| object[] \| fn`  | Dropdown options               |
| `dependencies` | `string[]`                    | Fields that trigger refetch    |

| UI Option          | Type      | Default | Description          |
| ------------------ | --------- | ------- | -------------------- |
| `ui.searchable`    | `boolean` | `false` | Enable search        |
| `ui.multiSelect`   | `boolean` | `false` | Allow multiple       |
| `ui.clearable`     | `boolean` | `false` | Show clear button    |
| `ui.creatable`     | `boolean` | `false` | Allow creating       |

---

## Radio Field (`type: "radio"`)

| Prop           | Type                         | Description                 |
| -------------- | ---------------------------- | --------------------------- |
| `options`      | `string[] \| object[] \| fn` | Radio options               |
| `dependencies` | `string[]`                   | Fields that trigger refetch |

| UI Option         | Type                               | Default      | Description    |
| ----------------- | ---------------------------------- | ------------ | -------------- |
| `ui.variant`      | `'default' \| 'card'`              | `'default'`  | Visual style   |
| `ui.direction`    | `'vertical' \| 'horizontal'`       | `'vertical'` | Layout         |
| `ui.columns`      | `1 \| 2 \| 3 \| 4`                 | -            | Grid columns   |
| `ui.card.size`    | `'sm' \| 'md' \| 'lg'`             | `'md'`       | Card size      |
| `ui.card.bordered`| `boolean`                          | `true`       | Card border    |

---

## Checkbox Field (`type: "checkbox"`)

| Prop           | Type      | Default | Description              |
| -------------- | --------- | ------- | ------------------------ |
| `required`     | `boolean` | `false` | Must be checked          |
| `defaultValue` | `boolean` | `false` | Initial checked state    |

---

## Checkbox Group Field (`type: "checkbox-group"`)

| Prop          | Type                         | Description                     |
| ------------- | ---------------------------- | ------------------------------- |
| `options`     | `string[] \| object[] \| fn` | Available options               |
| `minSelected` | `number`                     | Minimum selections              |
| `maxSelected` | `number`                     | Maximum selections              |

| UI Option          | Type                               | Default      | Description    |
| ------------------ | ---------------------------------- | ------------ | -------------- |
| `ui.variant`       | `'default' \| 'card'`              | `'default'`  | Visual style   |
| `ui.direction`     | `'vertical' \| 'horizontal'`       | `'vertical'` | Layout         |
| `ui.columns`       | `1 \| 2 \| 3 \| 4`                 | -            | Grid columns   |
| `ui.card.size`     | `'sm' \| 'md' \| 'lg'`             | `'md'`       | Card size      |
| `ui.card.bordered` | `boolean`                          | `true`       | Card border    |

---

## Switch Field (`type: "switch"`)

| Prop           | Type      | Default | Description           |
| -------------- | --------- | ------- | --------------------- |
| `defaultValue` | `boolean` | `false` | Initial state         |

| UI Option        | Type                                | Default     | Description      |
| ---------------- | ----------------------------------- | ----------- | ---------------- |
| `ui.alignment`   | `'start' \| 'end' \| 'between'`     | `'between'` | Switch position  |

---

## Tags Field (`type: "tags"`)

| Prop             | Type      | Default | Description              |
| ---------------- | --------- | ------- | ------------------------ |
| `minTags`        | `number`  | -       | Minimum tags             |
| `maxTags`        | `number`  | -       | Maximum tags             |
| `maxTagLength`   | `number`  | -       | Max characters per tag   |
| `allowDuplicates`| `boolean` | `false` | Allow duplicate values   |

| UI Option        | Type                                 | Default     | Description      |
| ---------------- | ------------------------------------ | ----------- | ---------------- |
| `ui.delimiters`  | `Array`                              | `['enter']` | Tag creation keys|
| `ui.variant`     | `'chips' \| 'pills' \| 'inline'`     | `'chips'`   | Visual style     |
| `ui.copyable`    | `boolean`                            | `false`     | Copy all tags    |

---

## Upload Field (`type: "upload"`)

| Prop       | Type      | Default | Description              |
| ---------- | --------- | ------- | ------------------------ |
| `hasMany`  | `boolean` | `false` | Allow multiple files     |
| `minFiles` | `number`  | -       | Minimum files            |
| `maxFiles` | `number`  | -       | Maximum files            |
| `maxSize`  | `number`  | -       | Max file size (bytes)    |

| UI Option          | Type                                             | Default      | Description         |
| ------------------ | ------------------------------------------------ | ------------ | ------------------- |
| `ui.accept`        | `string`                                         | `"*"`        | MIME filter          |
| `ui.variant`       | `'dropzone' \| 'avatar' \| 'inline' \| 'gallery'`| `'dropzone'` | Visual style        |
| `ui.shape`         | `'circle' \| 'square' \| 'rounded'`               | `'rounded'`  | Avatar shape        |
| `ui.size`          | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`            | `'md'`       | Size preset         |
| `ui.crop`          | `boolean \| object`                              | -            | Enable cropping     |
| `ui.showProgress`  | `boolean`                                        | `true`       | Upload progress     |
| `ui.dropzoneText`  | `string`                                         | -            | Custom message      |

---

## Row Field (`type: "row"`)

| Prop   | Type      | Description              |
| ------ | --------- | ------------------------ |
| `fields` | `Field[]` | Fields to lay out      |

| UI Option        | Type                                            | Default | Description       |
| ---------------- | ----------------------------------------------- | ------- | ----------------- |
| `ui.gap`         | `'sm' \| 'md' \| 'lg'`                          | `'md'`  | Gap between fields|
| `ui.align`       | `'start' \| 'center' \| 'end' \| 'stretch'`     | -       | Vertical align    |
| `ui.responsive`  | `boolean`                                       | `true`  | Stack on mobile   |

---

## Group Field (`type: "group"`)

| Prop   | Type      | Description              |
| ------ | --------- | ------------------------ |
| `fields` | `Field[]` | Fields inside group    |

| UI Option            | Type                                               | Default      | Description         |
| -------------------- | -------------------------------------------------- | ------------ | ------------------- |
| `ui.variant`         | `'card' \| 'flat' \| 'ghost' \| 'bordered'`        | `'bordered'` | Visual style        |
| `ui.collapsible`     | `boolean`                                          | `false`      | Allow collapse      |
| `ui.defaultCollapsed`| `boolean`                                          | `false`      | Start collapsed     |
| `ui.showErrorBadge`  | `boolean`                                          | `true`       | Error count badge   |

---

## Collapsible Field (`type: "collapsible"`)

| Prop        | Type      | Default | Description        |
| ----------- | --------- | ------- | ------------------ |
| `fields`    | `Field[]` | -       | Fields inside      |
| `collapsed` | `boolean` | `false` | Start collapsed    |

| UI Option            | Type                                               | Default      | Description        |
| -------------------- | -------------------------------------------------- | ------------ | ------------------ |
| `ui.variant`         | `'card' \| 'flat' \| 'ghost' \| 'bordered'`        | `'bordered'` | Visual style       |
| `ui.spacing`         | `'sm' \| 'md' \| 'lg'`                              | `'md'`       | Field spacing      |
| `ui.showErrorBadge`  | `boolean`                                          | `true`       | Error count badge  |
| `ui.description`     | `string`                                           | -            | Section description|
| `ui.icon`            | `ReactNode`                                        | -            | Section icon       |

---

## Tabs Field (`type: "tabs"`)

| Prop   | Type                              | Description         |
| ------ | --------------------------------- | ------------------- |
| `tabs` | `Array<{ label, fields, icon? }>` | Tab definitions     |
| `name` | `string`                          | Optional: creates nested object if provided |

| UI Option            | Type      | Default | Description          |
| -------------------- | --------- | ------- | -------------------- |
| `ui.defaultTab`      | `number`  | `0`     | Initially active tab |
| `ui.showErrorBadge`  | `boolean` | `true`  | Error count per tab  |

---

## Array Field (`type: "array"`)

| Prop      | Type      | Description              |
| --------- | --------- | ------------------------ |
| `fields`  | `Field[]` | Fields per item          |
| `minRows` | `number`  | Minimum items            |
| `maxRows` | `number`  | Maximum items            |

| UI Option            | Type                      | Default | Description           |
| -------------------- | ------------------------- | ------- | --------------------- |
| `ui.reorderable`     | `boolean`                 | `false` | Drag-drop reordering  |
| `ui.collapsible`     | `boolean`                 | `false` | Collapse items        |
| `ui.confirmDelete`   | `boolean`                 | `false` | Confirm before delete |
| `ui.addLabel`        | `string`                  | -       | Custom add button text|
| `ui.itemLabel`       | `string \| (index) => string` | -  | Row label template    |
