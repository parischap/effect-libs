/**
 * Extension to the Effect Function module providing function introspection, lazy memoization,
 * conditional application, and function-identity helpers.
 *
 * ## Mental model
 *
 * - **Functions are values** that can be inspected, copied with a fresh identity, and partially
 *   composed.
 * - All functions are pure unless explicitly noted (`once` and `clone` produce wrappers; `once`
 *   carries internal mutable state).
 *
 * ## Common tasks
 *
 * - **Conditional application**: {@link fIfTrue}
 * - **Currying / shape-shifting**: {@link flipDual}
 * - **Introspection**: {@link parameterNumber}, {@link name}
 * - **Lazy memoization**: {@link once}
 * - **`this` plumbing**: {@link applyAsThis}
 * - **Evaluation**: {@link execute}
 * - **Identity**: {@link clone}
 * - **Constants**: {@link constEmptyString}, {@link constFailVoid}, {@link proto}
 *
 * ## Quickstart
 *
 * **Example** (Curry a dual function and inspect it)
 *
 * ```ts
 * import { Array, pipe } from 'effect';
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * const curriedMap = MFunction.flipDual<
 *   ReadonlyArray<number>,
 *   readonly [(n: number) => number],
 *   ReadonlyArray<number>
 * >(Array.map);
 * console.log(
 *   pipe(
 *     [1, 2, 3],
 *     curriedMap((n) => n * 2),
 *   ),
 * ); // [2, 4, 6]
 * console.log(MFunction.parameterNumber((a: number, b: number) => a + b)); // 2
 * ```
 */

import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';

import type * as MTypes from './types/types.js';

/**
 * Applies `f` to the input value when `condition` is `true`; returns the input unchanged otherwise.
 *
 * - Use to gate a transformation by a flag without breaking the pipeline.
 * - `condition` is captured at construction time and re-read on every call (it does not get
 *   re-evaluated — it is already a `boolean`).
 *
 * **Example** (Conditional doubling)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * const doubleIfFlag = (flag: boolean) =>
 *   MFunction.fIfTrue({ condition: flag, f: (n: number) => n * 2 });
 *
 * console.log(pipe(5, doubleIfFlag(true))); // 10
 * console.log(pipe(5, doubleIfFlag(false))); // 5
 * ```
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
 * Converts an n-ary, data-first function into its curried, data-first equivalent. The first
 * argument becomes the outer parameter; the remaining arguments are taken by the returned
 * function.
 *
 * - Use to feed a built-in `Array.map`-style API into a `pipe` chain.
 * - The TypeScript inference engine cannot recover generic type parameters from a curried wrapper, so
 *   generic `self`'s usually require explicit type arguments at the call site.
 *
 * **Example** (Curry `Array.map`)
 *
 * ```ts
 * import { Array, pipe } from 'effect';
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * const curriedMap = MFunction.flipDual<
 *   ReadonlyArray<number>,
 *   readonly [(n: number) => number],
 *   ReadonlyArray<number>
 * >(Array.map);
 * console.log(
 *   pipe(
 *     [1, 2, 3],
 *     curriedMap((n) => n * 2),
 *   ),
 * ); // [2, 4, 6]
 * ```
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
 * Returns the declared arity of `f` (i.e. `f.length`).
 *
 * - Returns the number of named parameters before the first one with a default value or the rest
 *   parameter.
 *
 * **Example** (Declared arity)
 *
 * ```ts
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * console.log(MFunction.parameterNumber((a: number, b: number) => a + b)); // 2
 * console.log(MFunction.parameterNumber((a: number) => a)); // 1
 * ```
 *
 * @category Utils
 */
export const parameterNumber = (f: MTypes.AnyFunction): number => f.length;

/**
 * Returns `f.name`.
 *
 * - Returns an empty string for anonymous arrow expressions assigned to nothing.
 *
 * **Example** (Function name)
 *
 * ```ts
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * const add = (a: number, b: number) => a + b;
 * console.log(MFunction.name(add)); // 'add'
 * ```
 *
 * @category Utils
 */
export const name = (f: MTypes.AnyFunction): string => f.name;

/**
 * Memoizes a zero-argument function so that `f` runs at most once and subsequent calls return the
 * cached result.
 *
 * - Use to defer the cost of building a constant until the first time it is actually needed, provided
 *   that constant is read more than once.
 * - The wrapper holds mutable state internally; create one wrapper per cache slot.
 *
 * **Example** (Lazy initialization)
 *
 * ```ts
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * let calls = 0;
 * const expensive = MFunction.once(() => {
 *   calls++;
 *   return 42;
 * });
 *
 * console.log(expensive()); // 42
 * console.log(expensive()); // 42
 * console.log(calls); // 1
 * ```
 *
 * @category Utils
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
 * Calls `self` with `o` bound as the `this` context.
 *
 * - Use to invoke a method-like function whose body relies on `this`.
 *
 * **Example** (Bind `this` and invoke)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * function getValue(this: { readonly value: number }) {
 *   return this.value;
 * }
 *
 * console.log(pipe(getValue, MFunction.applyAsThis({ value: 42 }))); // 42
 * ```
 *
 * @category Utils
 */
export const applyAsThis =
  (o: MTypes.NonPrimitive) =>
  <A>(self: Function.LazyArg<A>): A =>
    self.call(o);

/**
 * Invokes a lazy value, i.e. calls `self` with no argument.
 *
 * - Use as the terminal step of a pipeline that builds up a `LazyArg<A>`.
 *
 * **Example** (Force a lazy value)
 *
 * ```ts
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * console.log(MFunction.execute(() => 42)); // 42
 * ```
 *
 * @category Utils
 */
export const execute = <A>(self: Function.LazyArg<A>): A => self();

/**
 * A constant lazy value always returning `''`.
 *
 * @category Constants
 */
export const constEmptyString = Function.constant('' as const);

/**
 * A constant lazy value always returning `Result.failVoid`.
 *
 * - Useful as the failure callback of helpers like `Result.liftPredicate` when no error context is
 *   needed.
 *
 * @category Constants
 */
export const constFailVoid = Function.constant(Result.failVoid);

/**
 * Returns a fresh wrapper around `self` that exhibits the same behavior but is referentially
 * distinct.
 *
 * - Use when downstream code keys off function identity (e.g. cache invalidation, equality checks).
 *
 * **Example** (Distinct identity, identical behavior)
 *
 * ```ts
 * import * as MFunction from '@parischap/effect-lib/MFunction';
 *
 * const original = (a: number) => a * 2;
 * const copy = MFunction.clone(original);
 *
 * console.log(original === copy); // false
 * console.log(original(5) === copy(5)); // true
 * ```
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
 * The `Function.prototype` object, captured via the prototype of a built-in function.
 *
 * - Useful as a reference when checking whether an object inherits from `Function.prototype`.
 *
 * @category Constants
 */
export const proto = Object.getPrototypeOf(Math.max) as MTypes.NonPrimitive;
