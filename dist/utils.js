import { z } from 'zod';
const zodCore = (zod, fn) => {
    const types = [z.ZodDefault, z.ZodNullable, z.ZodOptional];
    for (const type of types)
        if (zod instanceof type)
            return zodCore(zod._def.innerType, fn);
    if (zod instanceof z.ZodEffects)
        return zodCore(zod._def.schema, fn);
    return fn(zod);
};
const zodEnumVals = (zod) => zodCore(zod, (zod) => (zod instanceof z.ZodEnum ? zod._def.values : null));
const zodIsBoolean = (zod) => zodCore(zod, (zod) => zod instanceof z.ZodBoolean);
const zodDefault = (zod) => zod instanceof z.ZodEffects
    ? zodDefault(zod._def.schema)
    : zod instanceof z.ZodDefault
        ? zod._def.defaultValue()
        : undefined;
const utils = {
    zodCore,
    zodEnumVals,
    zodIsBoolean,
    zodDefault,
};
export default utils;
