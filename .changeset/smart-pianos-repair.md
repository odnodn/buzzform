---
"@buildnbuzz/buzzform": patch
---

**Fixes**
- Hardened `createArrayHelpers` to normalize non-array values before array mutations.
- Fixed runtime failure (`current is not iterable`) when an array path resolves to a non-array value.
- Improved `fields()` mapping for non-object items while preserving stable row IDs.
