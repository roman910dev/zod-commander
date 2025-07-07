"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodCommand = exports.zodOption = exports.zodArgument = void 0;
const commander_1 = require("commander");
const kebabCase_1 = __importDefault(require("lodash/kebabCase"));
const utis_1 = __importDefault(require("./utis"));
const zodParser = (zod, opt) => (value) => {
    const result = zod.safeParse(value);
    if (result.success)
        return result.data;
    const msg = result.error.issues[0].message;
    if (opt)
        throw new commander_1.InvalidOptionArgumentError(msg);
    throw new commander_1.InvalidArgumentError(msg);
};
const zodArgument = (key, zod) => {
    const flag = zod.isOptional() ? `[${key}]` : `<${key}>`;
    const arg = new commander_1.Argument(flag, zod.description).argParser(zodParser(zod));
    if (utis_1.default.zodDefault(zod))
        arg.default(zod.parse(utis_1.default.zodDefault(zod)));
    const choices = utis_1.default.zodEnumVals(zod);
    if (choices)
        arg.choices(choices);
    return arg;
};
exports.zodArgument = zodArgument;
const zodOption = (key, zod) => {
    const abbr = zod.description?.match(/^(\w);/)?.[1];
    const description = abbr ? zod.description.slice(2) : zod.description;
    const arg = key.includes('_') ? key.split('_').slice(1).join('-') : key;
    if (key.includes('_'))
        [key] = key.split('_');
    key = (0, kebabCase_1.default)(key);
    const isBoolean = utis_1.default.zodIsBoolean(zod);
    const flag = `--${key}${isBoolean ? '' : zod.isOptional() ? ` [${arg}]` : ` <${arg}>`}`;
    const flags = abbr ? `-${abbr}, ${flag}` : flag;
    const opt = new commander_1.Option(flags, description).argParser(zodParser(zod, 'opt'));
    if (utis_1.default.zodDefault(zod))
        opt.default(zod.parse(utis_1.default.zodDefault(zod)));
    if (isBoolean)
        opt.optional = true;
    const choices = utis_1.default.zodEnumVals(zod);
    if (choices)
        opt.choices(choices);
    return opt;
};
exports.zodOption = zodOption;
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
