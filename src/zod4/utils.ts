import { z } from 'zod/v4'

const zodCore = <T>(
	zod: z.core.$ZodType,
	fn: (zod: z.core.$ZodType) => T,
): T => {
	const types = [z.ZodDefault, z.ZodNullable, z.ZodOptional]
	for (const type of types)
		if (zod instanceof type) return zodCore(zod.def.innerType, fn)
	if (zod instanceof z.ZodPipe) return zodCore(zod.def.in, fn)
	return fn(zod)
}

const zodEnumVals = (zod: z.ZodTypeAny): z.core.util.EnumValue[] | null =>
	zodCore(zod, (zod) => (zod instanceof z.ZodEnum ? zod.options : null))

const zodIsBoolean = (zod: z.ZodTypeAny): boolean =>
	zodCore(zod, (zod) => zod instanceof z.ZodBoolean)

const zodIsOptional = (zod: z.ZodType): boolean =>
	zod.safeParse(undefined).success

const zodDefault = <Output, Input>(
	zod: z.ZodType<Output, Input>,
): Input | undefined =>
	zod instanceof z.ZodPipe
		? zodDefault(zod.def.in as z.ZodType<unknown, Input>)
		: zod instanceof z.ZodDefault
			? (zod.def.defaultValue as Input)
			: undefined

const utils = {
	zodCore,
	zodEnumVals,
	zodIsBoolean,
	zodIsOptional,
	zodDefault,
}

export default utils
