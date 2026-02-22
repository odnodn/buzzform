---
name: buzzform-development
description: >
  Develop and extend the BuzzForm library and form builder. Use when adding
  new field types, modifying core logic, updating the documentation site,
  or contributing to the BuzzForm monorepo. Covers project structure,
  build system, component registry, and development workflows.
metadata:
  author: buildnbuzz
  version: "0.1"
---

# BuzzForm Development

BuzzForm is a Turborepo monorepo containing the core library and a Next.js documentation site.

## Project Structure

```
buzzform/
├── packages/
│   └── buzzform/              # Core library (@buildnbuzz/buzzform)
│       └── src/
│           ├── types/field.ts # Field type interfaces
│           ├── index.ts       # Public API (createSchema, InferType, etc.)
│           ├── schema.ts      # Schema creation and Zod generation
│           ├── rhf.ts         # React Hook Form adapter
│           └── zod.ts         # Zod resolver
├── apps/
│   └── web/                   # Next.js docs site (form.buildnbuzz.com)
│       ├── registry/
│       │   └── base/
│       │       └── fields/    # Field component implementations
│       ├── components/ui/     # shadcn/ui base components
│       ├── content/docs/      # MDX documentation
│       └── registry.json      # shadcn component registry
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20+
- pnpm 9+

## Common Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev servers (library + docs)
pnpm build                # Build all packages
pnpm lint                 # Lint all packages
pnpm check-types          # TypeScript type checking
```

### Package-specific

```bash
# Core library
pnpm --filter @buildnbuzz/buzzform build
pnpm --filter @buildnbuzz/buzzform type-check

# Web/docs
pnpm --filter web dev
pnpm --filter web build
```

## Adding a New Field Type

Follow these steps when implementing a new field type:

### 1. Define the Field Interface

Check and extend field types in `packages/buzzform/src/types/field.ts`:

- Create a new interface extending `BaseField`
- Add field-specific properties
- Add UI options in a `ui` property
- Add the new type to the `Field` union type

### 2. Check UI Component Availability

Verify the required shadcn/ui component exists in `apps/web/components/ui/`. If missing:

```bash
pnpm shadcn add <component>
```

### 3. Create Field Component

Create at `apps/web/registry/base/fields/<field-type>.tsx`:

- Export `<FieldType>Field` (e.g., `PasswordField`)
- Export `<FieldType>FieldSkeleton` (e.g., `PasswordFieldSkeleton`)
- Implement ALL properties from the field interface
- Handle all `BaseField` properties: `label`, `description`, `placeholder`, `required`, `disabled`, `readOnly`, `style.className`, `style.width`, `autoComplete`, error display, `autoFocus`
- Support conditional disabled/readOnly (function or boolean)
- Use `IconPlaceholder` from `@/components/icon-placeholder` for icons (never import directly from `lucide-react`)
- Keep components free from unnecessary comments (shadcn style)

### 4. Register in Field Registry

Update `apps/web/registry/base/fields/render.tsx`:

```tsx
import {
  NewField,
  NewFieldSkeleton,
} from "@/components/buzzform/fields/new-field";

// In defaultFieldRegistry:
"new-field": {
  kind: "data",  // or "layout"
  renderer: NewField as ComponentType<FieldRendererComponentProps>,
  skeleton: NewFieldSkeleton as ComponentType<{ field: Field }>,
},
```

### 5. Add to Registry JSON

Update `apps/web/registry.json`:

```json
{
  "name": "new-field",
  "type": "registry:ui",
  "title": "NewField",
  "description": "...",
  "dependencies": ["@buildnbuzz/buzzform"],
  "registryDependencies": ["@buzzform/init", "field"],
  "files": [
    {
      "path": "registry/base/fields/new-field.tsx",
      "type": "registry:component",
      "target": "components/buzzform/fields/new-field.tsx"
    }
  ]
}
```

### 6. Add Zod Schema Generation

If the field needs custom Zod validation, update the schema generation in `packages/buzzform/src/zod.ts` to handle the new field type's validation properties.

### 7. Build and Verify

```bash
pnpm icons:build          # If new icons were added
pnpm registry:build       # Build the component registry
pnpm tsc --noEmit -p apps/web/tsconfig.json  # Type check
```

## Adding Documentation

Documentation lives in `apps/web/content/docs/` as MDX files.

### File Structure

```
content/docs/
├── meta.json              # Navigation structure
├── index.mdx              # Introduction
├── fields/
│   ├── meta.json          # Field docs navigation
│   ├── types.mdx          # Field types overview
│   ├── data/              # Data field docs
│   │   ├── meta.json
│   │   └── <field>.mdx
│   └── layout/            # Layout field docs
│       ├── meta.json
│       └── <field>.mdx
```

### Adding a Field Type Doc

1. Create `content/docs/fields/data/<field>.mdx` or `content/docs/fields/layout/<field>.mdx`
2. Add to the appropriate `meta.json` for navigation
3. Update `fields/types.mdx` to list the new type
4. Follow existing doc patterns: title/description frontmatter, properties table, UI options table, examples

## Component Registry

BuzzForm uses the shadcn/ui component registry pattern. Users install components via:

```bash
npx shadcn@latest add https://form.buildnbuzz.com/r/<component>.json
```

The registry is defined in `apps/web/registry.json` and built with `pnpm registry:build`.

### Registry Entry Structure

Each field component needs:
- `name`: Component identifier
- `type`: Always `"registry:ui"`
- `dependencies`: npm packages required
- `registryDependencies`: Other registry components required
- `files`: Source files with target installation paths

## Core Library Architecture

### Exports

| Path                      | Provides                              |
| ------------------------- | ------------------------------------- |
| `@buildnbuzz/buzzform`    | `createSchema`, `InferType`, types    |
| `@buildnbuzz/buzzform/rhf`| `useRhf` (React Hook Form adapter)    |
| `@buildnbuzz/buzzform/zod`| `zodResolver` (Zod validation)        |

### Key Concepts

- **Schema**: Created with `createSchema(fields)`, produces `{ fields, zodSchema }`
- **Adapter Pattern**: Form state management is abstracted via adapters (currently React Hook Form)
- **Resolver Pattern**: Validation is abstracted via resolvers (currently Zod)
- **Field Registry**: Maps field types to React components, allowing runtime registration
- **Type Inference**: `InferType<typeof schema>` infers TypeScript types from field definitions

## Release Process

Uses changesets for versioning:

```bash
pnpm changeset            # Create a changeset
pnpm changeset version    # Bump versions
pnpm release              # Build and publish
```
