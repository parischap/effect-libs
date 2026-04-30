/**
 * Extension to the Effect Option module providing interoperability with nullable values and
 * iterators
 */

import type * as Cause from 'effect/Cause';
import type * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type<A> = Option.Option<A>;

/**
 * Type that synthesizes two different ways to represent an optional value: Effect's `Option` and
 * JavaScript's `null`/`undefined`. Useful for APIs that must be accessible to users unfamiliar with
 * the Effect ecosystem.
 *
 * @category Models
 */
export type OptionOrNullable<A> = Option.Option<A> | null | undefined | A;

/**
 * Converts an `OptionOrNullable` value into an `Option`. If the input is already an `Option`, it is
 * returned as-is. Otherwise, `null` and `undefined` become `none` and other values become `some`.
 *
 * @category Utils
 */

export const fromOptionOrNullable = <A>(a: OptionOrNullable<A>): Option.Option<A> =>
  Option.isOption(a) ? a : Option.fromNullishOr(a);

/**
 * Advances `iterator` by one step and wraps the result in an `Option`: returns a `some` of the
 * value if the iterator has not been exhausted, or a `none` otherwise.
 *
 * @category Utils
 */
export const fromNextIteratorValue = <A>(iterator: Iterator<A>): Option.Option<A> => {
  const next = iterator.next();
  return next.done === false ? Option.some(next.value) : Option.none();
};

/**
 * Converts a `Result` into an `Effect`
 *
 * @category Utils
 */
export const asEffect = <A>(self: Type<A>): Effect.Effect<A, Cause.NoSuchElementError> =>
  self.asEffect();
