/**
 * Extension to the Effect Result module providing flattening, traversal, and optional error
 * recovery
 */

import { pipe } from 'effect';
import * as Cause from 'effect/Cause';
import type * as Effect from 'effect/Effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type<A, E = never> = Result.Result<A, E>;

/**
 * Converts a `Result` whose failure channel may contain a `NoSuchElementError` into a `Result` of
 * `Option`. A `NoSuchElementError` failure becomes a success of `none`; other failures are
 * preserved; successes are wrapped in `some`.
 *
 * @category Utils
 */
export const optionFromOptional = <A, E>(
  self: Type<A, E>,
): Type<Option.Option<A>, Exclude<E, Cause.NoSuchElementError>> =>
  pipe(
    self,
    Result.map(Option.some),
    Result.orElse((e) =>
      e instanceof Cause.NoSuchElementError
        ? Result.succeed(Option.none<A>())
        : Result.fail(e as Exclude<E, Cause.NoSuchElementError>),
    ),
  );

/**
 * Flattens a nested `Result<Result<R, L1>, L2>` into a single `Result<R, L1 | L2>`
 *
 * @category Utils
 */
export const flatten: <R, L1, L2>(self: Type<Type<R, L1>, L2>) => Type<R, L1 | L2> = Result.flatMap(
  Function.identity,
);

/**
 * Converts a `Result` into an `Effect`
 *
 * @category Utils
 */
export const asEffect = <A, E>(self: Type<A, E>): Effect.Effect<A, E> => self.asEffect();
