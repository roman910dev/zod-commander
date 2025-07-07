import { Argument, Command, Option } from 'commander';
import type { z } from 'zod';
type BeforeFirstUnderscore<S> = S extends `${infer T}_${infer _}` ? T : S;
type ReplaceKeyTypes<Type extends z.ZodRawShape> = {
    [Key in keyof Type as BeforeFirstUnderscore<Key>]: Type[Key];
};
export type ZodCommandAction<A extends z.ZodRawShape, O extends z.ZodRawShape> = (args: z.infer<z.ZodObject<A>>, opts: z.infer<z.ZodObject<ReplaceKeyTypes<O>>>) => Promise<void> | void;
type ZodCommandProps<A extends z.ZodRawShape, O extends z.ZodRawShape> = {
    name: string;
    description?: string;
    args?: A;
    opts?: O;
    action: ZodCommandAction<A, O>;
};
export declare const zodArgument: (key: string, zod: z.ZodTypeAny) => Argument;
export declare const zodOption: (key: string, zod: z.ZodTypeAny) => Option;
export declare const zodCommand: <A extends z.ZodRawShape, O extends z.ZodRawShape>({ name, description, args, opts, action, }: ZodCommandProps<A, O>) => Command;
export {};
