export default {
	'./src/**/*.ts': [
		() => 'pnpm build',
		'pnpm biome ci --threads=4',
		'pnpm test',
	],
}
