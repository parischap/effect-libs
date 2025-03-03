<div align="center">

# ansi-styles

An [Effect](https://effect.website/docs/introduction) library for terminal output styling with ANSI colors and formats. This module also offers:

- friendly logging (your formats when encapsulated in other objects will show as a meaningful name (e.g. BoldRed))
- context styling, i.e. the ability to apply context-dependent styling

Tested and documented, 100% Typescript, 100% functional.

Can also be used by non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap). 😄

## Installation

Depending on the package manager you use, run one of the following commands in your terminal:

- **Using npm:**

  ```sh
  npm install effect @parischap/effect-lib @parischap/ansi-styles
  ```

- **Using pnpm:**

  ```sh
  pnpm add effect @parischap/effect-lib @parischap/ansi-styles
  ```

- **Using yarn:**
  ```sh
  yarn add effect @parischap/effect-lib @parischap/ansi-styles
  ```

We use two peerDependencies. If you are not an Effect user, the size may seem important. But, in fact, we use little of each peerDependency. Bundled, tree-shaken, minified, it's only about [24kB](https://bundlephobia.com/package/@parischap/ansi-style). Minified and gzipped, it falls to [5kB](https://bundlephobia.com/package/@parischap/ansi-style)! (source bundlephobia)

## Note

We draw your attention to the [NO_COLOR](https://no-color.org/) standard: "Command-line software which adds ANSI color to its output by default should check for a NO_COLOR environment variable that, when present and not an empty string (regardless of its value), prevents the addition of ANSI color."

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/ansi-style) documentation.

## Usage

Just import ASStyle and build simple styled strings in the following manner:

```ts
import { ASStyle } from "@parischap/ansi-styles";

console.log(
	ASStyle.red(
		"ansi-styles is an ",
		ASStyle.bold(
			"Effect library ",
			ASStyle.magenta(
				ASStyle.dim("for terminal output styling with "),
				ASStyle.yellow("ANSI "),
				"colors ",
			),
		),
		"and formats.",
	),
);
```

=> Output:

![Basic usage example](readme-assets/basic-example.png?sanitize=true)

### Available styles and colors

The ASStyle module offers
