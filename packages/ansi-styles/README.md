<!-- LTeX: language=en-US -->
<div align="center">

# ansi-styles

An [`Effect`](https://effect.website/docs/introduction) library for terminal output styling with ANSI colors and formats.

Tested and documented, optimized for tree-shaking, 100% Typescript, 100% functional.

Can also be used by non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap) 😄

Please, star my repo if you think it's useful!

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

## Package size and tree-shaking

This is a modern library optimized for tree-shaking. Don't put too much focus on package size: a good part of it will go away at bundling. To give you an idea of how this library will impact the size of your project, [Bundlephobia](https://bundlephobia.com/package/@parischap/ansi-styles) announces a size of 16kB once minified and gzipped.

## How to import?

This library supports named imports:

```ts
import { ASStyle } from '@parischap/ansi-styles';

console.log(ASStyle.red('foo'));
```

and namespace imports:

```ts
import * as ASStyle from '@parischap/ansi-styles/ASStyle';

console.log(ASStyle.red('foo'));
```

In this documentation, we'll use the first option. But if you value tree-shaking, you should use the second unless you use a bundler that implements deep scope analysis as for instance rollup, vite, webpack 5+.

## Note

We draw your attention to the [NO_COLOR](https://no-color.org/) standard: "Command-line software which adds ANSI color to its output by default should check for a NO_COLOR environment variable that, when present and not an empty string (regardless of its value), prevents the addition of ANSI color."

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/ansi-styles) documentation.

## Upgrading

Version 0.3.0 introduced code clarification and a few breaking changes. We apologize for any inconvenience caused and appreciate your understanding.

## Usage

### 1) Basic usage

Just import ASStyle and build simple styled strings in the following manner:

```ts
import { ASStyle } from '@parischap/ansi-styles';

console.log(
  ASStyle.red(
    'ansi-styles is an ',
    ASStyle.bold(
      'Effect library ',
      ASStyle.magenta(
        ASStyle.dim('for terminal output styling with '),
        ASStyle.yellow('ANSI '),
        'colors ',
      ),
    ),
    'and formats.',
  ),
);
```

=> Output:

![Basic usage example](readme-assets/basic-example.png?sanitize=true)

As can be seen in the previous example, although `bold` and `dim` share the same reset ANSI sequence (22), using `dim` inside `bold` (or vice versa) will work properly. This feature is not well handled by most ANSI styling packages.

### 2) List of available styles

In the previous example, we used the `bold` and `dim` styles. Following is the list of all predefined styles:

- none (does not apply any styling)
- blinking
- bold
- dim
- hidden
- inversed
- italic
- overlined
- struckThrough
- underlined

Be aware that all styles are not available in all terminals. For instance, the `dim` and `blinking` styles will do nothing on most terminals.

### 3) Cancelling a style

In some cases, you may need to cancel the effect of a style using one of the following predefined styles:

- notBlinking
- notBold
- notDim
- notHidden
- notInversed
- notItalic
- notOverlined
- notStruckThrough
- notUnderlined

For instance:

```ts
import { ASStyle } from '@parischap/ansi-styles';

console.log(ASStyle.bold('I am ', ASStyle.notBold('not bold')));
```

=> Output:

![Cancelling a style example](readme-assets/cancelling-a-style.png?sanitize=true)

### 4) List of predefined three-bit colors

The Style module contains the following predefined foreground three-bit colors:

- black
- blue
- cyan
- green
- magenta
- red
- white
- yellow

If your terminal takes them in charge, you can even use the bright version of each color by preceding it with the `bright` keyword:

- brightBlack
- brightBlue
- brightCyan
- brightGreen
- brightMagenta
- brightRed
- brightWhite
- brightYellow

If it's the background color that you want to change, use the `bg` prefix. For instance, `bgRed` or `bgBrightRed`.

In some cases, you may need to revert to the default terminal color. In that case, use `defaultColor` or `bgDefaultColor`

Here is an example:

```ts
import { ASStyle } from '@parischap/ansi-styles';

console.log(
  ASStyle.none(
    ASStyle.green('I am '),
    ASStyle.brightGreen('in different shades '),
    ASStyle.bgBrightGreen('of green', ASStyle.bgDefaultColor('.')),
  ),
);
```

=> Output:

![Using simple colors example](readme-assets/simple-colors.png?sanitize=true)

### 5) Using 8-bit and RGB colors

If your terminal takes them in charge, you can use 8-bit or RGB colors. To that extent, use the `ASStyle.color` and `ASStyle.Bg.color` combinators.

The ASColor module defines 16 three-bit color instances (8 normal + 8 bright), 256 eight-bit color instances and 140 RGB color instances. All these instances can be found in the [ThreeBit API](https://parischap.github.io/effect-libs/ansi-styles/Color/ThreeBit.html), [EightBit API](https://parischap.github.io/effect-libs/ansi-styles/Color/EightBit.html) and [Rgb API](https://parischap.github.io/effect-libs/ansi-styles/Color/Rgb.html). Furthermore, you can define more RGB colors with the `ASColorRgb.make` combinator.

Here is an example:

```ts
import { ASColorRgb, ASStyle } from '@parischap/ansi-styles';

console.log(ASStyle.color(ASColorRgb.coral)('I am a coral string'));
console.log(
  ASStyle.color(ASColorRgb.make({ red: 176, green: 17, blue: 243 }))(
    'I am a string colored with an RGB-user-defined color',
  ),
);
```

### 6) Using an ASContextStyler

An `ASContextStyler` allows you to style a text differently according to a context object. There are two kinds of `ContextStyler`'s:

- `ASContextStylerPalette`: this `ASContextStyler` requires a `ASPalette`, i.e. an array of `n` `ASStyle`'s, and an `indexFromContext` function whose role is to derive a numeric index from a Context object. When styling a text with a context that returns an index `i`, the used `ASStyle` is the one in the `ASPalette` at position i % n, where % is the modulo function.
- `ASContextStylerConstant`: this `ASContextStyler` requires an `ASStyle` that is used in all contexts (i.e. the value of the context object is ignored). This is useful if a function expects an `ASContextStyler` but needs not take care of the context in some situations.

Here is an example:

```ts
import {
  ASContextStylerBase,
  ASContextStylerConstant,
  ASContextStylerPalette,
  ASPalette,
} from '@parischap/ansi-styles';

interface Value {
  readonly pos1: number;
  readonly otherStuff: string;
}

const { red }: { readonly red: ASContextStylerBase.Type<Value> } = ASContextStylerConstant;

const pos1 = (value: Value): number => value.pos1;

const pos1BasedAllColorsFormatter = ASContextStylerPalette.make({
  indexFromContext: pos1,
  palette: ASPalette.allStandardOriginalColors,
});

const value1: Value = {
  pos1: 2,
  otherStuff: 'dummy',
};
const pos1BasedAllColorsFormatterInValue1Context = ASContextStylerBase.toStyle(
  pos1BasedAllColorsFormatter,
)(value1);
const redInValue1Context = ASContextStylerBase.toStyle(red)(value1);

/* Prints `foo` in red */
console.log(redInValue1Context('foo'));

/* Prints `foo` in green */
console.log(pos1BasedAllColorsFormatterInValue1Context('foo'));
```
