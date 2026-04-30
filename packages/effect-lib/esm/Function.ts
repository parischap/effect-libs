/**
 * Extension to the Effect Function module providing utilities for function introspection,
 * memoization, and manipulation
 */

import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';

import type * as MTypes from './types/types.js';

/**
 * Applies `f` to the input value if `condition` is `true`. Returns the input unchanged otherwise.
 *
 * @category Utils
 */
export const fIfTrue =
  <A>({
    condition,
    f,
  }: {
    readonly condition: boolean;
    readonly f: (a: NoInfer<A>) => NoInfer<A>;
  }) =>
  (a: A): A =>
    condition ? f(a) : a;

/**
 * Converts a non-curried dual function into a curried version with the first parameter applied
 * first. If the dual function takes type parameters, they usually need to be passed explicitly.
 *
 * @category Utils
 */

export const flipDual =
  <First, Others extends ReadonlyArray<unknown>, R>(
    self: (first: First, ...others: Others) => R,
  ): ((first: First) => (...others: Others) => R) =>
  (first) =>
  (...b) =>
    self(first, ...b);

/**
 * Returns the expected number of parameters of `f` (i.e., `f.length`)
 *
 * @category Utils
 */
export const parameterNumber = (f: MTypes.AnyFunction): number => f.length;

/**
 * Returns the name of `f` (i.e., `f.name`)
 *
 * @category Utils
 */
export const name = (f: MTypes.AnyFunction): string => f.name;

/**
 * Function to memoize a function that takes no argument. Useful to initialize a time-consuming
 * constant only when it is used (not at startup) provided it is used more than once. Otherwise,
 * this function is useless.
 *
 * Instead of exporting the result of calling this function (which would then take time at startup),
 * create a memoized version of the function and call it in the code when necessary.
 *
 * Note that any unused constant will be tree-shaken, so do not use this function if startup time is
 * not an issue.
 *
 * @category Utils
 *
 * @example
 *   import { MFunction } from '@parischap/effect-lib';
 *
 *   const complexFoo = () => 1;
 *   const memoized = MFunction.once(complexFoo);
 *
 *   export function foo1() {
 *     return memoized() + 1;
 *   }
 *
 *   export function foo2() {
 *     return memoized() + 2;
 *   }
 */

export const once = <A>(f: Function.LazyArg<A>): Function.LazyArg<A> => {
  let store = Option.none<A>();
  const cached: Function.LazyArg<A> = () =>
    pipe(
      store,
      Option.match({
        onNone: () => {
          const result = f();

          store = Option.some(result);
          return result;
        },
        onSome: Function.identity,
      }),
    );
  return cached;
};

/**
 * Calls `self` using `o` as the `this` context
 *
 * @category Utils
 */
export const applyAsThis =
  (o: MTypes.NonPrimitive) =>
  <A>(self: Function.LazyArg<A>): A =>
    self.call(o);

/**
 * Invokes a lazy value, i.e. calls `self` with no arguments
 *
 * @category Utils
 */
export const execute = <A>(self: Function.LazyArg<A>): A => self();

/**
 * A constant function that always returns the empty string
 *
 * @category Utils
 */
export const constEmptyString = Function.constant('' as const);

/**
 * A constant function that always returns a Result.failVoid
 *
 * @category Utils
 */
export const constFailVoid = Function.constant(Result.failVoid);

/**
 * Returns a copy of function `self` with the same behavior but a distinct identity. Useful when a
 * function needs to be distinguished from the original by reference.
 *
 * @category Utils
 */

export const clone = <This, Args extends ReadonlyArray<unknown>, R>(
  self: (this: This, ...args: Args) => R,
): ((this: This, ...args: Args) => R) =>
  function clone(this, ...args) {
    return self.call(this, ...args);
  };

/**
 * The Function.prototype
 *
 * @category Constants
 */
export const proto = Object.getPrototypeOf(Math.max) as MTypes.NonPrimitive;
