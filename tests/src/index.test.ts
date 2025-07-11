import { zodCommand } from '#/index'
import { describe, expect, test } from '@jest/globals'
import { z } from 'zod'

const name = 'cmd'

// const action = (args: Record<string, unknown>, opts: Record<string, unknown>) =>
// 	console.log(JSON.stringify({ args, opts }, null, 2))

const mkChecker = (): {
	args: Record<string, unknown> | undefined
	opts: Record<string, unknown> | undefined
} => ({
	args: undefined,
	opts: undefined,
})

const action =
	(obj: Record<string, unknown>) =>
	(args: Record<string, unknown>, opts: Record<string, unknown>) => {
		obj.args = args
		obj.opts = opts
	}

describe('parse', () => {
	test('parse a number', () => {
		const checker = mkChecker()
		const command = zodCommand({
			name,
			args: { number: z.coerce.number() },
			action: action(checker),
		})

		command.parse(['node', name, '910'])
		expect(checker.args).toEqual({ number: 910 })
	})

	describe('parse a flag', () => {
		const checker = mkChecker()
		const command = zodCommand({
			name,
			opts: { flag: z.boolean().default(false) },
			action: action(checker),
		})

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
