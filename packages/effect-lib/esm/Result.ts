/**
 * Extension to the Effect Result module providing optional-error recovery, flattening, and lifting
 * into `Effect`.
 *
 * ## Mental model
 *
 * - **`Result.Result<A, E>`** is a synchronous, retry-free `Either`-like sum type with success `A`
 *   and failure `E`.
 * - This module focuses on small bridges: collapse a missing-element failure into an `Option`,
 *   flatten nested `Result`'s, and lift into `Effect`.
 *
 * ## Common tasks
 *
 * - **Handle missing elements**: {@link optionFromOptional}
 * - **Collapse nesting**: {@link flatten}
 * - **Lift into `Effect`**: {@link asEffect}
 *
 * ## Quickstart
 *
 * **Example** (Collapse a `NoSuchElementError` into an `Option`)
 *
 * ```ts
 * import { Cause, Result } from 'effect';
 * import * as MResult from '@parischap/effect-lib/MResult';
 *
 * console.log(MResult.optionFromOptional(Result.succeed(1))); // Success(Some(1))
 * console.log(MResult.optionFromOptional(Result.fail(new Cause.NoSuchElementError())));
 * // Success(None)
 * ```
 */

import { pipe } from 'effect';
import * as Cause from 'effect/Cause';
import type * as Effect from 'effect/Effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export type Type<A, E = never> = Result.Result<A, E>;

/**
 * Converts a `Result<A, E>` whose failure channel may include `NoSuchElementError` into a
 * `Result<Option<A>, Exclude<E, NoSuchElementError>>`.
 *
 * - A `NoSuchElementError` failure becomes `Result.succeed(Option.none())`.
 * - Any other failure is preserved as-is.
 * - A success of `A` becomes `Result.succeed(Option.some(a))`.
 *
 * **Example** (Distinguishing absence from real failures)
 *
 * ```ts
 * import { Cause, Result } from 'effect';
 * import * as MResult from '@parischap/effect-lib/MResult';
 *
 * console.log(MResult.optionFromOptional(Result.succeed(1))); // Success(Some(1))
 * console.log(MResult.optionFromOptional(Result.fail(new Cause.NoSuchElementError())));
 * // Success(None)
 * console.log(MResult.optionFromOptional(Result.fail('boom'))); // Failure('boom')
 * ```
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
 * Flattens a nested `Result<Result<R, L1>, L2>` into `Result<R, L1 | L2>`.
 *
 * @category Utils
 */
export const flatten: <R, L1, L2>(self: Type<Type<R, L1>, L2>) => Type<R, L1 | L2> = Result.flatMap(
  Function.identity,
);

/**
 * Lifts `self` into `Effect`, preserving the failure channel.
 *
 * **Example** (Use a `Result` inside an `Effect` workflow)
 *
 * ```ts
 * import { Effect, Result } from 'effect';
 * import * as MResult from '@parischap/effect-lib/MResult';
 *
 * const program = Effect.gen(function* () {
 *   const value = yield* MResult.asEffect(Result.succeed(42));
 *   return value * 2;
 * });
 *
 * Effect.runPromise(program).then(console.log); // 84
 * ```
 *
 * @category Utils
 */
export const asEffect = <A, E>(self: Type<A, E>): Effect.Effect<A, E> => self.asEffect();
