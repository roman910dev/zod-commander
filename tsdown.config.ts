import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/zod3/index.ts', 'src/zod4/index.ts'],
	outDir: 'dist',
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	target: 'es2022',
	minify: false,
	outputOptions: { keepNames: true },
})
