"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodCommand = exports.zodOption = exports.zodArgument = void 0;
const commander_1 = require("commander");
const utils_1 = __importDefault(require("./utils"));
const zodParser = (zod, opt) => (value) => {
    const result = zod.safeParse(value);
    if (result.success)
        return result.data;
    const msg = result.error.issues[0].message;
    if (opt)
        throw new commander_1.InvalidOptionArgumentError(msg);
    throw new commander_1.InvalidArgumentError(msg);
};
/**
 * Creates a Commander.js Argument from a Zod schema.
 * Handles optionality, default values, and enum choices.
 * @param key - The argument name
 * @param zod - The Zod schema for the argument
 * @returns A Commander Argument instance
 */
const zodArgument = (key, zod) => {
    const flag = zod.isOptional() ? `[${key}]` : `<${key}>`;
    const arg = new commander_1.Argument(flag, zod.description).argParser(zodParser(zod));
    if (utils_1.default.zodDefault(zod))
        arg.default(zod.parse(utils_1.default.zodDefault(zod)));
    const choices = utils_1.default.zodEnumVals(zod);
    if (choices)
        arg.choices(choices);
    return arg;
};
exports.zodArgument = zodArgument;
/**
 * Creates a Commander.js Option from a Zod schema.
 * Handles optionality, default values, enum choices, and boolean flags.
 * Supports short flags via description prefix (e.g., 's;...').
 * @param key - The option name (can include underscores for grouping)
 * @param zod - The Zod schema for the option
 * @returns A Commander Option instance
 */
const zodOption = (key, zod) => {
    const abbr = zod.description?.match(/^(\w);/)?.[1];
    const description = abbr ? zod.description.slice(2) : zod.description;
    const arg = key.includes('_') ? key.split('_').slice(1).join('-') : key;
    if (key.includes('_'))
        [key] = key.split('_');
    const isBoolean = utils_1.default.zodIsBoolean(zod);
    const flag = `--${key}${isBoolean ? '' : zod.isOptional() ? ` [${arg}]` : ` <${arg}>`}`;
    const flags = abbr ? `-${abbr}, ${flag}` : flag;
    const opt = new commander_1.Option(flags, description);
    const def = utils_1.default.zodDefault(zod);
    if (def !== undefined)
        opt.default(zod.parse(def));
    if (isBoolean)
        opt.optional = true;
    const choices = utils_1.default.zodEnumVals(zod);
    if (choices)
        opt.choices(choices);
    // parsing must be done at the end to override default parsers
    return opt.argParser(zodParser(zod, 'opt'));
};
exports.zodOption = zodOption;
/**
 * Defines a Commander.js Command using Zod schemas for arguments and options.
 * Automatically wires up parsing, validation, and help configuration.
 * @template A - ZodRawShape for arguments
 * @template O - ZodRawShape for options
 * @param props - Command properties (name, description, args, opts, action)
 * @returns A Commander Command instance
 */
const zodCommand = ({ name, description, args, opts, action, }) => {
    const command = new commander_1.Command(name);
    if (description)
        command.description(description);
    for (const key in args)
        command.addArgument((0, exports.zodArgument)(key, args[key]));
    for (const key in opts)
        command.addOption((0, exports.zodOption)(key, opts[key]));
    command.action(async (...all) => {
        const resultArgs = Object.fromEntries(Object.keys(args ?? {}).map((key, i) => [key, all[i]]));
        const resultOpts = all[Object.keys(args ?? {}).length];
        await action(resultArgs, resultOpts);
    });
    command.configureHelp({ showGlobalOptions: true });
    return command;
};
exports.zodCommand = zodCommand;
