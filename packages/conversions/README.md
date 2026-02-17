<!-- LTeX: language=en-US -->
<div align="center">

# conversions

An [`Effect`](https://effect.website/docs/introduction) library to partially replace the native JavaScript INTL API.

Non-machine-dependent, safe, bidirectional (implements parsing and formatting), tested, documented, with lots of examples, optimized for tree-shaking, 100% Typescript, 100% functional.

Can also come in handy to non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap) 😄

Please, star my repo if you think it's useful!

## Installation

Depending on the package manager you use, run one of the following commands in your terminal:

- **Using npm:**

  ```sh
  npm install effect @parischap/effect-lib @parischap/conversions
  ```

- **Using pnpm:**

  ```sh
  pnpm add effect @parischap/effect-lib @parischap/conversions
  ```

- **Using yarn:**
  ```sh
  yarn add effect @parischap/effect-lib @parischap/conversions
  ```

## Package size and tree-shaking

This is a modern library optimized for tree-shaking. Don't put too much focus on package size: a good part of it will go away at bundling. To give you an idea of how this library will impact the size of your project, [Bundlephobia](https://bundlephobia.com/package/@parischap/conversions) announces a size of 15kB once minified and gzipped.

## How to import?

This library supports named imports:

```ts
import { CVRoundingOption } from '@parischap/conversions';

console.log(CVRoundingOption.toNumberRounder(CVRoundingOption.halfExpand2));
```

and namespace imports:

```ts
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption';

console.log(CVRoundingOption.toNumberRounder(CVRoundingOption.halfExpand2));
```

In this documentation, we'll use the second option. You should do the same if you value tree-shaking.

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/conversions) documentation.

## Upgrading

Version 0.3.0 introduced code clarification and a few breaking changes. We apologize for any inconvenience caused and appreciate your understanding.

## In this package

This package contains:

- A [module to round numbers and BigDecimal's](./readme-assets/Rounding.md) with the same rounding options as those offered by the JavaScript INTL API: Ceil, Floor, Expand, Trunc, HalfCeil...
- A safe, easy-to-use [number/BigDecimal parser/formatter](./readme-assets/NumberParserFormatter.md) with almost all the options offered by the JavaScript INTL API: choice of the thousand separator, of the fractional separator, of the minimum and maximum number of fractional digits, of the rounding option, of the sign display mode, of whether to show or not the integer part when it's zero, of whether to use a scientific or engineering notation, of the character to use as exponent mark... It can also be used as a `Schema` instead of the `Effect.Schema.NumberFromString` transformer.
- An equivalent to the PHP [sprintf and sscanf functions](./readme-assets/Templating.md) with real typing of the placeholders. Although `Effect.Schema` does offer the [`TemplateLiteralParser` API](https://effect.website/docs/schema/basic-usage/#templateliteralparser), the latter does not provide a solution to situations such as fixed length fields (potentially padded), numbers formatted otherwise than in the English format... This module can also be used as a `Schema`.
- A very easy to use [DateTime module](./readme-assets/DateTime.md) that implements natively the ISO calendar (ISO year and ISO week). It is also faster than its `Effect` counterpart as it implements an internal state that's only used to speed up calculation times (but does not alter the result of functions; so `CVDateTime` functions can be viewed as pure from a user's perspective). It can therefore be useful in applications where time is of essence.
- A [DateTime parser/formatter](./readme-assets/DateTimeFormatter.md) which supports many of the available [Unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). It can also be used as a `Schema` instead of the `Effect.Schema.Date` transformer.
- A few [brands](./readme-assets/Branding.md) which come in handy in many projects such as email, semantic versioning, integer numbers, positive integer numbers, real numbers and positive real numbers. All these brands are also defined as `Schema`'s. Please read the [`Effect` documentation about Branding](https://effect.website/docs/code-style/branded-types/) if you are not familiar with this concept

Most functions of this package return an `Either` or an `Option` to signify the possibility of an error. However, if you are not an `Effect` user and do not care to learn more about it, you can simply use the `OrThrow` variant of the function. For instance, use `CVDateTime.setWeekdayOrThrow` instead of `CVDateTime.setWeekday`. As its name suggests, it will throw in case of failure. Some functions return functions that return an `Either` or throw. In that case, the variant for non-`Effect` users contains the word `Throwing`, e.g. use `CVDateTimeFormat.toThrowingFormatter` instead of `CVDateTimeFormat.toFormatter`.
