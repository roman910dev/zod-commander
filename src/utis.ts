import { z } from 'zod'

const zodCore = <T>(
	zod: z.ZodTypeAny,
	fn: (zod: z.ZodTypeAny) => T,
): T => {
	const types = [z.ZodDefault, z.ZodNullable, z.ZodOptional]
	for (const type of types)
		if (zod instanceof type) return zodCore(zod._def.innerType, fn)
	if (zod instanceof z.ZodEffects) return zodCore(zod._def.schema, fn)
	return fn(zod)
}

const zodEnumVals = (zod: z.ZodTypeAny) =>
	zodCore(zod, (zod) => (zod instanceof z.ZodEnum ? zod._def.values : null))

const zodIsBoolean = (zod: z.ZodTypeAny) =>
	zodCore(zod, (zod) => zod instanceof z.ZodBoolean)

const zodDefault = <Output, Def extends z.ZodTypeDef, Input>(
	zod: z.ZodType<Output, Def, Input>,
): Input | undefined =>
	zod instanceof z.ZodEffects
		? zodDefault(zod._def.schema)
		: zod instanceof z.ZodDefault
			? zod._def.defaultValue()
			: undefined

const utils = {
	zodCore,
	zodEnumVals,
	zodIsBoolean,
	zodDefault,
}

export default utils
