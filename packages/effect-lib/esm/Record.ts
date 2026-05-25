/**
 * Extension to the Effect Record module providing unsafe field access and helpers for invoking
 * zero-argument methods reflectively.
 *
 * ## Mental model
 *
 * - **`Type<K,A>`** is `Record.ReadonlyRecord<K, A>`, i.e. a plain JavaScript object used as a
 *   string-keyed map.
 * - The reflective helpers ({@link tryZeroParamFunction}, {@link tryZeroParamStringFunction}) are
 *   used by formatters like the `pretty-print` package to discover whether a value defines a custom
 *   string representation (`toString`, `toJSON`, …).
 *
 * ## Common tasks
 *
 * - **Unchecked access**: {@link unsafeGet}
 * - **Reflective invocation**: {@link tryZeroParamFunction}, {@link tryZeroParamStringFunction}
 *
 * ## Quickstart
 *
 * **Example** (Try invoking `toJSON` on a value)
 *
 * ```ts
 * import * as MRecord from '@parischap/effect-lib/MRecord';
 *
 * const date = new Date('2024-01-01T00:00:00Z');
 * console.log(MRecord.tryZeroParamFunction({ functionName: 'toJSON' })(date));
 * // Some('2024-01-01T00:00:00.000Z')
 * ```
 */

import { flow, pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import type * as Record from 'effect/Record';

import type * as MTypes from './types/types.js';

import * as MFunction from './Function.js';
import * as MPredicate from './Predicate.js';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export type Type<K extends string | symbol, A> = Record.ReadonlyRecord<K, A>;

/**
 * Returns the value at `key` in `self` without checking that the key exists.
 *
 * - Use only when the presence of `key` is guaranteed by construction.
 * - Returns `undefined` (typed as `A`) when `key` is missing.
 *
 * **Example** (Unchecked access)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MRecord from '@parischap/effect-lib/MRecord';
 *
 * console.log(pipe({ a: 1, b: 2 }, MRecord.unsafeGet('a'))); // 1
 * ```
 *
 * @category Utils
 */
export const unsafeGet =
  <K extends string | symbol>(key: NoInfer<K>) =>
  <A>(self: Type<K, A>): A =>
    self[key];

/**
 * Tries to invoke the zero-argument method named `functionName` on `self`.
 *
 * - Returns `Option.some(result)` when `self[functionName]` is a function declaring zero parameters
 *   and is not the same reference as `exception` (when `exception` is supplied).
 * - Returns `Option.none` when the property is missing, not a function, declares one or more
 *   parameters, or matches `exception`.
 * - The `exception` parameter is useful to skip an inherited default (e.g.
 *   `Object.prototype.toString` when probing for a custom `toString`).
 *
 * **Example** (Detect a custom `toString`)
 *
 * ```ts
 * import * as MRecord from '@parischap/effect-lib/MRecord';
 *
 * const tryCustomToString = MRecord.tryZeroParamFunction({
 *   functionName: 'toString',
 *   exception: Object.prototype.toString,
 * });
 *
 * console.log(tryCustomToString(new Date(0))); // Some('Thu Jan 01 1970 ...')
 * console.log(tryCustomToString({ a: 1 })); // None
 * ```
 *
 * @category Utils
 */
export const tryZeroParamFunction =
  ({
    functionName,
    exception,
  }: {
    readonly functionName: string | symbol;
    readonly exception?: MTypes.AnyFunction;
  }) =>
  <K extends string | symbol>(self: Type<K, unknown>): Option.Option<unknown> =>
    pipe(
      (self as Type<string | symbol, unknown>)[functionName],
      Option.liftPredicate((u): u is MTypes.AnyFunction => Predicate.isFunction(u)),
      Option.filter(
        Predicate.and(
          pipe(
            exception,
            Option.liftPredicate(Predicate.isNotUndefined),
            Option.map(flow(MPredicate.strictEquals, Predicate.not)),
            Option.getOrElse(() => Function.constTrue),
          ),
          flow(MFunction.parameterNumber, MPredicate.strictEquals(0)),
        ),
      ),
      Option.map(MFunction.applyAsThis(self)),
    );

/**
 * Same as {@link tryZeroParamFunction} but additionally returns `Option.none` when the result is
 * not a `string`.
 *
 * - Use when probing for a string-producing method (e.g. `toString`, `toJSON` returning a string).
 *
 * **Example** (Custom string-producing method)
 *
 * ```ts
 * import * as MRecord from '@parischap/effect-lib/MRecord';
 *
 * const tryToJSON = MRecord.tryZeroParamStringFunction({ functionName: 'toJSON' });
 * console.log(tryToJSON(new Date('2024-01-01T00:00:00Z')));
 * // Some('2024-01-01T00:00:00.000Z')
 * ```
 *
 * @category Utils
 */
export const tryZeroParamStringFunction = (params: {
  readonly functionName: string | symbol;
  readonly exception?: MTypes.AnyFunction;
}): MTypes.OneArgFunction<MTypes.NonPrimitive, Option.Option<string>> =>
  flow(tryZeroParamFunction(params), Option.filter(Predicate.isString));
