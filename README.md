# zod-commander

A TypeScript utility for building type-safe CLI commands using [commander](https://www.npmjs.com/package/commander) and [zod](https://www.npmjs.com/package/zod).

## Usage

`zod-commander` lets you define type-safe CLI commands using [zod](https://github.com/colinhacks/zod) schemas for arguments and options, with a simple API.

```ts
import { Command } from 'commander'
import { z } from 'zod'
import { zodCommand } from 'zod-commander'

// Define a command using zodCommand
const greet = zodCommand({
  name: 'greet',
  summary: 'Say hello',
  description: 'Say hello to someone',
  args: {
    name: z.string().describe('Name of the person to greet'),
  },
  opts: {
    excited: z.boolean().prefault(false).describe('e;Add an exclamation mark'), // 'e;' makes -e an alias
  },
  async action({ name }, { excited }) {
    console.log(`Hello, ${name}${excited ? '!' : '.'}`)
  },
})

// Create a CLI program and add the command
const program = new Command()
program
  .name('my-cli')
  .description('A demo CLI using zod-commander')
  .version('1.0.0')
  .addCommand(greet)
  .parseAsync(process.argv)
```

### Features

- **Type-safe arguments and options**: Use zod schemas to define and validate CLI inputs.
- **Booleans are treated as flags**: Any boolean option automatically becomes a CLI flag (e.g. `--excited`).
- **Descriptive help**: `.describe()` on schemas provides help text for each argument/option.
- **Default values**: Use `.default()` on zod schemas for default option values.
- **Async actions**: The `action` function can be async and receives parsed args and opts.
- **No boilerplate**: Just export your command; integrate with your CLI runner as needed.
- **Aliases for options**: If you start a description with a letter and a semicolon (e.g. `"f;The file to export to"`), that letter will be used as a short alias (e.g. `-f`).
- **Perfect help output**: The generated help text is clear and complete—try running your command with `--help` to see for yourself!

> [!NOTE]
> When using zod `v4`, you will usually want to use [`.prefault()`](https://zod.dev/v4/changelog#default-updates) instead of `.default()`.

### Zod 3 support

The package uses zod `v4` by default. Zod version can be specified by importing the appropriate version from the `zod3` or `zod4` submodules.

```ts
import { zodCommand } from 'zod-commander/zod4' // equivalent to `import { zodCommand } from 'zod-commander'`
// or
import { zodCommand } from 'zod-commander/zod3'
```
