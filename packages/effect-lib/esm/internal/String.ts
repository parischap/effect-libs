/**
 * String helpers shared by `MString` and other modules (e.g. `MTemplatePlaceholder`,
 * `MNumberBase10Format`) that `MString` itself depends on. Kept apart from `MString.ts` to avoid
 * circular imports: those modules must not import public `MString`.
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
import * as Tuple from 'effect/Tuple';

import type * as MTypes from '../types/types.js';

import * as MArray from '../Array.js';
import * as MFunction from '../Function.js';
import * as MMatch from '../Match.js';
import * as MPredicate from '../Predicate.js';
import * as MStringFillPosition from '../String/StringFillPosition.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
type Type = string;

/**
 * Converts a number to a string using a specified radix
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
 * Builds a string from a primitive value other than `null` and `undefined`
 *
 * @category Constructors
 */
export const fromNonNullablePrimitive = (u: MTypes.NonNullablePrimitive): string =>
  Predicate.isNumber(u) ? fromNumber(10)(u) : u.toString();

/**
 * Builds a string from a primitive value, handling `null` and `undefined`
 *
 * @category Constructors
 */
export const fromPrimitive: MTypes.OneArgFunction<MTypes.Primitive, string> = flow(
  MMatch.make,
  MMatch.when(Predicate.isNotNullish, fromNonNullablePrimitive),
  MMatch.orElse((s) => (s === undefined ? 'undefined' : 'null')),
);

/**
 * Builds a string from an unknown value
 *
 * @category Constructors
 */
export const fromUnknown = (u: unknown): string =>
  MPredicate.isPrimitive(u) ? fromPrimitive(u) : JSON.stringify(u, null, 2);

/**
 * Removes characters from the start of the string
 *
 * @category Utils
 */
export const trimStart = (charToRemove: string): MTypes.StringTransformer =>
  flow(Array.dropWhile(MPredicate.strictEquals(charToRemove)), Array.join(''));

/**
 * Removes characters from the end of the string
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
 * Pads a string to a specific length with a fill character
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
 * Removes padding characters from left or right of a string
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
 * Appends a string to the end
 *
 * @category Utils
 */
export const append =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    `${self}${s}`;

/**
 * Prepends a string to the beginning
 *
 * @category Utils
 */
export const prepend =
  (s: string): MTypes.StringTransformer =>
  (self) =>
    `${s}${self}`;

/**
 * Finds first regex match without side effects
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
 * Tests whether the string matches a regex pattern
 *
 * @category Predicates
 */
export const matches = (regExp: RegExp): Predicate.Predicate<Type> =>
  flow(match(regExp), Option.match({ onNone: Function.constFalse, onSome: Function.constTrue }));

/**
 * Matches a regex pattern and extracts named capturing groups
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
 * Returns substring excluding the first `n` characters
 *
 * @category Utils
 */
export const takeRightBut =
  (n: number): MTypes.StringTransformer =>
  (self) =>
    String.takeRight(self.length - n)(self);

/**
 * Splits string at a specific position into two parts
 *
 * @category Utils
 */
export const splitAt =
  (n: number) =>
  (self: Type): [left: string, right: string] =>
    Tuple.make(String.takeLeft(n)(self), takeRightBut(n)(self));

/**
 * Splits string at a position measured from the end
 *
 * @category Utils
 */
export const splitAtFromRight =
  (n: number) =>
  (self: Type): [left: string, right: string] =>
    pipe(self, splitAt(self.length - n));

/**
 * Splits string into equal chunks with remainder at start
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
        Tuple.evolve(
          Tuple.make(Function.identity<string>, Option.liftPredicate(String.isNonEmpty)),
        ),
      ),
    ),
    Array.reverse,
  );

/**
 * Removes `n` characters from every `m`-character chunk from the right
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
 * Tests whether the string has exactly the specified length
 *
 * @category Predicates
 */
export const hasLength =
  (l: number): Predicate.Predicate<Type> =>
  (self) =>
    self.length === l;
