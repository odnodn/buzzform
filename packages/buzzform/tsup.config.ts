import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        'index': 'src/index.ts',
        'rhf': 'src/adapters/rhf.ts',
        'tanstack': 'src/adapters/tanstack.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ['react', 'react-hook-form', '@tanstack/react-form'],
})