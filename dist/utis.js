"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const zodCore = (zod, fn) => {
    const types = [zod_1.z.ZodDefault, zod_1.z.ZodNullable, zod_1.z.ZodOptional];
    for (const type of types)
        if (zod instanceof type)
            return zodCore(zod._def.innerType, fn);
    if (zod instanceof zod_1.z.ZodEffects)
        return zodCore(zod._def.schema, fn);
    return fn(zod);
};
const zodEnumVals = (zod) => zodCore(zod, (zod) => (zod instanceof zod_1.z.ZodEnum ? zod._def.values : null));
const zodIsBoolean = (zod) => zodCore(zod, (zod) => zod instanceof zod_1.z.ZodBoolean);
const zodDefault = (zod) => zod instanceof zod_1.z.ZodEffects
    ? zodDefault(zod._def.schema)
    : zod instanceof zod_1.z.ZodDefault
        ? zod._def.defaultValue()
        : undefined;
const utils = {
    zodCore,
    zodEnumVals,
    zodIsBoolean,
    zodDefault,
};
exports.default = utils;
