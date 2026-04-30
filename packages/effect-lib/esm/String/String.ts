/**
 * Extension to the Effect String module providing search, split, trim, strip, pad, and pattern-
 * matching operations
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as BigInt from 'effect/BigInt';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import type * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import * as MArray from '../Array.js';
import * as MFunction from '../Function.js';
import * as MMatch from '../Match.js';
import * as MPredicate from '../Predicate.js';
import * as MRegExp from '../RegExp.js';
import * as MRegExpString from '../RegExpString.js';
import * as MTuple from '../Tuple.js';
import * as MTypes from '../types/types.js';
import * as MStringFillPosition from './StringFillPosition.js';
import * as MStringSearchResult from './StringSearchResult.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type = string;

/**
 * Builds a string from a primitive value other than `null` and `undefined`. For numbers and
 * bigints, base-10 conversion is assumed. We don't use the .toString() method for numbers because
 * it uses scientific notation for certain numbers
 *
 * @category Constructors
 */
export const fromNonNullablePrimitive = (u: MTypes.NonNullablePrimitive): string =>
  MTypes.isNumber(u) ? fromNumber(10)(u) : u.toString();

/**
 * Builds a string from a primitive value. `null` is converted to the string "null" and `undefined`
 * to the string "undefined". For numbers and bigints, base-10 conversion is assumed.
 *
 * @category Constructors
 */
export const fromPrimitive: MTypes.OneArgFunction<MTypes.Primitive, string> = flow(
  MMatch.make,
  MMatch.when(MTypes.isNotNullable, fromNonNullablePrimitive),
  MMatch.orElse((s) => (s === undefined ? 'undefined' : 'null')),
);

/**
 * Builds a string from an unknown value `u`. Calls fromPrimitive if `u` is a primitive value. Calls
 * `JSON.stringify` otherwise.
 *
 * @category Constructors
 */
export const fromUnknown = (u: unknown): string =>
  MTypes.isPrimitive(u) ? fromPrimitive(u) : JSON.stringify(u, null, 2);

/**
 * Builds a string from a number using the passed `radix`
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
 * Searches for the first occurrence of `regexp` in `self` and returns an MStringSearchResult. You
 * can optionally provide the index from which to start searching. The 'g' flag does not need to be
 * set if you pass a regular expression. As opposed to String.search, regexp special characters do
 * not need to be escaped when passing a string regexp.
 *
 * @category Utils
 */
export const search =
  (regexp: RegExp | string, startIndex = 0) =>
  (self: Type): Option.Option<MStringSearchResult.Type> => {
    if (MTypes.isString(regexp)) {
      const pos = self.indexOf(regexp, startIndex);
      if (pos === -1) return Option.none();
      return Option.some(
        MStringSearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp }),
      );
    }
    const target = self.slice(startIndex);
    regexp.lastIndex = 0;
    const result = regexp.exec(target);
    if (MTypes.isNull(result)) return Option.none();
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
 * Searches for all occurrences of `regexp` in `self` and returns an array of SearchResults. The 'g'
 * flag does not need to be set if you pass a regular expression.
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
 * Searches for the last occurrence of `regexp` in `self` and returns an MStringSearchResult. The
 * 'g' flag does not need to be set if you pass a regular expression.
 *
 * @category Utils
 */
export const searchRight =
  (regexp: RegExp | string) =>
  (self: Type): Option.Option<MStringSearchResult.Type> => {
    if (MTypes.isString(regexp)) {
      const pos = self.lastIndexOf(regexp);
      if (pos === -1) return Option.none();
      return Option.some(
        MStringSearchResult.make({ startIndex: pos, endIndex: pos + regexp.length, match: regexp }),
      );
    }
    return pipe(self, searchAll(regexp), Array.last);
  };

/**
 * Looks from the left for the first substring of `self` that matches `regexp` and returns all
 * characters before that substring. If no occurrence is found, returns `self`. The `g` flag has no
 * effect if you pass a regular expression.
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
 * Looks from the right for the first substring of `self` that matches `regexp` and returns all
 * characters after that substring. If no occurrence is found, returns `self`. The `g` flag does not
 * need to be set if you pass a regular expression.
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
 * Takes all characters from `self` except the `n` last characters. If `n` is negative, the string
 * is returned unchanged. If `n` is greater that the length of the string, an empty string is
 * returned
 *
 * @category Utils
 */
export const takeBut =
  (n: number): MTypes.StringTransformer =>
  (self) =>
    String.takeLeft(self.length - n)(self);

/**
 * Takes all characters from `self` except the `n` first characters. If `n` is negative, the string
 * is returned unchanged. If `n` is greater that the length of the string, an empty string is
 * returned
 *
 * @category Utils
 */
export const takeRightBut =
  (n: number): MTypes.StringTransformer =>
  (self) =>
    String.takeRight(self.length - n)(self);

/**
 * Same as String.trimStart but the character to remove can be specified. `charToRemove` must be a
 * one-character string
 *
 * @category Utils
 */
export const trimStart = (charToRemove: string): MTypes.StringTransformer =>
  flow(Array.dropWhile(MPredicate.strictEquals(charToRemove)), Array.join(''));

/**
 * Same as String.trimEnd but the character to remove can be specified. `charToRemove` must be a
 * one-character string
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
 * Pads a string to the left or to the right (depending on `fillPosition`) with up to `length`
 * characters `fillChar`. `length` should be a positive integer. `fillChar` should be a one-
 * character string. Does nothing if the string to pad has more than `length` characters.
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
 * Trims a string to the left or to the right (depending on `fillPosition`) from character
 * `fillChar`. `fillChar` should be a one-character string. `length` should be a positive integer.
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
 * If `self` starts with `s`, returns a some of `self` stripped of `s`. Otherwise, returns a none
 *
 * @category Utils
 */
export const stripLeftOption = (s: string): MTypes.OneArgFunction<Type, Option.Option<string>> =>
  flow(Option.liftPredicate(String.startsWith(s)), Option.map(takeRightBut(s.length)));

/**
 * If `self` starts with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
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
 * If `self` ends with `s`, returns a some of `self` stripped of `s`. Otherwise, returns a none
 *
 * @category Utils
 */
export const stripRightOption = (s: string): MTypes.OneArgFunction<Type, Option.Option<string>> =>
  flow(Option.liftPredicate(String.endsWith(s)), Option.map(takeBut(s.length)));

/**
 * If `self` ends with `s`, returns `self` stripped of `s`. Otherwise, returns `self`
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
 * Returns the number of non-overlapping occurrences of `regexp` in `self`
 *
 * @category Utils
 */

export const count =
  (regexp: RegExp | string): MTypes.NumberFromString =>
  (self) =>
    pipe(self, searchAll(regexp), Array.length);

/**
 * Appends `s` to `self`
 *
 * @category Utils
 */
export const append =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    `${self}${s}`;

/**
 * Appends `s` to `self` if `self` is not empty. Returns an empty string otherwise
 *
 * @category Utils
 */
export const appendIfNotEmpty =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    self.length > 0 ? `${self}${s}` : self;

/**
 * Prepends `s` to `self`
 *
 * @category Utils
 */
export const prepend =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    `${s}${self}`;

/**
 * Prepends `s` to `self` if `self` is not empty. Returns an empty string otherwise
 *
 * @category Utils
 */
export const prependIfNotEmpty =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    self.length > 0 ? `${s}${self}` : self;

/**
 * Surrounds `self` with `prefix` and `suffix` if `self` is not empty. Returns an empty string
 * otherwise
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
 * Replaces the part of `self` between `startIndex` (included) and `endIndex` (excluded) with
 * `replacement`. If `startIndex` equals `endIndex`, `replacement` is inserted at that position. If
 * `startIndex` is strictly greater than `endIndex`, the characters between `endIndex` and
 * `startIndex` will appear both before and after the replacement. Negative indexes are clamped to
 * `0`; indexes beyond the length of `self` are clamped to `self.length`.
 *
 * @category Utils
 */
export const replaceBetween =
  (replacement: string, startIndex: number, endIndex: number): MTypes.StringTransformer =>
  (self) =>
    self.slice(0, startIndex) + replacement + self.slice(endIndex);

/**
 * A slightly different version of match using RegExp.prototype.exec instead of
 * String.prototype.match. This function will always return only the first match, even if the `g`
 * flag is set. Also, it does not care for the lastIndex property of `regExp`. Good to use in a
 * library when you have no control over the RegExp you receive.
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
 * Returns `true` if `self` fulfills regExp. `false` otherwise. Does the same as
 * RegExp.prototype.test but does not take the g flag into account even if it is set and does not
 * care for the lastIndex property of `regExp`
 *
 * @category Utils
 */
export const matches = (regExp: RegExp): Predicate.Predicate<Type> =>
  flow(match(regExp), Option.match({ onNone: Function.constFalse, onSome: Function.constTrue }));

/**
 * Same as String.match but handles capturing groups. Throws if the global flag of `regExp` is set
 * or if `regExp` does not contain the named groups `capturingGroupNames`.
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
          pipe(capturingGroupNames, Array.difference(Object.keys(groups)), MTypes.isOverOne)
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
 * Splits `self` in two parts at position `n`. The length of the first string is `n` (characters `0`
 * to `n-1`). If `n` is negative, it is taken equal to 0. If it is longer than the length of `self`,
 * it is taken equal to the length of `self`.
 *
 * @category Utils
 */
export const splitAt =
  (n: number) =>
  (self: Type): [left: string, right: string] =>
    Tuple.make(String.takeLeft(n)(self), takeRightBut(n)(self));

/**
 * Splits `self` in two parts at position `n` from the end of `self`. The length of the second
 * string is `n`. If `n` is strictly less than 0, it is taken equal to 0. If `n` is greater than the
 * length of `self`, it is taken equal to the length of self.
 *
 * @category Utils
 */
export const splitAtFromRight =
  (n: number) =>
  (self: Type): [left: string, right: string] =>
    pipe(self, splitAt(self.length - n));

/**
 * Splits `self` in substrings of `bitSize` characters. The length of the first string, if any, is
 * comprised between 1 and `bitSize` characters. `bitSize` must be a strictly positive integer.
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
 * Splits `self` in substrings of `bitSize` characters. The length of the last string, if any, is
 * comprised between 1 and `bitSize` characters. `bitSize` must be a strictly positive integer.
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
 * Adds string `tabChar` `count` times at the beginning of each new line of `self`
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
 * Returns `true` if `self` contains at least one end-of-line character
 *
 * @category Predicates
 */
export const isMultiLine: Predicate.Predicate<Type> = (self) => MRegExp.lineBreak.test(self);

/**
 * Returns true if `self` is a SemVer
 *
 * @category Predicates
 */
export const isSemVer: Predicate.Predicate<Type> = (self) => MRegExp.semVer.test(self);

/**
 * Returns true if `self` is an email
 *
 * @category Predicates
 */
export const isEmail: Predicate.Predicate<Type> = (self) => MRegExp.email.test(self);

/**
 * Returns true if the length of `self` is `l`
 *
 * @category Predicates
 */
export const hasLength =
  (l: number): Predicate.Predicate<Type> =>
  (self) =>
    self.length === l;

/**
 * Removes `n` characters every `m` characters starting from the right of `self`. `m` and `n` must
 * be positive integers.
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
 * Returns `true` if `self` is a single ASCII digit character (`0`-`9`). Returns `false` for multi-
 * character strings or non-digit characters.
 *
 * @category Predicates
 */

export const isDigit: Predicate.Predicate<Type> = (self) => {
  const code = self.codePointAt(0);
  if (code === undefined || self.length > 1) return false;
  return code >= 48 && code <= 57;
};
