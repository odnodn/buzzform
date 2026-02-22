import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Wraps the fumadocs search handler for the /api/search route.
// In GitHub Pages builds this module is swapped with search-route.static.ts
// via Turbopack resolveAlias in next.config.mjs.
const handler = createFromSource(source, {
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: 'english',
});

export const searchRoute = {
    GET: handler.GET,
};
