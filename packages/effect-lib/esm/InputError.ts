/**
 * Tagged error type for input-validation failures, paired with constructors that build the error
 * message and assertion helpers that lift those constructors into `Result`-returning predicates.
 *
 * ## Mental model
 *
 * - **`Type`** is a `Data.TaggedError` whose only field is a human-readable `message`.
 * - For each validation scenario this module exports two functions:
 *   - a **constructor** (e.g. {@link wrongValue}, {@link missized}) that builds an `InputError`
 *     with a pre-formatted message;
 *   - an **assertion** (e.g. {@link assertValue}, {@link assertLength}) that returns a curried
 *     predicate `(input) => Result.Result<input, Type>` using that constructor on failure.
 * - All `name`-bearing inputs default the prefix of the message to `"value"` when omitted.
 *
 * ## Common tasks
 *
 * - **Validate equality**: {@link assertValue} (and constructor {@link wrongValue})
 * - **Validate length**: {@link assertLength}, {@link assertMaxLength} (constructors {@link missized},
 *   {@link oversized})
 * - **Validate range**: {@link assertInRange} (constructor {@link outOfBounds})
 * - **Validate strings**: {@link assertStartsWith}, {@link assertMatches}, {@link match},
 *   {@link assertEmpty} (constructors {@link notStartingWith}, {@link notMatching}, {@link notEmpty})
 *
 * ## Quickstart
 *
 * **Example** (Validate a value)
 *
 * ```ts
 * import { Result, pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * console.log(pipe('admin', MInputError.assertValue({ expected: 'admin', name: 'role' })));
 * // Success('admin')
 *
 * console.log(pipe('user', MInputError.assertValue({ expected: 'admin', name: 'role' })));
 * // Failure(InputError("Expected role to be: 'admin'. Actual: 'user'"))
 * ```
 */

import { flow, pipe } from 'effect';
import * as Data from 'effect/Data';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as String from 'effect/String';

import * as MPredicate from './Predicate.js';
import * as MString from './String/String.js';
import * as MTypes from './types/types.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/InputError/';

/**
 * Tagged error returned by every assertion in this module.
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
  readonly message: string;
}> {}

const nameLabel: MTypes.OneArgFunction<string | undefined, string> = flow(
  Option.liftPredicate(MTypes.isString),
  Option.getOrElse(Function.constant('value')),
);

/**
 * Builds an `InputError` for a value that did not match the expected one.
 *
 * - String operands are quoted with single quotes in the message; other primitives are stringified
 *   with `toString`.
 * - `name` defaults to `"value"` when omitted.
 *
 * **Example** (Manual error construction)
 *
 * ```ts
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * console.log(MInputError.wrongValue({ expected: 'admin', actual: 'user', name: 'role' }).message);
 * // "Expected role to be: 'admin'. Actual: 'user'"
 * ```
 *
 * @see {@link assertValue} — assertion-style counterpart
 *
 * @category Constructors
 */
export const wrongValue = <T extends MTypes.NonNullablePrimitive>({
  expected,
  actual,
  name,
}: {
  readonly expected: T;
  readonly actual: T;
  readonly name?: string;
}) => {
  const expectedString = MTypes.isString(expected) ? `'${expected}'` : expected.toString();
  const actualString = MTypes.isString(actual) ? `'${actual}'` : actual.toString();
  return new Type({
    message: `Expected ${nameLabel(name)} to be: ${expectedString}. Actual: ${actualString}`,
  });
};

/**
 * Asserts that `input === expected` (using strict equality).
 *
 * - Returns `Result.success(input)` when the equality holds, otherwise `Result.failure` with a
 *   {@link wrongValue} error.
 *
 * **Example** (Equality check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * const isAdmin = MInputError.assertValue({ expected: 'admin', name: 'role' });
 *
 * console.log(pipe('admin', isAdmin)); // Success('admin')
 * console.log(pipe('user', isAdmin)); // Failure(InputError(...))
 * ```
 *
 * @category Utils
 */
export const assertValue = <T extends MTypes.NonNullablePrimitive>(params: {
  readonly expected: NoInfer<T>;
  readonly name?: string;
}): MTypes.OneArgFunction<T, Result.Result<T, Type>> =>
  Result.liftPredicate(MPredicate.strictEquals(params.expected), (actual) =>
    wrongValue({ ...params, actual }),
  );

/**
 * Builds an `InputError` for an array-like value whose length differs from the expected one.
 *
 * @see {@link assertLength} — assertion-style counterpart
 *
 * @category Constructors
 */
export const missized = ({
  expected,
  actual,
  name,
}: {
  readonly expected: number;
  readonly actual: number;
  readonly name?: string;
}) =>
  new Type({
    message: `Expected length of ${nameLabel(name)} to be: ${MString.fromNumber(10)(expected)}.\
 Actual: ${MString.fromNumber(10)(actual)}`,
  });

/**
 * Asserts that `input.length === expected`.
 *
 * - Works with any `ArrayLike<unknown>` or `string`.
 * - Returns a {@link missized} error on failure.
 *
 * **Example** (Length check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * console.log(pipe('abc', MInputError.assertLength({ expected: 3 }))); // Success('abc')
 * console.log(pipe('abcd', MInputError.assertLength({ expected: 3 }))); // Failure(InputError(...))
 * ```
 *
 * @category Utils
 */
export const assertLength = (params: {
  readonly expected: number;
  readonly name?: string;
}): (<A extends ArrayLike<unknown> | string>(self: A) => Result.Result<A, Type>) =>
  Result.liftPredicate(
    (arrayLike) => arrayLike.length === params.expected,
    (actual) => missized({ ...params, actual: actual.length }),
  );

/**
 * Builds an `InputError` for an array-like value whose length exceeds the expected upper bound.
 *
 * @see {@link assertMaxLength} — assertion-style counterpart
 *
 * @category Constructors
 */
export const oversized = ({
  expected,
  actual,
  name,
}: {
  readonly expected: number;
  readonly actual: number;
  readonly name?: string;
}) =>
  new Type({
    message: `Expected length of ${nameLabel(name)} to be at most(included): ${MString.fromNumber(10)(expected)}.\
 Actual: ${MString.fromNumber(10)(actual)}`,
  });

/**
 * Asserts that `input.length <= expected`.
 *
 * - Works with any `ArrayLike<unknown>` or `string`.
 * - Returns an {@link oversized} error on failure.
 *
 * **Example** (Maximum length check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * const within10 = MInputError.assertMaxLength({ expected: 10 });
 * console.log(pipe('hello', within10)); // Success('hello')
 * console.log(pipe('hello world!', within10)); // Failure(InputError(...))
 * ```
 *
 * @category Utils
 */
export const assertMaxLength = (params: {
  readonly expected: number;
  readonly name?: string;
}): (<A extends ArrayLike<unknown> | string>(self: A) => Result.Result<A, Type>) =>
  Result.liftPredicate(
    (arrayLike) => arrayLike.length <= params.expected,
    (actual) => oversized({ ...params, actual: actual.length }),
  );

/**
 * Builds an `InputError` for a numeric value that fell outside `[min, max]`.
 *
 * - `minIncluded` / `maxIncluded` control whether the corresponding bound is inclusive.
 * - `offset` is added to `min`, `max` and `actual` only when formatting the message — it is purely
 *   cosmetic and lets callers report bounds in a different unit (e.g. 1-based indexing).
 *
 * @see {@link assertInRange} — assertion-style counterpart
 *
 * @category Constructors
 */
export const outOfBounds = ({
  min,
  max,
  minIncluded,
  maxIncluded,
  offset,
  actual,
  name,
}: {
  readonly min: number;
  readonly max: number;
  readonly minIncluded: boolean;
  readonly maxIncluded: boolean;
  readonly offset: number;
  readonly actual: number;
  readonly name?: string;
}) =>
  new Type({
    message: `Expected ${nameLabel(name)} to be between ${MString.fromNumber(10)(min + offset)}\
 (${minIncluded ? 'included' : 'excluded'}) and ${MString.fromNumber(10)(max + offset)}\
 (${maxIncluded ? 'included' : 'excluded'}). Actual: ${MString.fromNumber(10)(actual + offset)}`,
  });

/**
 * Asserts that `input` lies in the interval `[min, max]`, with each bound inclusive or exclusive
 * according to `minIncluded` / `maxIncluded`.
 *
 * - Returns an {@link outOfBounds} error on failure.
 *
 * **Example** (Range check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * const isPercentage = MInputError.assertInRange({
 *   min: 0,
 *   max: 100,
 *   minIncluded: true,
 *   maxIncluded: true,
 *   offset: 0,
 *   name: 'percentage',
 * });
 * console.log(pipe(50, isPercentage)); // Success(50)
 * console.log(pipe(150, isPercentage)); // Failure(InputError(...))
 * ```
 *
 * @category Utils
 */
export const assertInRange = (params: {
  readonly min: number;
  readonly max: number;
  readonly minIncluded: boolean;
  readonly maxIncluded: boolean;
  readonly offset: number;
  readonly name?: string;
}): MTypes.OneArgFunction<number, Result.Result<number, Type>> =>
  Result.liftPredicate(
    Predicate.and(
      params.minIncluded
        ? Number.isGreaterThanOrEqualTo(params.min)
        : Number.isGreaterThan(params.min),
      params.maxIncluded ? Number.isLessThanOrEqualTo(params.max) : Number.isLessThan(params.max),
    ),
    (actual) => outOfBounds({ ...params, actual }),
  );

/**
 * Builds an `InputError` for a string that does not start with `startString`.
 *
 * @see {@link assertStartsWith} — assertion-style counterpart
 *
 * @category Constructors
 */
export const notStartingWith = ({
  startString,
  actual,
  name,
}: {
  readonly startString: string;
  readonly actual: string;
  readonly name?: string;
}) =>
  new Type({
    message: `Expected ${nameLabel(name)} to start with '${startString}'. Actual: '${actual}'`,
  });

/**
 * Asserts that `input` starts with `startString`.
 *
 * - Returns a {@link notStartingWith} error on failure.
 *
 * **Example** (Prefix check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * console.log(pipe('hello world', MInputError.assertStartsWith({ startString: 'hello' })));
 * // Success('hello world')
 * ```
 *
 * @category Utils
 */
export const assertStartsWith = (params: {
  readonly startString: string;
  readonly name?: string;
}): MTypes.OneArgFunction<string, Result.Result<string, Type>> =>
  Result.liftPredicate(String.startsWith(params.startString), (actual) =>
    notStartingWith({ ...params, actual }),
  );

/**
 * Builds an `InputError` for a string that does not match a given regular expression.
 *
 * - `regExpDescriptor` is the human-readable description used in the error message (e.g.
 *   `"a valid email"`).
 *
 * @see {@link assertMatches} — assertion-style counterpart
 *
 * @category Constructors
 */
export const notMatching = ({
  regExpDescriptor,
  actual,
  name,
}: {
  readonly regExpDescriptor: string;
  readonly actual: string;
  readonly name?: string;
}) =>
  new Type({
    message: `Expected ${nameLabel(name)} to be ${regExpDescriptor}. Actual: '${actual}'`,
  });

/**
 * Asserts that `input` matches `regExp`.
 *
 * - Returns the matched input on success, a {@link notMatching} error on failure.
 *
 * **Example** (Regex check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * console.log(
 *   pipe('hello', MInputError.assertMatches({ regExp: /^[a-z]+$/, regExpDescriptor: 'lowercase letters' })),
 * );
 * // Success('hello')
 * ```
 *
 * @see {@link match} — variant returning the matched substring
 *
 * @category Utils
 */
export const assertMatches = (params: {
  readonly regExp: RegExp;
  readonly regExpDescriptor: string;
  readonly name?: string;
}): MTypes.OneArgFunction<string, Result.Result<string, Type>> =>
  Result.liftPredicate(MString.matches(params.regExp), (actual) =>
    notMatching({ ...params, actual }),
  );

/**
 * Returns the substring of `input` matching `regExp`. Returns a {@link notMatching} error when
 * `input` does not match.
 *
 * - Differs from {@link assertMatches} in that the success value is the **matched substring**, not
 *   the whole input.
 *
 * **Example** (Extract first match)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * console.log(
 *   pipe('abc123', MInputError.match({ regExp: /\d+/, regExpDescriptor: 'digits' })),
 * );
 * // Success('123')
 * ```
 *
 * @see {@link assertMatches} — variant preserving the original input on success
 *
 * @category Utils
 */
export const match =
  (params: {
    readonly regExp: RegExp;
    readonly regExpDescriptor: string;
    readonly name?: string;
  }) =>
  (self: string): Result.Result<string, Type> =>
    pipe(
      self,
      MString.match(params.regExp),
      Result.fromOption(() => notMatching({ ...params, actual: self })),
    );

/**
 * Builds an `InputError` for a string that should have been empty.
 *
 * @see {@link assertEmpty} — assertion-style counterpart
 *
 * @category Constructors
 */
export const notEmpty = ({ actual, name }: { readonly actual: string; readonly name?: string }) =>
  new Type({
    message: `Expected ${nameLabel(name)} to be empty. Actual: '${actual}'`,
  });

/**
 * Asserts that `input` is the empty string.
 *
 * - Returns a {@link notEmpty} error on failure.
 *
 * **Example** (Empty check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MInputError from '@parischap/effect-lib/MInputError';
 *
 * console.log(pipe('', MInputError.assertEmpty())); // Success('')
 * console.log(pipe('x', MInputError.assertEmpty())); // Failure(InputError(...))
 * ```
 *
 * @category Utils
 */
export const assertEmpty = (
  params: {
    readonly name?: string;
  } = {},
): MTypes.OneArgFunction<string, Result.Result<string, Type>> =>
  Result.liftPredicate(String.isEmpty, (actual) => notEmpty({ ...params, actual }));
