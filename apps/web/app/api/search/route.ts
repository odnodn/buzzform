import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Route handlers with `force-dynamic` are excluded from Next.js static exports
// (output: "export") so this route won't be present in GitHub Pages deployments.
// Search is disabled in the docs layout for GitHub Pages builds to match.
export const dynamic = 'force-dynamic';

export const { GET } = createFromSource(source, {
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: 'english',
});