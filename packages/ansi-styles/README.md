<!-- LTeX: language=en-US -->
<div align="center">

# ansi-styles

An [`Effect`](https://effect.website/docs/introduction) library for terminal output styling with ANSI colors and formats.

Tested and documented, optimized for tree-shaking, 100% Typescript, 100% functional.

Can also be used by non-Effect users.

</div>

## Table of Contents

- [Donate](#donate)
- [Installation](#installation)
- [Package size and tree-shaking](#package-size-and-tree-shaking)
- [How to import?](#how-to-import)
- [API](#api)
- [Changelog](#changelog)
- [In this package](#in-this-package)
- [Note](#note)
- [Usage](#usage)
  - [1) Basic usage](#1-basic-usage)
  - [2) List of available styles](#2-list-of-available-styles)
  - [3) Cancelling a style](#3-cancelling-a-style)
  - [4) List of predefined three-bit colors](#4-list-of-predefined-three-bit-colors)
  - [5) Using 8-bit and RGB colors](#5-using-8-bit-and-rgb-colors)
  - [6) Working with the Text type](#6-working-with-the-text-type)
  - [7) Using a ContextStyler](#7-using-a-contextstyler)

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

This package has an important size: it contains comments, maps, ECMAScript and commonjs files... All this will simplify your developer's experience. And when your app goes to production, all unnecessary stuff will be removed as this package has been highly optimized for tree-shaking.

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

In this documentation, we'll use the second option. You should do the same if you value tree-shaking.

## API

After reading this introduction, you may take a look at the [API](https://effect-libs-docs.netlify.app/0.1.0/docs/ansi-styles) documentation.

## Changelog

### v1.0.0 — Effect v4

> **Ported to Effect v4** (`effect@4.0.0-beta`)

- Updated all internal Effect API calls to their Effect v4 equivalents.
- **`ASColor` reorganized** into a `Color/` sub-folder; `ThreeBitColor`, `EightBitColor`, and `RgbColor` are now individually importable modules, improving tree-shaking significantly.
- Removed low-level internal modules that were previously leaking into the public API (`AnsiString`, `StyleCharacteristics`, `Styles`). Their functionality is fully absorbed into `ASStyle` and `ASText`.

### v0.2.0 — Mar 2025 (Effect 3.13.6)

- Updated to Effect 3.13.6 and `@parischap/effect-lib` 0.5.0.
- Minor API fixes and tree-shaking improvements (`"sideEffects": false`).

### v0.1.0 — Mar 2025

First public release. Provides: `ASStyle` (with three-bit, eight-bit, and RGB color constructors; all predefined named colors; `notXxx` style cancellers), `ASText` (styled-text manipulation — concatenation, join, surround, repeat; conversion to ANSI string, unstyled string, and character length), `ASContextStyler` (context-dependent styling with `makePaletteBased` and `makeConstant` constructors), `ASPalette` (named color-palette collections), and `ASColor` (pre-built color instances for all three color spaces).

## In this package

This package contains:

- **`ASStyle`**: the central module. Call any style (a color or a text modifier) as a function on strings to produce a styled `ASText`. Styles compose without conflict — applying `dim` inside `bold` restores the right ANSI state on exit even though they share the same reset code (22).
- **`ASText`**: a type representing styled text as a sequence of segments. Supports concatenation, joining, surrounding, and repeating, and converts to an ANSI-escaped string or an unstyled string.
- **`ASContextStyler`**: a context-dependent styler that derives a style from a context value. Two constructors: `makeConstant` (same style regardless of context) and `makePaletteBased` (cycles through a palette indexed by a function of the context). Useful for depth-indexed or type-indexed coloring.
- **`ASPalette`**: pre-built named color-palette collections for use with `ASContextStyler`.
- **`ASColor`** (`ASThreeBitColor`, `ASEightBitColor`, `ASRgbColor`): pre-built color instances for all three color spaces (8 + 8 bright three-bit colors, 256 eight-bit colors, 140 named RGB colors), plus an `ASRgbColor.make` constructor for fully custom RGB colors.

## Note

We draw your attention to the [NO_COLOR](https://no-color.org/) standard: "Command-line software which adds ANSI color to its output by default should check for a NO_COLOR environment variable that, when present and not an empty string (regardless of its value), prevents the addition of ANSI color."

## Usage

### 1) Basic usage

Just import ASStyle and build simple styled strings in the following manner:

```ts
import * as ASStyle from '@parischap/ansi-styles/ASStyle';

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

&rarr; Output:

<img alt="Basic usage example" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjAvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQiPgo8c3ZnIHdpZHRoPSI4MTguMzMiIGhlaWdodD0iNDUuODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MTguMzMiIGhlaWdodD0iNDUuODMiIGZpbGw9IiMxNzE3MTciIHg9IjAuMDBweCIgeT0iMC4wMHB4Ii8+CjxnIGZvbnQtZmFtaWx5PSJ1aS1tb25vc3BhY2UsIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgQ29uc29sYXMsIG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNC4wMHB4IiBmaWxsPSIjYzRjNGM0IiBjbGlwLXBhdGg9InVybCgjdGVybWluYWxNYXNrKSI+Cjx0ZXh0IHg9IjMwLjAwcHgiIHk9IjM0LjAwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIiBmaWxsPSIjRDc0RTZGIj5hbnNpLXN0eWxlcyBpcyBhbiA8L3RzcGFuPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIj5FZmZlY3QgbGlicmFyeSA8L3RzcGFuPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIiBmaWxsPSIjRUQ2MUQ3Ij5mb3IgdGVybWluYWwgb3V0cHV0IHN0eWxpbmcgd2l0aCA8L3RzcGFuPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIiBmaWxsPSIjRDNFNTYxIj5BTlNJIDwvdHNwYW4+PHRzcGFuIHhtbDpzcGFjZT0icHJlc2VydmUiIGZpbGw9IiNFRDYxRDciPmNvbG9ycyA8L3RzcGFuPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIiBmaWxsPSIjRDc0RTZGIj5hbmQgZm9ybWF0cy48L3RzcGFuPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIi8+PC90ZXh0Pgo8L2c+Cjwvc3ZnPgo=" example-name="basic-usage" />

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
import * as ASStyle from '@parischap/ansi-styles/ASStyle';

console.log(ASStyle.bold('I am ', ASStyle.notBold('not bold')));
```

&rarr; Output:

<img alt="Cancelling a style example" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjAvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQiPgo8c3ZnIHdpZHRoPSIxNzYuNjciIGhlaWdodD0iNDUuODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNzYuNjciIGhlaWdodD0iNDUuODMiIGZpbGw9IiMxNzE3MTciIHg9IjAuMDBweCIgeT0iMC4wMHB4Ii8+CjxnIGZvbnQtZmFtaWx5PSJ1aS1tb25vc3BhY2UsIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgQ29uc29sYXMsIG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNC4wMHB4IiBmaWxsPSIjYzRjNGM0IiBjbGlwLXBhdGg9InVybCgjdGVybWluYWxNYXNrKSI+Cjx0ZXh0IHg9IjMwLjAwcHgiIHk9IjM0LjAwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIj5JIGFtIG5vdCBib2xkPC90c3Bhbj48dHNwYW4geG1sOnNwYWNlPSJwcmVzZXJ2ZSIvPjwvdGV4dD4KPC9nPgo8L3N2Zz4K" example-name="cancelling-a-style" />

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
import * as ASStyle from '@parischap/ansi-styles/ASStyle';

console.log(
  ASStyle.none(
    ASStyle.green('I am '),
    ASStyle.brightGreen('in different shades '),
    ASStyle.bgBrightGreen('of green', ASStyle.bgDefaultColor('.')),
  ),
);
```

&rarr; Output:

<img alt="Using simple colors example" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjAvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQiPgo8c3ZnIHdpZHRoPSIzNTEuNjciIGhlaWdodD0iNDUuODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTEuNjciIGhlaWdodD0iNDUuODMiIGZpbGw9IiMxNzE3MTciIHg9IjAuMDBweCIgeT0iMC4wMHB4Ii8+CjxnIGZvbnQtZmFtaWx5PSJ1aS1tb25vc3BhY2UsIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgQ29uc29sYXMsIG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNC4wMHB4IiBmaWxsPSIjYzRjNGM0IiBjbGlwLXBhdGg9InVybCgjdGVybWluYWxNYXNrKSI+PHJlY3QgZmlsbD0iIiB4PSIyMzguMzNweCIgeT0iMjMuMDBweCIgaGVpZ2h0PSIxNS4wMHB4IiB3aWR0aD0iNzkuMTY2NjdweCIvPgo8dGV4dCB4PSIzMC4wMHB4IiB5PSIzNC4wMHB4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48dHNwYW4geG1sOnNwYWNlPSJwcmVzZXJ2ZSIgZmlsbD0iIzMxQkI3MSI+SSBhbSA8L3RzcGFuPjx0c3BhbiB4bWw6c3BhY2U9InByZXNlcnZlIiBmaWxsPSIjMDBENzg3Ij5pbiBkaWZmZXJlbnQgc2hhZGVzIG9mIGdyZWVuLjwvdHNwYW4+PHRzcGFuIHhtbDpzcGFjZT0icHJlc2VydmUiLz48L3RleHQ+CjwvZz4KPC9zdmc+Cg==" example-name="simple-colors" />

### 5) Using 8-bit and RGB colors

If your terminal takes them in charge, you can use 8-bit or RGB colors. To that extent, use the `ASStyle.color` and `ASStyle.bgColor` constructors.

The ASColor module defines 16 three-bit color instances (8 normal + 8 bright), 256 eight-bit color instances and 140 RGB color instances. All these instances can be found in the [ThreeBitColor API](https://effect-libs-docs.netlify.app/0.1.0/docs/ansi-styles/Color/ThreeBitColor), [EightBitColor API](https://effect-libs-docs.netlify.app/0.1.0/docs/ansi-styles/Color/EightBitColor) and [RgbColor API](https://effect-libs-docs.netlify.app/0.1.0/docs/ansi-styles/Color/RgbColor). Furthermore, you can define more RGB colors with the `ASRgbColor.make` constructor.

Here is an example:

```ts
import * as ASEightBitColor from '@parischap/ansi-styles/ASEightBitColor';
import * as ASRgbColor from '@parischap/ansi-styles/ASRgbColor';
import * as ASStyle from '@parischap/ansi-styles/ASStyle';

console.log(ASStyle.color(ASEightBitColor.cornflowerBlue)('I am a cornflower blue string'));
console.log(
  ASStyle.bgColor(ASEightBitColor.darkOrange)('I am a string with a dark orange background'),
);
console.log(ASStyle.color(ASRgbColor.coral)('I am a coral string'));
console.log(
  ASStyle.color(ASRgbColor.make({ red: 176, green: 17, blue: 243 }))(
    'I am a string colored with an RGB-user-defined color',
  ),
);
```

### 6) Working with the Text type

A Style applied to strings returns a `Text` object. The `ASText` module provides functions to manipulate these objects:

```ts
import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as ASText from '@parischap/ansi-styles/ASText';
import { pipe } from 'effect';
import * as Array from 'effect/Array';

const hello = ASStyle.red('Hello');
const world = ASStyle.blue('World');

// Concatenation
const helloWorld = pipe(hello, ASText.append(ASText.fromString(' ')), ASText.append(world));

// Join an array of texts with a separator
const joined = pipe(Array.make(hello, world), ASText.join(ASText.fromString(', ')));

// Surround a text
const surrounded = pipe(world, ASText.surround(ASStyle.green('['), ASStyle.green(']')));

// Repeat a text
const repeated = pipe(ASStyle.bold('ha'), ASText.repeat(3));

// Convert to ANSI string for terminal output
console.log(ASText.toAnsiString(helloWorld));

// Get the unstyled text content
console.log(ASText.toUnstyledString(helloWorld)); // "Hello World"

// Get text length without formatting
console.log(ASText.toLength(helloWorld)); // 11
```

### 7) Using a ContextStyler

A `ContextStyler` applies a style to text based on a context object. Two constructors are provided:

- `makePaletteBased`: requires a `Palette` (an array of `n` `Style`s) and an `indexFromContext` function that derives a numeric index from a context object. The style at position `i % n` in the palette is applied.
- `makeConstant`: always applies the same `Style` regardless of the context. Useful when a function expects a `ContextStyler` but should ignore the context. The `ASContextStyler` module also provides pre-built constant instances (`none`, `red`, `green`, etc.).

Here is an example:

```ts
import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASPalette from '@parischap/ansi-styles/ASPalette';

interface Value {
  readonly pos1: number;
  readonly otherStuff: string;
}

const { red }: { readonly red: ASContextStyler.Type<Value> } = ASContextStyler;

const pos1 = (value: Value): number => value.pos1;

const pos1BasedAllColorsFormatter = ASContextStyler.makePaletteBased({
  indexFromContext: pos1,
  palette: ASPalette.allStandardOriginalColors,
});

const value1: Value = {
  pos1: 2,
  otherStuff: 'dummy',
};
const pos1BasedAllColorsFormatterInValue1Context = ASContextStyler.style(
  pos1BasedAllColorsFormatter,
)(value1);
const redInValue1Context = ASContextStyler.style(red)(value1);

/* Prints `foo` in red */
console.log(redInValue1Context('foo'));

/* Prints `foo` in green */
console.log(pos1BasedAllColorsFormatterInValue1Context('foo'));
```
