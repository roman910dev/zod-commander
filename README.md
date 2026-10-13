# zod-commander

Build type-safe command-line interfaces (CLIs) from [Zod](https://zod.dev/) schemas using [Commander](https://github.com/tj/commander.js), with input validation, inferred action types, and generated help. `zodCommand()` returns a Commander `Command`, so all Commander methods work on the result.

## Installation

```sh
npm install zod-commander zod
```

## Usage

```ts
// cli.ts
import { z } from 'zod'
import { zodCommand } from 'zod-commander'

const greet = zodCommand({
  name: 'greet',
  summary: 'Say hello',
  description: 'Greet someone, optionally with a title and repeated greetings.',
  args: {
    name: z.string().describe('Name of the person to greet'),
  },
  opts: {
    title: z.string().optional().describe('t;Title to put before the name'),
    repeat: z.coerce.number().int().min(1).prefault(1)
      .describe('r;Number of greetings'),
    excited: z.boolean().prefault(false).describe('e;Add an exclamation mark'),
  },
  action({ name }, { title, repeat, excited }) {
    // Types are inferred: name is string, title is string | undefined,
    // repeat is number, and excited is boolean.
    const recipient = title ? `${title} ${name}` : name
    for (let i = 0; i < repeat; i++) {
      console.log(`Hello, ${recipient}${excited ? '!' : '.'}`)
    }
  },
})

await greet.parseAsync(process.argv)
```

```sh
node cli.ts Alice
# Hello, Alice.

node cli.ts Alice --title Dr --repeat 2 --excited
# Hello, Dr Alice!
# Hello, Dr Alice!

node cli.ts Alice -t Dr -r 2 -e
# Hello, Dr Alice!
# Hello, Dr Alice!
```

`node cli.ts --help` produces:

```text
Usage: greet [options] <name>

Greet someone, optionally with a title and repeated greetings.

Arguments:
  name                   Name of the person to greet

Options:
  -t, --title <title>    Title to put before the name
  -r, --repeat <repeat>  Number of greetings (default: 1)
  -e, --excited          Add an exclamation mark (default: false)
  -h, --help             display help for command
```

## How schemas map to CLI inputs

- **Arguments and options:** `args` defines positional arguments in key order; `opts` defines named options. Inputs are required unless their schema accepts `undefined`, such as with `.optional()` or `.prefault()`. Boolean options become flags.
- **Parsing and validation:** CLI values arrive as strings. Use coercion or transforms for other types, as with `z.coerce.number()` above. Zod validation failures become Commander input errors. Enum schemas also expose their choices in help.
- **Defaults:** Use `.prefault()` with Zod 4. The package parses the prefault through the schema and registers the result as a Commander default. Zod 4's `.default()` is not extracted into a CLI default.
- **Descriptions and aliases:** `.describe()` supplies help text. Prefix any option description with a letter and a semicolon, such as `'r;Number of greetings'`, to add a short alias. The prefix is removed from help.
- **Actions:** `action` receives named argument and option objects with schema-inferred types. It can be synchronous or asynchronous.

## Commander integration

`zodCommand()` returns a Commander `Command`. You can call Commander methods on it and add it to a regular Commander program. All `zodCommand()` properties are optional, so it can also build a root program.

Using `greet` from above as a subcommand, the parent program handles parsing instead of `greet`:

```ts
import { Command } from 'commander'

// Using the greet command defined above.
greet.alias('hello')

const program = new Command()
  .name('my-cli')
  .addCommand(greet)

await program.parseAsync(process.argv)
```

See the [Commander documentation](https://github.com/tj/commander.js#readme) for command composition, parsing, and customization.

## Zod 3 support

The default entry point uses Zod 4. For Zod 3, use the `/zod3` entry point and `.default()` instead of `.prefault()`:

```ts
import { z } from 'zod'
import { zodCommand } from 'zod-commander/zod3'
```
