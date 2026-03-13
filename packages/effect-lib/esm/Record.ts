/** Extension to the Effect Record module providing unsafe access and zero-parameter function invocation */

import { flow, pipe } from 'effect';

import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';

import * as MFunction from './Function.js';
import * as MPredicate from './Predicate.js';
import * as MTypes from './Types/types.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export interface Type<out A> extends Record.ReadonlyRecord<string, A> {}

/**
 * Returns the value at `key` in `self` without checking whether the key exists. Faster than the
 * Effect version but may return `undefined` for missing keys.
 *
 * @category Utils
 */
export const unsafeGet =
  (key: string) =>
  <A>(self: Type<A>): A =>
    // @ts-expect-error getting record content unsafely
    self[key];

/**
 * Tries to invoke the zero-parameter method named `functionName` on `self`. Returns a `some` of the
 * result if the method exists, takes no parameters, and is not the same function as `exception`
 * (when provided). Returns a `none` otherwise.
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
  (self: MTypes.NonPrimitive): Option.Option<unknown> =>
    pipe(
      self[functionName],
      Option.liftPredicate(MTypes.isFunction),
      Option.filter(
        Predicate.and(
          pipe(
            exception,
            Option.liftPredicate(MTypes.isNotUndefined),
            Option.map(flow(MPredicate.strictEquals, Predicate.not)),
            Option.getOrElse(() => Function.constTrue),
          ),
          flow(MFunction.parameterNumber, MPredicate.strictEquals(0)),
        ),
      ),
      Option.map(MFunction.applyAsThis(self)),
    );

/**
 * Same as `tryZeroParamFunction` but additionally returns a `none` if the result is not a string
 *
 * @category Utils
 */
export const tryZeroParamStringFunction = (params: {
  readonly functionName: string | symbol;
  readonly exception?: MTypes.AnyFunction;
}): MTypes.OneArgFunction<MTypes.NonPrimitive, Option.Option<string>> =>
  flow(tryZeroParamFunction(params), Option.filter(MTypes.isString));
