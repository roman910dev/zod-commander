/** @type {import('jest').Config} */
const config = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
				useESM: true,
			},
		],
	},
	moduleNameMapper: {
		'^#/(.*)$': '<rootDir>/src/$1',
	},
}

export default config
