import {
	Argument,
	Command,
	InvalidArgumentError,
	InvalidOptionArgumentError,
	Option,
} from 'commander'
import type { z } from 'zod'
import utils from './utils'

type BeforeFirstUnderscore<S> = S extends `${infer T}_${infer _}` ? T : S

type ReplaceKeyTypes<Type extends z.ZodRawShape> = {
	[Key in keyof Type as BeforeFirstUnderscore<Key>]: Type[Key]
}

type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

/**
 * The action function signature for a Zod-powered command.
 * @template A - ZodRawShape for arguments
 * @template O - ZodRawShape for options
 * @param args - Parsed and validated arguments
 * @param opts - Parsed and validated options (with key normalization)
 * @returns A Promise or void
 */
export type ZodCommandAction<
	A extends z.ZodRawShape,
	O extends z.ZodRawShape,
> = ZodCommandProps<A, O>['action']

type ZodCommandProps<A extends z.ZodRawShape, O extends z.ZodRawShape> = {
	name: string
	description?: string
	args?: A
	opts?: O
	action: (
		args: Prettify<z.infer<z.ZodObject<A>>>,
		opts: Prettify<z.infer<z.ZodObject<ReplaceKeyTypes<O>>>>,
	) => Promise<void> | void
}

const zodParser = (zod: z.ZodTypeAny, opt?: 'opt') => (value: string) => {
	const result = zod.safeParse(value)
	if (result.success) return result.data
	const msg = result.error.issues[0].message
	if (opt) throw new InvalidOptionArgumentError(msg)
	throw new InvalidArgumentError(msg)
}

/**
 * Creates a Commander.js Argument from a Zod schema.
 * Handles optionality, default values, and enum choices.
 * @param key - The argument name
 * @param zod - The Zod schema for the argument
 * @returns A Commander Argument instance
 */
export const zodArgument = (key: string, zod: z.ZodTypeAny): Argument => {
	const flag = zod.isOptional() ? `[${key}]` : `<${key}>`
	const arg = new Argument(flag, zod.description)

	const def = utils.zodDefault(zod)
	if (def !== undefined) arg.default(zod.parse(def))

	const choices = utils.zodEnumVals(zod)
	if (choices) arg.choices(choices)

	// parsing must be done at the end to override default parsers
	return arg.argParser(zodParser(zod))
}

/**
 * Creates a Commander.js Option from a Zod schema.
 * Handles optionality, default values, enum choices, and boolean flags.
 * Supports short flags via description prefix (e.g., 's;...').
 * @param key - The option name (can include underscores for grouping)
 * @param zod - The Zod schema for the option
 * @returns A Commander Option instance
 */
export const zodOption = (key: string, zod: z.ZodTypeAny): Option => {
	const abbr = zod.description?.match(/^(\w);/)?.[1]
	const description = abbr ? zod.description.slice(2) : zod.description
	const arg = key.includes('_') ? key.split('_').slice(1).join('-') : key
	if (key.includes('_')) [key] = key.split('_')
	const isBoolean = utils.zodIsBoolean(zod)
	const flag = `--${key}${isBoolean ? '' : zod.isOptional() ? ` [${arg}]` : ` <${arg}>`}`
	const flags = abbr ? `-${abbr}, ${flag}` : flag
	const opt = new Option(flags, description)

	if (isBoolean) opt.optional = true

	const def = utils.zodDefault(zod)
	if (def !== undefined) opt.default(zod.parse(def))

	const choices = utils.zodEnumVals(zod)
	if (choices) opt.choices(choices)

	// parsing must be done at the end to override default parsers
	return opt.argParser(zodParser(zod, 'opt'))
}

/**
 * Defines a Commander.js Command using Zod schemas for arguments and options.
 * Automatically wires up parsing, validation, and help configuration.
 * @template A - ZodRawShape for arguments
 * @template O - ZodRawShape for options
 * @param props - Command properties (name, description, args, opts, action)
 * @returns A Commander Command instance
 */
export const zodCommand = <A extends z.ZodRawShape, O extends z.ZodRawShape>({
	name,
	description,
	args,
	opts,
	action,
}: ZodCommandProps<A, O>): Command => {
	const command = new Command(name)
	if (description) command.description(description)
	for (const key in args) command.addArgument(zodArgument(key, args[key]))
	for (const key in opts) command.addOption(zodOption(key, opts[key]))
	command.action(async (...all) => {
		const resultArgs = Object.fromEntries(
			Object.keys(args ?? {}).map((key, i) => [key, all[i]]),
		) as z.infer<z.ZodObject<A>>
		const resultOpts = all[Object.keys(args ?? {}).length] as z.infer<
			z.ZodObject<ReplaceKeyTypes<O>>
		>
		await action(resultArgs, resultOpts)
	})
	command.configureHelp({ showGlobalOptions: true })
	return command
}
