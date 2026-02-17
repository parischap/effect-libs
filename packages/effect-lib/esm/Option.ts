/** A simple extension to the Effect Option module */

import * as Option from 'effect/Option'

/**
 * Type that synthesizes two different ways to represent an optional value. Useful to open a dev to
 * non effect users
 *
 * @category Models
 */
export type OptionOrNullable<A> = Option.Option<A> | null | undefined | A;

/**
 * Converts an `OptionOrNullable` into an `Option`.
 *
 * @category Utils
 */

export const fromOptionOrNullable = <A>(a: OptionOrNullable<A>): Option.Option<A> =>
  Option.isOption(a) ? a : Option.fromNullable(a);

/**
 * Reads the next value of an Iterator into an Option
 *
 * @category Utils
 */
export const fromNextIteratorValue = <A>(iterator: Iterator<A>): Option.Option<A> => {
  const next = iterator.next();
  return next.done === false ? Option.some(next.value) : Option.none();
};
