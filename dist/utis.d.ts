import { z } from 'zod';
declare const utils: {
    zodCore: <T>(zod: z.ZodTypeAny, fn: (zod: z.ZodTypeAny) => T) => T;
    zodEnumVals: (zod: z.ZodTypeAny) => any;
    zodIsBoolean: (zod: z.ZodTypeAny) => boolean;
    zodDefault: <Output, Def extends z.ZodTypeDef, Input>(zod: z.ZodType<Output, Def, Input>) => Input | undefined;
};
export default utils;
