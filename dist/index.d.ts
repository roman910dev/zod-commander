import { Argument, Command, Option } from 'commander';
import type { z } from 'zod';
type BeforeFirstUnderscore<S> = S extends `${infer T}_${infer _}` ? T : S;
type ReplaceKeyTypes<Type extends z.ZodRawShape> = {
    [Key in keyof Type as BeforeFirstUnderscore<Key>]: Type[Key];
};
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * The action function signature for a Zod-powered command.
 * @template A - ZodRawShape for arguments
 * @template O - ZodRawShape for options
 * @param args - Parsed and validated arguments
 * @param opts - Parsed and validated options (with key normalization)
 * @returns A Promise or void
 */
export type ZodCommandAction<A extends z.ZodRawShape, O extends z.ZodRawShape> = ZodCommandProps<A, O>['action'];
type ZodCommandProps<A extends z.ZodRawShape, O extends z.ZodRawShape> = {
    name: string;
    description?: string;
    args?: A;
    opts?: O;
    action: (args: Prettify<z.infer<z.ZodObject<A>>>, opts: Prettify<z.infer<z.ZodObject<ReplaceKeyTypes<O>>>>) => Promise<void> | void;
};
/**
 * Creates a Commander.js Argument from a Zod schema.
 * Handles optionality, default values, and enum choices.
 * @param key - The argument name
 * @param zod - The Zod schema for the argument
 * @returns A Commander Argument instance
 */
export declare const zodArgument: (key: string, zod: z.ZodTypeAny) => Argument;
/**
 * Creates a Commander.js Option from a Zod schema.
 * Handles optionality, default values, enum choices, and boolean flags.
 * Supports short flags via description prefix (e.g., 's;...').
 * @param key - The option name (can include underscores for grouping)
 * @param zod - The Zod schema for the option
 * @returns A Commander Option instance
 */
export declare const zodOption: (key: string, zod: z.ZodTypeAny) => Option;
/**
 * Defines a Commander.js Command using Zod schemas for arguments and options.
 * Automatically wires up parsing, validation, and help configuration.
 * @template A - ZodRawShape for arguments
 * @template O - ZodRawShape for options
 * @param props - Command properties (name, description, args, opts, action)
 * @returns A Commander Command instance
 */
export declare const zodCommand: <A extends z.ZodRawShape, O extends z.ZodRawShape>({ name, description, args, opts, action, }: ZodCommandProps<A, O>) => Command;
export {};
