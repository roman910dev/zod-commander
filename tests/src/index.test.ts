import { describe, expect, test } from '@jest/globals'
import type { Command } from 'commander'
import { z } from 'zod'
import { zodCommand } from '#/index'
import { expectExit } from './utils'

const name = 'cmd'

// const action = (args: Record<string, unknown>, opts: Record<string, unknown>) =>
// 	console.log(JSON.stringify({ args, opts }, null, 2))

const checker: {
	args: Record<string, unknown> | undefined
	opts: Record<string, unknown> | undefined
} = {
	args: undefined,
	opts: undefined,
}

const action =
	(obj: Record<string, unknown>) =>
	(args: Record<string, unknown>, opts: Record<string, unknown>) => {
		obj.args = args
		obj.opts = opts
	}

const getOptHelp = (command: Command, arg: string) => {
	const spl = command
		.helpInformation()
		.split('\n')
		.find((line) => line.includes(`--${arg}`))
		?.split('  ')
	return spl?.[spl.length - 1]
}

const getArgHelp = (command: Command, arg: string) => {
	const spl = command
		.helpInformation()
		.split('Arguments:')[1]
		.split('\n')
		.map((v) => v.trim())
		.find((line) => line.startsWith(arg))
		?.split('  ')
	return spl?.[spl.length - 1]
}

describe('arguments', () => {
	describe('number', () => {
		const command = zodCommand({
			name,
			args: { number: z.coerce.number().describe('Number') },
			action: action(checker),
		})

		test('help', () => expect(getArgHelp(command, 'number')).toBe('Number'))

		test('parse', () => {
			command.parse(['node', name, '910'])
			expect(checker.args).toEqual({ number: 910 })
		})
	})

	describe('optional boolean', () => {
		const command = zodCommand({
			name,
			args: {
				bool: z
					.enum(['true', 'false'])
					.transform((v) => v === 'true')
					.optional()
					.describe('Boolean'),
			},
			action: action(checker),
		})

		test('help', () =>
			expect(getArgHelp(command, 'bool')).toBe(
				'Boolean (choices: "true", "false")',
			))

		describe('parse', () => {
			test('true', () => {
				command.parse(['node', name, 'true'])
				expect(checker.args).toEqual({ bool: true })
			})

			test('false', () => {
				command.parse(['node', name, 'false'])
				expect(checker.args).toEqual({ bool: false })
			})

			test('undefined', () => {
				command.parse(['node', name])
				expect(checker.args).toEqual({ bool: undefined })
			})
		})
	})
})

describe('options', () => {
	describe('number', () => {
		const command = zodCommand({
			name,
			opts: { number: z.coerce.number().describe('Number') },
			action: action(checker),
		})

		test('help', () => expect(getOptHelp(command, 'number')).toBe('Number'))

		test('parse', () => {
			command.parse(['node', name, '--number', '910'])
			expect(checker.opts).toEqual({ number: 910 })
		})
	})

	describe('flag', () => {
		const command = zodCommand({
			name,
			opts: { flag: z.boolean().default(false).describe('Flag') },
			action: action(checker),
		})

		test('help', () =>
			expect(getOptHelp(command, 'flag')).toBe('Flag (default: false)'))

		describe('parse', () => {
			test('present flag', () => {
				command.parse(['node', name, '--flag'])
				expect(checker.opts).toEqual({ flag: true })
			})

			test('absent flag', () => {
				command.parse(['node', name])
				expect(checker.opts).toEqual({ flag: false })
			})
		})
	})

	describe('required string', () => {
		const command = zodCommand({
			name,
			opts: { string: z.string().describe('String') },
			action: action(checker),
		})

		test('help', () => expect(getOptHelp(command, 'string')).toBe('String'))

		describe('parse', () => {
			test('present string', () => {
				command.parse(['node', name, '--string', 'hello'])
				expect(checker.opts).toEqual({ string: 'hello' })
			})

			test('fail: absent string', () => {
				expectExit(() => command.parse(['node', name]), 1)
			})
		})
	})

	describe('optional boolean', () => {
		const command = zodCommand({
			name,
			opts: {
				bool: z
					.enum(['true', 'false'])
					.transform((v) => v === 'true')
					.default('true')
					.describe('Boolean'),
			},
			action: action(checker),
		})

		test('help', () =>
			expect(getOptHelp(command, 'bool')).toBe(
				'Boolean (choices: "true", "false", default: true)',
			))

		describe('parse', () => {
			test('true', () => {
				command.parse(['node', name, '--bool', 'true'])
				expect(checker.opts).toEqual({ bool: true })
			})

			test('false', () => {
				command.parse(['node', name, '--bool', 'false'])
				expect(checker.opts).toEqual({ bool: false })
			})

			test('undefined', () => {
				command.parse(['node', name])
				expect(checker.opts).toEqual({ bool: true })
			})
		})
	})

	describe('required boolean', () => {
		const command = zodCommand({
			name,
			opts: {
				bool: z
					.enum(['true', 'false'])
					.transform((v) => v === 'true')
					.describe('Boolean'),
			},
			action: action(checker),
		})

		test('help', () =>
			expect(getOptHelp(command, 'bool')).toBe(
				'Boolean (choices: "true", "false")',
			))

		describe('parse', () => {
			test('true', () => {
				command.parse(['node', name, '--bool', 'true'])
				expect(checker.opts).toEqual({ bool: true })
			})

			test('false', () => {
				command.parse(['node', name, '--bool', 'false'])
				expect(checker.opts).toEqual({ bool: false })
			})

			test('fail: undefined', () => {
				expectExit(() => command.parse(['node', name]), 1)
			})
		})
	})
})
