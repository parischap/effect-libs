/**
 * Extension to the Effect String module: stringification of unknown / primitive values, indexed
 * search, custom-character trimming, padding, splitting (including bit-aligned chunking), indented
 * multi-line formatting, and lightweight string predicates (SemVer, e-mail, digit, …).
 *
 * ## Mental model
 *
 * - All functions are pure, data-last, and treat strings as immutable values.
 * - Search helpers ({@link search}, {@link searchAll}, {@link searchRight}) accept either a literal
 *   `string` (no escaping needed) or a `RegExp`. They return positions through
 *   {@link "./StringSearchResult.js" | `MStringSearchResult`}.
 * - Both regex-based searches and {@link match} / {@link matches} reset `lastIndex` before use, so
 *   passing a `RegExp` literal with the `g` flag is safe but global matches are not iterated; only
 *   the first match is returned (use {@link searchAll} for all).
 *
 * ## Common tasks
 *
 * - **Stringify**: {@link fromUnknown}, {@link fromPrimitive}, {@link fromNonNullablePrimitive},
 *   {@link fromNumber}
 * - **Search**: {@link search}, {@link searchAll}, {@link searchRight}, {@link count}
 * - **Slice**: {@link takeBut}, {@link takeRightBut}, {@link takeTo}, {@link takeRightFrom}
 * - **Trim / strip / pad**: {@link trimStart}, {@link trimEnd}, {@link trim}, {@link stripLeft},
 *   {@link stripLeftOption}, {@link stripRight}, {@link stripRightOption}, {@link pad}
 * - **Combine**: {@link append}, {@link appendIfNotEmpty}, {@link prepend},
 *   {@link prependIfNotEmpty}, {@link surroundIfNotEmpty}, {@link replaceBetween}
 * - **Match**: {@link match}, {@link matches}, {@link matchWithCapturingGroups}
 * - **Split**: {@link splitAt}, {@link splitAtFromRight}, {@link splitEquallyRestAtStart},
 *   {@link splitEquallyRestAtEnd}
 * - **Format**: {@link tabify}, {@link removeNCharsEveryMCharsFromRight}
 * - **Predicates**: {@link isMultiLine}, {@link isSemVer}, {@link isEmail}, {@link hasLength},
 *   {@link isDigit}
 *
 * ## Quickstart
 *
 * **Example** (Indexed search and padding)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MString from '@parischap/effect-lib/MString';
 * import * as MStringFillPosition from '@parischap/effect-lib/String/StringFillPosition';
 *
 * const found = pipe('hello world', MString.search('world'));
 * console.log(Option.map(found, (r) => r.startIndex)); // Some(6)
 *
 * console.log(
 *   pipe(
 *     '42',
 *     MString.pad({ length: 5, fillChar: '0', fillPosition: MStringFillPosition.Type.Left }),
 *   ),
 * );
 * // '00042'
 * ```
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as BigInt from 'effect/BigInt';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from '../types/types.js';

import * as MArray from '../Array.js';
import * as MFunction from '../Function.js';
import * as MMatch from '../Match.js';
import * as MPredicate from '../Predicate.js';
import * as MRegExp from '../RegExp.js';
import * as MRegExpString from '../RegExpString.js';
import * as MTuple from '../Tuple.js';
import * as MStringFillPosition from './StringFillPosition.js';
import * as MStringSearchResult from './StringSearchResult.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type = string;

/**
 * Builds a string from a primitive value other than `null` and `undefined`.
 *
 * - Numbers and BigInts are converted using base-10 (not scientific notation).
 * - Other primitives use their `.toString()` method.
 * - Returns string representation suitable for display or further processing.
 *
 * **Example** (Convert non-nullable primitive)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.fromNonNullablePrimitive(42)); // "42"
 * console.log(MString.fromNonNullablePrimitive(true)); // "true"
 * console.log(MString.fromNonNullablePrimitive(3.14n)); // "3.14"
 * ```
 *
 * @category Constructors
 */
export const fromNonNullablePrimitive = (u: MTypes.NonNullablePrimitive): string =>
  Predicate.isNumber(u) ? fromNumber(10)(u) : u.toString();

/**
 * Builds a string from a primitive value, handling `null` and `undefined`.
 *
 * - `null` converts to `"null"` and `undefined` to `"undefined"`.
 * - Non-nullable primitives delegated to {@link fromNonNullablePrimitive}.
 * - Numbers and BigInts use base-10 conversion (no scientific notation).
 *
 * **Example** (Convert nullable primitive)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.fromPrimitive(null)); // "null"
 * console.log(MString.fromPrimitive(undefined)); // "undefined"
 * console.log(MString.fromPrimitive(123)); // "123"
 * console.log(MString.fromPrimitive(false)); // "false"
 * ```
 *
 * @category Constructors
 */
export const fromPrimitive: MTypes.OneArgFunction<MTypes.Primitive, string> = flow(
  MMatch.make,
  MMatch.when(Predicate.isNotNullish, fromNonNullablePrimitive),
  MMatch.orElse((s) => (s === undefined ? 'undefined' : 'null')),
);

/**
 * Builds a string from an unknown value.
 *
 * - Primitives delegated to {@link fromPrimitive}.
 * - Objects serialized via `JSON.stringify` with 2-space indentation.
 * - Use for debugging or logging arbitrary values.
 *
 * **Example** (Convert unknown value)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.fromUnknown(42)); // "42"
 * console.log(MString.fromUnknown({ x: 1 }));
 * // "{\n  \"x\": 1\n}"
 * ```
 *
 * @category Constructors
 */
export const fromUnknown = (u: unknown): string =>
  MPredicate.isPrimitive(u) ? fromPrimitive(u) : JSON.stringify(u, null, 2);

/**
 * Converts a number to a string using a specified radix.
 *
 * - Radix 10 with non-scientific numbers uses the special fixed-point conversion.
 * - Other radixes and BigInt use native `.toString(radix)`.
 * - Decimal parts preserved for floating-point numbers.
 * - Handles very large and very small numbers without scientific notation.
 *
 * **Example** (Convert to string with radix)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const toBase10 = MString.fromNumber(10);
 * console.log(toBase10(255)); // "255"
 * console.log(toBase10(1e-10)); // "0.0000000001"
 *
 * const toBase16 = MString.fromNumber(16);
 * console.log(toBase16(255)); // "ff"
 * ```
 *
 * @category Constructors
 */
export const fromNumber =
  (radix: number): MTypes.OneArgFunction<number | bigint, string> =>
  (u) => {
    // If this condition is not respected, Javascript will use an exponent in the converted string
    if (
      typeof u === 'bigint' ||
      radix !== 10 ||
      (u >= 1e-6 && u < 1e21) ||
      !Number.Number.isFinite(u)
    )
      return u.toString(radix);
    const integerPart = Math.trunc(u);
    const decimalPart = BigInt.BigInt(Math.trunc((u - integerPart) * 1e16));
    return (
      BigInt.BigInt(integerPart).toString(10) +
      pipe(
        decimalPart,
        (b) => b.toString(10),
        String.padStart(16, '0'),
        trimEnd('0'),
        Option.liftPredicate(String.isNonEmpty),
        Option.map(prepend('.')),
        Option.getOrElse(MFunction.constEmptyString),
      )
    );
  };

/**
 * Searches for the first occurrence of a pattern in the string.
 *
 * - Supports both string literals (without escaping special characters) and RegExp patterns.
 * - Optionally starts search from `startIndex` (default 0).
 * - The `g` flag on RegExp is ignored; only first match returned.
 * - Returns `Option.some` with match details or `Option.none` if not found.
 * - Match details include start/end indexes and matched text.
 *
 * **Example** (Search for first occurrence)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as Option from 'effect/Option';
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const text = 'The quick brown fox';
 * const result = pipe(text, MString.search('quick'));
 * console.log(Option.isSome(result)); // true
 * if (Option.isSome(result)) {
 *   console.log(result.value.match); // "quick"
 * }
 * ```
 *
 * @category Utils
 */
export const search =
  (regexp: RegExp | string, startIndex = 0) =>
  (self: Type): Option.Option<MStringSearchResult.Type> => {
    if (Predicate.isString(regexp)) {
      const pos = self.indexOf(regexp, startIndex);
      if (pos === -1) return Option.none();
      return Option.some(
        MStringSearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp }),
      );
    }
    const target = self.slice(startIndex);
    regexp.lastIndex = 0;
    const result = regexp.exec(target);
    if (Predicate.isNull(result)) return Option.none();
    const offsetPos = startIndex + result.index;
    const [match] = result;
    return Option.some(
      MStringSearchResult.make({
        startIndex: offsetPos,
        endIndex: offsetPos + match.length,
        match,
      }),
    );
  };

/**
 * Searches for all non-overlapping occurrences of a pattern.
 *
 * - Supports both string patterns and RegExp patterns.
 * - The `g` flag is ignored; uses internal search loop.
 * - Returns array of all match results with indexes and matched text.
 * - Returns empty array if no matches found.
 * - Use to iterate over all occurrences.
 *
 * **Example** (Find all occurrences)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const text = 'apple apple apple';
 * const matches = pipe(text, MString.searchAll('apple'));
 * console.log(matches.length); // 3
 * console.log(matches[0].match); // "apple"
 * ```
 *
 * @category Utils
 */
export const searchAll =
  (regexp: RegExp | string) =>
  (self: Type): Array<MStringSearchResult.Type> =>
    Array.unfold(0, (pos) =>
      pipe(
        self,
        search(regexp, pos),
        Option.map(
          flow(
            MTuple.replicate(2),
            Tuple.evolve(
              Tuple.make(Function.identity, (searchResult) => Struct.get(searchResult, 'endIndex')),
            ),
          ),
        ),
      ),
    );

/**
 * Searches for the last (rightmost) occurrence of a pattern.
 *
 * - Supports both string patterns and RegExp patterns.
 * - The `g` flag is ignored; uses internal search.
 * - Returns `Option.some` with last match details or `Option.none` if not found.
 * - More efficient than calling {@link searchAll} for finding the last match.
 *
 * **Example** (Find last occurrence)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as Option from 'effect/Option';
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const text = 'one two one three';
 * const result = pipe(text, MString.searchRight('one'));
 * if (Option.isSome(result)) {
 *   console.log(result.value.startIndex); // 8
 * }
 * ```
 *
 * @category Utils
 */
export const searchRight =
  (regexp: RegExp | string) =>
  (self: Type): Option.Option<MStringSearchResult.Type> => {
    if (Predicate.isString(regexp)) {
      const pos = self.lastIndexOf(regexp);
      if (pos === -1) return Option.none();
      return Option.some(
        MStringSearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp }),
      );
    }
    return pipe(self, searchAll(regexp), Array.last);
  };

/**
 * Extracts substring from start up to first occurrence of pattern.
 *
 * - Returns characters before the first pattern match.
 * - Returns full string if pattern not found.
 * - Supports both string patterns and RegExp (without escaping requirements).
 * - Use to split at first occurrence without including the delimiter.
 *
 * **Example** (Take up to pattern)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const text = 'hello@world.com';
 * const result = pipe(text, MString.takeTo('@'));
 * console.log(result); // "hello"
 * ```
 *
 * @category Utils
 */
export const takeTo =
  (regexp: RegExp | string): MTypes.StringTransformer =>
  (self) =>
    pipe(
      self,
      search(regexp),
      Option.map(MStringSearchResult.startIndex),
      Option.getOrElse(() => self.length),
      MFunction.flipDual(String.takeLeft)(self),
    );

/**
 * Extracts substring from first occurrence of pattern to end.
 *
 * - Returns characters after the first pattern match.
 * - Returns full string if pattern not found.
 * - Supports both string patterns and RegExp (without escaping requirements).
 * - Use to split at first occurrence and keep the part after delimiter.
 *
 * **Example** (Take from pattern to end)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const text = 'hello@world.com';
 * const result = pipe(text, MString.takeRightFrom('@'));
 * console.log(result); // "world.com"
 * ```
 *
 * @category Utils
 */
export const takeRightFrom =
  (regexp: RegExp | string): MTypes.StringTransformer =>
  (self) =>
    pipe(
      self,
      searchRight(regexp),
      Option.map((searchResult) => searchResult.endIndex),
      Option.getOrElse(() => 0),
      Function.flip(String.slice)(self),
    );

/**
 * Returns substring excluding the last `n` characters.
 *
 * - If `n` is negative, string returned unchanged.
 * - If `n` greater than string length, empty string returned.
 * - Use to trim a known suffix length without searching.
 * - Inverse of {@link takeRight} semantically.
 *
 * **Example** (Take all but last n characters)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.takeBut(3)('hello')); // "he"
 * console.log(MString.takeBut(-1)('hello')); // "hello"
 * ```
 *
 * @category Utils
 */
export const takeBut =
  (n: number): MTypes.StringTransformer =>
  (self) =>
    String.takeLeft(self.length - n)(self);

/**
 * Returns substring excluding the first `n` characters.
 *
 * - If `n` is negative, string returned unchanged.
 * - If `n` greater than string length, empty string returned.
 * - Use to skip a known prefix length without searching.
 * - Inverse of {@link String.takeLeft} semantically.
 *
 * **Example** (Take all but first n characters)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.takeRightBut(3)('hello')); // "lo"
 * console.log(MString.takeRightBut(-1)('hello')); // "hello"
 * ```
 *
 * @category Utils
 */
export const takeRightBut =
  (n: number): MTypes.StringTransformer =>
  (self) =>
    String.takeRight(self.length - n)(self);

/**
 * Removes characters from the start of the string.
 *
 * - Only single `charToRemove` character is supported.
 * - Removes all leading instances of the character.
 * - Returns string unchanged if first character doesn't match.
 * - Use for custom left-trimming beyond whitespace.
 *
 * **Example** (Trim start character)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const result = MString.trimStart('*')('***hello***');
 * console.log(result); // "hello***"
 * ```
 *
 * @category Utils
 */
export const trimStart = (charToRemove: string): MTypes.StringTransformer =>
  flow(Array.dropWhile(MPredicate.strictEquals(charToRemove)), Array.join(''));

/**
 * Removes characters from the end of the string.
 *
 * - Only single `charToRemove` character is supported.
 * - Removes all trailing instances of the character.
 * - Returns string unchanged if last character doesn't match.
 * - Use for custom right-trimming beyond whitespace.
 *
 * **Example** (Trim end character)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const result = MString.trimEnd('!')('hello!!!');
 * console.log(result); // "hello"
 * ```
 *
 * @category Utils
 */
export const trimEnd = (charToRemove: string): MTypes.StringTransformer =>
  flow(
    Array.fromIterable,
    Array.reverse,
    Array.dropWhile(MPredicate.strictEquals(charToRemove)),
    Array.reverse,
    Array.join(''),
  );

/**
 * Pads a string to a specific length with a fill character.
 *
 * - `fillChar` must be a single character (default behavior for longer strings unspecified).
 * - If string length already meets target, no change applied.
 * - `fillPosition` determines whether padding added to left or right.
 * - `length` should be a positive integer.
 * - Returns new string or original if already long enough.
 *
 * **Example** (Pad string)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 * import * as MStringFillPosition from '@parischap/effect-lib/String/StringFillPosition';
 *
 * const padLeft = MString.pad({
 *   length: 10,
 *   fillChar: '0',
 *   fillPosition: MStringFillPosition.Type.Left,
 * });
 * console.log(padLeft('42')); // "00000042"
 * ```
 *
 * @category Utils
 */

export const pad = ({
  length,
  fillChar,
  fillPosition,
}: {
  readonly length: number;
  readonly fillChar: string;
  readonly fillPosition: MStringFillPosition.Type;
}): MTypes.OneArgFunction<Type> =>
  pipe(
    fillPosition,
    MMatch.make,
    MMatch.whenIs(MStringFillPosition.Type.Left, () => String.padStart(length, fillChar)),
    MMatch.whenIs(MStringFillPosition.Type.Right, () => String.padEnd(length, fillChar)),
    MMatch.exhaustive,
  );

/**
 * Removes padding characters from left or right of a string.
 *
 * - Only removes characters matching `fillChar` (single character).
 * - Direction determined by `fillPosition`.
 * - Removes all contiguous matching characters from that side.
 * - Returns original string if no matching characters found.
 * - Use to reverse padding or strip known suffixes/prefixes.
 *
 * **Example** (Trim padding)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 * import * as MStringFillPosition from '@parischap/effect-lib/String/StringFillPosition';
 *
 * const trimRight = MString.trim({
 *   fillChar: '.',
 *   fillPosition: MStringFillPosition.Type.Right,
 * });
 * console.log(trimRight('file.txt...')); // "file.txt"
 * ```
 *
 * @category Utils
 */

export const trim = ({
  fillChar,
  fillPosition,
}: {
  readonly fillChar: string;
  readonly fillPosition: MStringFillPosition.Type;
}): MTypes.StringTransformer =>
  flow(
    pipe(
      fillPosition,
      MMatch.make,
      MMatch.whenIs(MStringFillPosition.Type.Left, () => trimStart(fillChar)),
      MMatch.whenIs(MStringFillPosition.Type.Right, () => trimEnd(fillChar)),
      MMatch.exhaustive,
    ),
  );

/**
 * Optionally removes a prefix from the start of the string.
 *
 * - Returns `Option.some` with stripped string if prefix matches.
 * - Returns `Option.none` if string doesn't start with prefix.
 * - Returns new string with prefix removed or `Option.none`.
 * - Use in optional chains where missing prefix is valid.
 *
 * **Example** (Strip prefix optionally)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as Option from 'effect/Option';
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const result = pipe('file.txt', MString.stripLeftOption('file'));
 * console.log(Option.isSome(result)); // true
 * console.log(Option.getOrElse(result, () => '')); // ".txt"
 * ```
 *
 * @category Utils
 */
export const stripLeftOption = (s: string): MTypes.OneArgFunction<Type, Option.Option<string>> =>
  flow(Option.liftPredicate(String.startsWith(s)), Option.map(takeRightBut(s.length)));

/**
 * Removes a prefix from the string if present.
 *
 * - Returns string without prefix if prefix matches.
 * - Returns original string if prefix not found.
 * - Always returns a string (never `Option`).
 * - Use for unconditional prefix removal.
 *
 * **Example** (Strip prefix)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.stripLeft('http://')('http://example.com')); // "example.com"
 * console.log(MString.stripLeft('https://')('http://example.com')); // "http://example.com"
 * ```
 *
 * @category Utils
 */
export const stripLeft =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    pipe(
      self,
      stripLeftOption(s),
      Option.getOrElse(() => self),
    );

/**
 * Optionally removes a suffix from the end of the string.
 *
 * - Returns `Option.some` with stripped string if suffix matches.
 * - Returns `Option.none` if string doesn't end with suffix.
 * - Returns new string with suffix removed or `Option.none`.
 * - Use in optional chains where missing suffix is valid.
 *
 * **Example** (Strip suffix optionally)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as Option from 'effect/Option';
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const result = pipe('file.txt', MString.stripRightOption('.txt'));
 * console.log(Option.isSome(result)); // true
 * console.log(Option.getOrElse(result, () => '')); // "file"
 * ```
 *
 * @category Utils
 */
export const stripRightOption = (s: string): MTypes.OneArgFunction<Type, Option.Option<string>> =>
  flow(Option.liftPredicate(String.endsWith(s)), Option.map(takeBut(s.length)));

/**
 * Removes a suffix from the string if present.
 *
 * - Returns string without suffix if suffix matches.
 * - Returns original string if suffix not found.
 * - Always returns a string (never `Option`).
 * - Use for unconditional suffix removal.
 *
 * **Example** (Strip suffix)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.stripRight('.txt')('readme.txt')); // "readme"
 * console.log(MString.stripRight('.md')('readme.txt')); // "readme.txt"
 * ```
 *
 * @category Utils
 */
export const stripRight =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    pipe(
      self,
      stripRightOption(s),
      Option.getOrElse(() => self),
    );

/**
 * Counts non-overlapping occurrences of a pattern in the string.
 *
 * - Supports both string patterns and RegExp patterns.
 * - Counts all non-overlapping matches found via {@link searchAll}.
 * - Returns 0 if no matches found.
 * - Use for pattern frequency analysis.
 *
 * **Example** (Count occurrences)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.count('o')('hello world')); // 2
 * console.log(MString.count(/[aeiou]/g)('hello world')); // 3
 * ```
 *
 * @category Utils
 */

export const count =
  (regexp: RegExp | string): MTypes.NumberFromString =>
  (self) =>
    pipe(self, searchAll(regexp), Array.length);

/**
 * Appends a string to the end.
 *
 * - Simple concatenation: `self + s`.
 * - No trimming or normalization applied.
 * - Returns new string without modifying input.
 * - Use for unconditional concatenation.
 *
 * **Example** (Append string)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.append('.txt')('readme')); // "readme.txt"
 * console.log(MString.append('!')('hello')); // "hello!"
 * ```
 *
 * @category Utils
 */
export const append =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    `${self}${s}`;

/**
 * Appends a string only if the original string is non-empty.
 *
 * - Returns `s` appended if string length > 0.
 * - Returns empty string if input string is empty.
 * - Use to conditionally add suffixes to non-empty strings.
 * - Common for adding punctuation or delimiters.
 *
 * **Example** (Append if not empty)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.appendIfNotEmpty('!')('hello')); // "hello!"
 * console.log(MString.appendIfNotEmpty('!')('')); // ""
 * ```
 *
 * @category Utils
 */
export const appendIfNotEmpty =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    self.length > 0 ? `${self}${s}` : self;

/**
 * Prepends a string to the beginning.
 *
 * - Simple concatenation: `s + self`.
 * - No trimming or normalization applied.
 * - Returns new string without modifying input.
 * - Use for unconditional concatenation.
 *
 * **Example** (Prepend string)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.prepend('http://')('example.com')); // "http://example.com"
 * console.log(MString.prepend('Hello ')('World')); // "Hello World"
 * ```
 *
 * @category Utils
 */
export const prepend =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    `${s}${self}`;

/**
 * Prepends a string only if the original string is non-empty.
 *
 * - Returns `s` prepended if string length > 0.
 * - Returns empty string if input string is empty.
 * - Use to conditionally add prefixes to non-empty strings.
 * - Common for adding protocol or namespace prefixes.
 *
 * **Example** (Prepend if not empty)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.prependIfNotEmpty('>>> ')('log message')); // ">>> log message"
 * console.log(MString.prependIfNotEmpty('>>> ')('')); // ""
 * ```
 *
 * @category Utils
 */
export const prependIfNotEmpty =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    self.length > 0 ? `${s}${self}` : self;

/**
 * Surrounds string with prefix and suffix if non-empty.
 *
 * - Returns `prefix + self + suffix` if string length > 0.
 * - Returns empty string if input string is empty.
 * - Use to wrap content with delimiters or markup (quotes, tags, etc.).
 * - Useful for formatting output conditionally.
 *
 * **Example** (Surround if not empty)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const quoted = MString.surroundIfNotEmpty({
 *   prefix: '"',
 *   suffix: '"',
 * });
 * console.log(quoted('hello')); // '"hello"'
 * console.log(quoted('')); // ""
 * ```
 *
 * @category Utils
 */
export const surroundIfNotEmpty =
  ({
    prefix,
    suffix,
  }: {
    readonly prefix: string;
    readonly suffix: string;
  }): MTypes.StringTransformer =>
  (self) =>
    self.length > 0 ? `${prefix}${self}${suffix}` : self;

/**
 * Replaces the substring between two indexes.
 *
 * - If `startIndex === endIndex`, `replacement` is inserted at that position.
 * - If `startIndex > endIndex`, characters between them appear before and after replacement.
 * - Negative indexes clamped to 0; overlong indexes clamped to string length.
 * - Returns new string with replacement applied.
 * - Use for substring replacement without regex complexity.
 *
 * **Example** (Replace between indexes)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.replaceBetween('***', 5, 10)('hello world')); // "hello*** world"
 * console.log(MString.replaceBetween('X', 3, 3)('abc')); // "abcX"
 * ```
 *
 * @category Utils
 */
export const replaceBetween =
  (replacement: string, startIndex: number, endIndex: number): MTypes.StringTransformer =>
  (self) =>
    self.slice(0, startIndex) + replacement + self.slice(endIndex);

/**
 * Finds first regex match without side effects.
 *
 * - Uses `RegExp.prototype.exec` instead of `String.prototype.match`.
 * - Ignores the `g` flag; always returns only first match.
 * - Resets `lastIndex` before matching; safe with global regexps.
 * - Returns `Option.some` with matched text or `Option.none`.
 * - Use when you need single match without `g` flag complications.
 *
 * **Example** (Match pattern)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MString from '@parischap/effect-lib/MString';
 *
 * const result = pipe('abc123def', MString.match(/\d+/));
 * console.log(Option.getOrElse(result, () => '')); // '123'
 * ```
 *
 * @category Utils
 */
export const match =
  (regExp: RegExp) =>
  (self: Type): Option.Option<string> => {
    regExp.lastIndex = 0;
    return pipe(
      self,
      RegExp.prototype.exec.bind(regExp),
      Option.fromNullOr,
      Option.map(MArray.unsafeGet(0)),
    );
  };

/**
 * Tests whether the string matches a regex pattern.
 *
 * - Type guard version of {@link match} returning boolean.
 * - Ignores `g` flag; always checks single match.
 * - Resets `lastIndex` before matching; safe with global regexps.
 * - Returns `true` if pattern matches, `false` otherwise.
 * - Use for predicate checks without extracting match text.
 *
 * **Example** (Test pattern match)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.matches(/^[A-Z]/)('Hello')); // true
 * console.log(MString.matches(/^[a-z]/)('Hello')); // false
 * ```
 *
 * @category Predicates
 */
export const matches = (regExp: RegExp): Predicate.Predicate<Type> =>
  flow(match(regExp), Option.match({ onNone: Function.constFalse, onSome: Function.constTrue }));

/**
 * Matches a regex pattern and extracts named capturing groups.
 *
 * - Throws if regex has `g` flag or missing expected named groups.
 * - Returns `Option.some` with match text and group values.
 * - Undefined optional capturing groups converted to empty strings.
 * - Use for structured pattern extraction (named groups).
 * - Type-safe group extraction based on `capturingGroupNames` array.
 *
 * **Example** (Extract named groups)
 *
 * ```ts
 * import { Option } from 'effect';
 * import * as MString from '@parischap/effect-lib/MString';
 *
 * const result = MString.matchWithCapturingGroups(
 *   /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
 *   ['year', 'month', 'day'] as const,
 * )('2024-05-01');
 * if (Option.isSome(result)) {
 *   console.log(result.value.groups.year); // '2024'
 * }
 * ```
 *
 * @category Destructors
 */
export const matchWithCapturingGroups =
  <const Names extends ReadonlyArray<string>>(regExp: RegExp, capturingGroupNames: Names) =>
  (
    self: Type,
  ): Option.Option<{
    match: string;
    groups: {
      [k in keyof Names as [k] extends [number] ? Names[k] : never]: string;
    };
  }> => {
    if (regExp.global)
      throw new Error(
        `'matchWithCapturingGroups' was called with global regular expression '${regExp.source}'`,
      );
    return pipe(
      self,
      String.match(regExp),
      // RegExpExecArray extends from Array<string>. But this is a Typescript bug. When there are optional capturing groups, there can be some undefined elements. So let's make javascript and Typescript coherent.
      Option.map((matchArray) => {
        const { groups } = matchArray;
        if (
          groups === undefined ||
          pipe(capturingGroupNames, Array.difference(Object.keys(groups)), MPredicate.isOverOne)
        )
          throw new Error(
            `'matchWithCapturingGroups' was called with regular expression '${regExp.source}' that does not contain expected named capturing groups '${capturingGroupNames.join("', '")}'`,
          );
        return {
          match: matchArray[0],
          // Optional capturing groups can return an undefined value
          groups: pipe(
            groups,
            Record.map(flow(Option.fromUndefinedOr, Option.getOrElse(MFunction.constEmptyString))),
          ),
        } as never;
      }),
    );
  };

/**
 * Splits string at a specific position into two parts.
 *
 * - First part: characters 0 to n-1 (length = n).
 * - Second part: remaining characters.
 * - Negative n clamped to 0; n > length clamped to length.
 * - Returns tuple `[left, right]` always.
 * - Use for position-based string bisection.
 *
 * **Example** (Split at position)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const [left, right] = MString.splitAt(5)('hello world');
 * console.log(left); // "hello"
 * console.log(right); // " world"
 * ```
 *
 * @category Utils
 */
export const splitAt =
  (n: number) =>
  (self: Type): [left: string, right: string] =>
    Tuple.make(String.takeLeft(n)(self), takeRightBut(n)(self));

/**
 * Splits string at a position measured from the end.
 *
 * - Second part: last n characters (length = n).
 * - First part: remaining characters.
 * - Negative n clamped to 0; n > length clamped to length.
 * - Returns tuple `[left, right]` always.
 * - Use for suffix extraction with known length.
 *
 * **Example** (Split at position from right)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const [left, right] = MString.splitAtFromRight(5)('hello world');
 * console.log(left); // "hello "
 * console.log(right); // "world"
 * ```
 *
 * @category Utils
 */
export const splitAtFromRight =
  (n: number) =>
  (self: Type): [left: string, right: string] =>
    pipe(self, splitAt(self.length - n));

/**
 * Splits string into equal chunks with remainder at start.
 *
 * - Chunks are `bitSize` characters each.
 * - First chunk may have 1 to `bitSize` characters (remainder).
 * - Remaining chunks are exactly `bitSize` characters.
 * - `bitSize` must be strictly positive.
 * - Returns reversed array from internal unfold.
 * - Use for fixed-width formatting with leading remainder.
 *
 * **Example** (Split equally with remainder first)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const result = MString.splitEquallyRestAtStart(3)('abcdefgh');
 * console.log(result); // ["ab", "cde", "fgh"] or similar
 * ```
 *
 * @category Utils
 */
export const splitEquallyRestAtStart = (
  bitSize: number,
): MTypes.OneArgFunction<Type, Array<string>> =>
  flow(
    MArray.unfoldNonEmpty(
      flow(
        splitAtFromRight(bitSize),
        Tuple.renameIndices(['1', '0']),
        Tuple.evolve(Tuple.make(Function.identity, Option.liftPredicate(String.isNonEmpty))),
      ),
    ),
    Array.reverse,
  );

/**
 * Splits string into equal chunks with remainder at end.
 *
 * - Chunks are `bitSize` characters each.
 * - Last chunk may have 1 to `bitSize` characters (remainder).
 * - Preceding chunks are exactly `bitSize` characters.
 * - `bitSize` must be strictly positive.
 * - Returns non-empty array of chunks.
 * - Use for fixed-width chunking with trailing remainder.
 *
 * **Example** (Split equally with remainder last)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const result = MString.splitEquallyRestAtEnd(3)('abcdefgh');
 * console.log(result); // ["abc", "def", "gh"]
 * ```
 *
 * @category Utils
 */
export const splitEquallyRestAtEnd = (
  bitSize: number,
): MTypes.OneArgFunction<Type, MTypes.OverOne<string>> =>
  MArray.unfoldNonEmpty(
    flow(
      splitAt(bitSize),
      Tuple.evolve(Tuple.make(Function.identity, Option.liftPredicate(String.isNonEmpty))),
    ),
  );

const tabifyLineBreak: RegExp = new RegExp(MRegExpString.lineBreak, 'g');
/**
 * Adds indentation to each line in the string.
 *
 * - Prepends `tabChar` repeated `count` times to each line.
 * - First line indented; subsequent lines indented after line breaks.
 * - Default `count` is 1.
 * - Uses internal `lineBreak` regex for platform-independent handling.
 * - Returns new string with consistent indentation.
 * - Use for pretty-printing multi-line content.
 *
 * **Example** (Add indentation)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const result = MString.tabify('  ', 1)('line1\nline2\nline3');
 * console.log(result);
 * // "  line1\n  line2\n  line3"
 * ```
 *
 * @category Utils
 */
export const tabify =
  (tabChar: string, count = 1): MTypes.StringTransformer =>
  (self) => {
    const tab = tabChar.repeat(count);
    // replace resets RegExp.prototype.lastIndex after executing
    return tab + self.replace(tabifyLineBreak, '$&' + tab);
  };

/**
 * Tests whether the string contains line break characters.
 *
 * - Returns `true` if any end-of-line character found (platform-independent).
 * - Returns `false` for single-line strings.
 * - Uses internal `lineBreak` regex for detection.
 * - Use to distinguish single-line from multi-line strings.
 *
 * **Example** (Test for multiple lines)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.isMultiLine('hello')); // false
 * console.log(MString.isMultiLine('hello\nworld')); // true
 * ```
 *
 * @category Predicates
 */
export const isMultiLine: Predicate.Predicate<Type> = (self) => MRegExp.lineBreak.test(self);

/**
 * Tests whether the string is a valid semantic version.
 *
 * - Format: `major.minor.patch[-prerelease][+build]`.
 * - Uses internal `semVer` regex for validation.
 * - Returns `true` if matches SemVer spec, `false` otherwise.
 * - Use to validate version strings.
 *
 * **Example** (Test semantic version)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.isSemVer('1.0.0')); // true
 * console.log(MString.isSemVer('1.0.0-alpha')); // true
 * console.log(MString.isSemVer('1.0')); // false
 * ```
 *
 * @category Predicates
 */
export const isSemVer: Predicate.Predicate<Type> = (self) => MRegExp.semVer.test(self);

/**
 * Tests whether the string is a valid email address.
 *
 * - Uses internal `email` regex for validation.
 * - Returns `true` if matches email pattern, `false` otherwise.
 * - Note: No format is fully RFC-compliant; use for basic validation.
 * - Use to validate user input emails.
 *
 * **Example** (Test email)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.isEmail('user@example.com')); // true
 * console.log(MString.isEmail('invalid.email')); // false
 * ```
 *
 * @category Predicates
 */
export const isEmail: Predicate.Predicate<Type> = (self) => MRegExp.email.test(self);

/**
 * Tests whether the string has exactly the specified length.
 *
 * - Returns `true` if `self.length === l`.
 * - Returns `false` otherwise.
 * - Use for length validation in predicates or guards.
 *
 * **Example** (Test length)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const isLengthFive = MString.hasLength(5);
 * console.log(isLengthFive('hello')); // true
 * console.log(isLengthFive('hi')); // false
 * ```
 *
 * @category Predicates
 */
export const hasLength =
  (l: number): Predicate.Predicate<Type> =>
  (self) =>
    self.length === l;

/**
 * Removes `n` characters from every `m`-character chunk from the right.
 *
 * - Splits string into `(m + n)`-character chunks.
 * - Keeps first `m` characters of each chunk.
 * - Discards last `n` characters of each chunk.
 * - If `n === 0`, returns string unchanged.
 * - `m` and `n` must be positive integers.
 * - Use for removing trailing characters at regular intervals (e.g., removing formatting).
 *
 * **Example** (Remove characters at intervals)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * const removeHyphens = MString.removeNCharsEveryMCharsFromRight({
 *   m: 3,
 *   n: 1,
 * });
 * console.log(removeHyphens('123-456-789-')); // "123456789"
 * ```
 *
 * @category Utils
 */
export const removeNCharsEveryMCharsFromRight = ({
  m,
  n,
}: {
  readonly m: number;
  readonly n: number;
}): MTypes.StringTransformer =>
  n === 0
    ? Function.identity
    : flow(splitEquallyRestAtStart(m + n), Array.map(String.takeRight(m)), Array.join(''));

/**
 * Tests whether the string is a single ASCII digit character (`0`–`9`).
 *
 * - Returns `true` only for strings of exactly 1 character in range `[0-9]`.
 * - Returns `false` for multi-character strings or non-digit characters.
 * - Returns `false` for non-ASCII digits.
 * - Use to validate single numeric digit input.
 *
 * **Example** (Test digit character)
 *
 * ```ts
 * import * as MString from '@parischap/effect-lib/String/String';
 *
 * console.log(MString.isDigit('5')); // true
 * console.log(MString.isDigit('0')); // true
 * console.log(MString.isDigit('55')); // false
 * console.log(MString.isDigit('a')); // false
 * ```
 *
 * @category Predicates
 */

export const isDigit: Predicate.Predicate<Type> = (self) => {
  const code = self.codePointAt(0);
  if (code === undefined || self.length > 1) return false;
  return code >= 48 && code <= 57;
};
