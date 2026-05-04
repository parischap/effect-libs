/**
 * Constructors and pre-built `RegExp` instances backed by patterns from
 * {@link "./RegExpString.js" | MRegExpString}.
 *
 * ## Mental model
 *
 * - This module materializes the string patterns from `MRegExpString` as actual `RegExp` objects.
 * - When you need a regex with custom flags (e.g. the `g` flag), build it with
 *   {@link fromRegExpString}; the bundled instances are flag-free.
 *
 * ## Common tasks
 *
 * - **Construct from a pattern string**: {@link fromRegExpString}
 * - **Pre-built instances**: {@link lineBreak}, {@link universalPathSep}, {@link semVer},
 *   {@link email}
 *
 * ## Quickstart
 *
 * **Example** (Match a SemVer string)
 *
 * ```ts
 * import * as MRegExp from '@parischap/effect-lib/MRegExp';
 *
 * console.log(MRegExp.semVer.test('1.2.3')); // true
 * console.log(MRegExp.semVer.test('1.2')); // false
 * ```
 */

import { pipe } from 'effect';

import * as MRegExpString from './RegExpString.js';

/**
 * Builds a `RegExp` from a pattern string, optionally with `flags`.
 *
 * **Example** (Build a regex with the `i` flag)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MRegExp from '@parischap/effect-lib/MRegExp';
 *
 * const ci = pipe('hello', MRegExp.fromRegExpString('i'));
 * console.log(ci.test('HELLO')); // true
 * ```
 *
 * @category Constructors
 */
export const fromRegExpString =
  (flags?: string) =>
  (s: string): RegExp =>
    new RegExp(s, flags);

/**
 * A `RegExp` matching a line break (CRLF, CR or LF). No `g` flag.
 *
 * @category Instances
 */
export const lineBreak: RegExp = new RegExp(MRegExpString.lineBreak);

/**
 * A `RegExp` matching a path separator on any platform (`/` or `\`).
 *
 * @category Instances
 */
export const universalPathSep: RegExp = new RegExp(MRegExpString.universalPathSep);

/**
 * A `RegExp` matching an entire SemVer string of the form `X.Y.Z`. Uses {@link MRegExpString.semVer}
 * anchored to a full line.
 *
 * @category Instances
 */
export const semVer: RegExp = pipe(MRegExpString.semVer, MRegExpString.makeLine, RegExp);

/**
 * A `RegExp` matching an entire e-mail address. Uses {@link MRegExpString.email} anchored to a
 * full line.
 *
 * @category Instances
 */
export const email: RegExp = pipe(MRegExpString.email, MRegExpString.makeLine, RegExp);
