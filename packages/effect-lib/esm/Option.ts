/**
 * Extension to the Effect Option module providing interoperability with nullable values, JavaScript
 * iterators, and `Effect`.
 *
 * ## Mental model
 *
 * - **`Option.Option<A>`** is a sum of `Some<A>` and `None`.
 * - This module focuses on bridging `Option` with non-Effect-aware shapes (nullable values, raw
 *   iterators) and lifting it into `Effect`.
 *
 * ## Common tasks
 *
 * - **Bridge with nullables**: {@link OptionOrNullable}, {@link fromOptionOrNullable}
 * - **Bridge with iterators**: {@link fromNextIteratorValue}
 * - **Bridge with Effect**: {@link asEffect}
 *
 * ## Quickstart
 *
 * **Example** (Bridging from nullable input)
 *
 * ```ts
 * import * as MOption from '@parischap/effect-lib/MOption';
 *
 * console.log(MOption.fromOptionOrNullable(null)); // None
 * console.log(MOption.fromOptionOrNullable(undefined)); // None
 * console.log(MOption.fromOptionOrNullable(42)); // Some(42)
 * ```
 */

import type * as Cause from 'effect/Cause';
import type * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export type Type<A> = Option.Option<A>;

/**
 * Tagged union representing "an optional `A`" using whichever shape callers find natural: an
 * `Option<A>`, a bare `A`, or `null`/`undefined`.
 *
 * - Use at API boundaries that accept input from code unaware of `Option`.
 *
 * @category Models
 */
export type OptionOrNullable<A> = Option.Option<A> | null | undefined | A;

/**
 * Normalizes an {@link OptionOrNullable} to an `Option`.
 *
 * - When the input is already an `Option`, it is returned as-is.
 * - `null` and `undefined` become `Option.none`; any other value becomes `Option.some`.
 *
 * **Example** (Normalize varied inputs)
 *
 * ```ts
 * import { Option } from 'effect';
 * import * as MOption from '@parischap/effect-lib/MOption';
 *
 * console.log(MOption.fromOptionOrNullable(null)); // None
 * console.log(MOption.fromOptionOrNullable(undefined)); // None
 * console.log(MOption.fromOptionOrNullable(42)); // Some(42)
 * console.log(MOption.fromOptionOrNullable(Option.some(7))); // Some(7)
 * ```
 *
 * @category Utils
 */

export const fromOptionOrNullable = <A>(a: OptionOrNullable<A>): Option.Option<A> =>
  Option.isOption(a) ? a : Option.fromNullishOr(a);

/**
 * Advances `iterator` by one step and lifts the result into an `Option`.
 *
 * - Returns `Option.some(value)` when the iterator produced a value, `Option.none` when it is
 *   exhausted.
 *
 * **Example** (Pull next value from an iterator)
 *
 * ```ts
 * import * as MOption from '@parischap/effect-lib/MOption';
 *
 * const it = [1, 2][Symbol.iterator]();
 * console.log(MOption.fromNextIteratorValue(it)); // Some(1)
 * console.log(MOption.fromNextIteratorValue(it)); // Some(2)
 * console.log(MOption.fromNextIteratorValue(it)); // None
 * ```
 *
 * @category Utils
 */
export const fromNextIteratorValue = <A>(iterator: Iterator<A>): Option.Option<A> => {
  const next = iterator.next();
  return next.done === false ? Option.some(next.value) : Option.none();
};

/**
 * Lifts `self` into `Effect`, failing with `NoSuchElementError` when `self` is `Option.none`.
 *
 * **Example** (Use an `Option` inside an `Effect` workflow)
 *
 * ```ts
 * import { Effect, Option } from 'effect';
 * import * as MOption from '@parischap/effect-lib/MOption';
 *
 * const program = Effect.gen(function* () {
 *   const value = yield* MOption.asEffect(Option.some(42));
 *   return value * 2;
 * });
 *
 * Effect.runPromise(program).then(console.log); // 84
 * ```
 *
 * @category Utils
 */
export const asEffect = <A>(self: Type<A>): Effect.Effect<A, Cause.NoSuchElementError> =>
  self.asEffect();
