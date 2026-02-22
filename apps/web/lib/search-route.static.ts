import { NextResponse } from 'next/server';

// Static stub for the /api/search route used in GitHub Pages builds.
// Search is disabled in the docs layout for these builds so this
// endpoint will never be called, but Next.js still needs a valid
// static GET handler when using `output: "export"`.
export const searchRoute = {
    GET: () => NextResponse.json([]),
};
