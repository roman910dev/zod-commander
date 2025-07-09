export default {
	'./src/**/*.ts': [() => 'pnpm tsc --noEmit', 'biome ci --threads=4'],
}
