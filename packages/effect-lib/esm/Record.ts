/** A simple extension to the Effect Record module */

import { flow, Function, Option, pipe, Predicate, Record } from 'effect';
import * as MFunction from './Function.js';
import * as MPredicate from './Predicate.js';
import * as MTypes from './types/index.js';

/**
 * Unsafe get an element from a record. No checks, faster than the Effect version
 *
 * @category Utils
 */
export const unsafeGet =
  (key: string) =>
  <A>(self: Record.ReadonlyRecord<string, A>): A =>
    // @ts-expect-error getting record content unsafely
    self[key];

/**
 * Tries to call method `functionName` on `self` with no parameters. Returns a `some` of the result
 * if such a function exists, is different from exception (if defined), and takes no parameter.
 * Returns a `none` otherwise
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
 * Same as `tryZeroParamStringFunction` but returns a `none` if the result of the function is not a
 * string
 *
 * @category Utils
 */
export const tryZeroParamStringFunction = (params: {
  readonly functionName: string | symbol;
  readonly exception?: MTypes.AnyFunction;
}): MTypes.OneArgFunction<MTypes.NonPrimitive, Option.Option<string>> =>
  flow(tryZeroParamFunction(params), Option.filter(MTypes.isString));
