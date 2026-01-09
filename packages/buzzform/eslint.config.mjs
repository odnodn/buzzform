import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      // Unused variables - warn for unused variables, allow underscore prefix to ignore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Unused imports - handled by no-unused-vars for TypeScript

      // Explicit any - warn instead of error for flexibility
      "@typescript-eslint/no-explicit-any": "warn",

      // Empty functions - allow with comment explanation
      "@typescript-eslint/no-empty-function": "warn",

      // Require explicit return types on exported functions
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Allow non-null assertions where developer is confident
      "@typescript-eslint/no-non-null-assertion": "off",

      // Consistent type imports (optional, for cleaner imports)
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.*"],
  }
);
