/**
 * Extension to the Effect Predicate module providing type-level utilities for predicates and
 * refinements, an enhanced struct predicate, a strict-equality predicate constructor, and runtime
 * guards for the container/primitive shapes defined in `MTypes`.
 *
 * ## Mental model
 *
 * - **`Predicate.Predicate<A>`** is a function `(a: A) => boolean`.
 * - **`Predicate.Refinement<A, B>`** is a predicate that narrows `A` to `B` when it returns `true`.
 * - This module focuses on **type-level** introspection (`Source`, `Target`, `Coverage`),
 *   **value-level** constructors (`strictEquals`, `struct`), and **runtime guards** for the
 *   container shapes declared in `MTypes` (`OverOne`, `OverTwo`, `Singleton`, `Pair`, plus
 *   primitive vs non-primitive splits and function arity).
 *
 * ## Common tasks
 *
 * - **Construct**: {@link strictEquals}, {@link struct}
 * - **Introspect at type level**: {@link Source}, {@link Target}, {@link Coverage}
 * - **Lift records**: {@link PredicatesToSources}, {@link PredicatesToTargets},
 *   {@link PredicatesToCoverages}, {@link SourcesToPredicates}
 * - **Primitive split**: {@link isPrimitive}, {@link isNonPrimitive}
 * - **Function arity**: {@link isOneArgFunction}, {@link isTwoArgFunction}
 * - **Tuple shapes**: {@link isSingleton}, {@link isReadonlySingleton}, {@link isPair},
 *   {@link isReadonlyPair}, {@link isOverOne}, {@link isReadonlyOverOne}, {@link isOverTwo},
 *   {@link isReadonlyOverTwo}
 *
 * ## Quickstart
 *
 * **Example** (Strict equality and struct refinement)
 *
 * ```ts
 * import { pipe, Array } from 'effect';
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * // strictEquals
 * console.log(pipe([1, 2, 3, 2], Array.filter(MPredicate.strictEquals(2)))); // [2, 2]
 *
 * // struct refinement
 * type Animal = { readonly name: string; readonly age: number | string };
 * const isAdult = MPredicate.struct<Animal, { readonly age: (n: unknown) => n is number }>({
 *   age: (n): n is number => typeof n === 'number' && n >= 18,
 * });
 * ```
 *
 * @see {@link strictEquals} — predicate that tests `===` against a fixed value
 * @see {@link struct} — enhanced `Predicate.struct`
 */

import type * as Effect from 'effect/Effect';
import * as Predicate from 'effect/Predicate';

import type * as MTypes from './types/types.js';

/**
 * An effectful predicate: a function from `Z` to `Effect<boolean, E, R>`.
 *
 * - Use when the predicate result depends on an effectful computation (I/O, async, etc.).
 * - Mirrors `Predicate.Predicate` but lifted into `Effect`.
 *
 * @category Models
 */
export interface EffectPredicate<in Z, out E, out R> {
  (x: Z): Effect.Effect<boolean, E, R>;
}

/**
 * Type utility extracting the source type of a predicate or refinement.
 *
 * - For `Predicate.Predicate<A>` and `Predicate.Refinement<A, B>` it returns `A`.
 * - Useful when generic code must reason about the input of an unknown predicate.
 *
 * **Example** (Extracting the source)
 *
 * ```ts
 * import type * as MPredicate from '@parischap/effect-lib/MPredicate';
 * import type * as Predicate from 'effect/Predicate';
 *
 * type _Source = MPredicate.Source<Predicate.Refinement<unknown, string>>; // unknown
 * ```
 *
 * @category Utility types
 */
export type Source<R extends MTypes.AnyPredicate> = readonly [R] extends readonly [
  Predicate.Predicate<infer A>,
]
  ? A
  : never;

/**
 * Type utility extracting the narrowed type of a predicate or refinement.
 *
 * - For `Predicate.Refinement<A, B>` it returns `B`.
 * - For `Predicate.Predicate<A>` it returns `A` (no narrowing).
 *
 * **Example** (Extracting the target)
 *
 * ```ts
 * import type * as MPredicate from '@parischap/effect-lib/MPredicate';
 * import type * as Predicate from 'effect/Predicate';
 *
 * type _Target = MPredicate.Target<Predicate.Refinement<unknown, string>>; // string
 * ```
 *
 * @category Utility types
 */
export type Target<R extends MTypes.AnyPredicate> = readonly [R] extends readonly [
  Predicate.Refinement<infer _, infer A>,
]
  ? A
  : Source<R>;

/**
 * Type utility extracting the type a refinement narrows to, returning `never` for plain predicates.
 *
 * - Returns `B` for `Predicate.Refinement<A, B>`.
 * - Returns `never` for `Predicate.Predicate<A>` (since plain predicates do not narrow).
 * - Useful for computing what a refinement removes from a remaining input space.
 *
 * @category Utility types
 */
export type Coverage<R extends MTypes.AnyPredicate> = readonly [R] extends readonly [
  Predicate.Refinement<infer _, infer A>,
]
  ? A
  : never;

// Do not use an interface here.
type PredicateArray = ReadonlyArray<MTypes.AnyPredicate>;

/**
 * Type utility mapping an array/record of predicates to an array/record of their sources.
 *
 * @category Utility types
 */
export type PredicatesToSources<T extends PredicateArray> = {
  readonly [key in keyof T]: Source<T[key]>;
};

/**
 * Type utility mapping an array/record of predicates to an array/record of their targets.
 *
 * @category Utility types
 */
export type PredicatesToTargets<T extends PredicateArray> = {
  readonly [key in keyof T]: Target<T[key]>;
};

/**
 * Type utility mapping an array/record of predicates to an array/record of their coverages.
 *
 * @category Utility types
 */
export type PredicatesToCoverages<T extends PredicateArray> = {
  readonly [key in keyof T]: Coverage<T[key]>;
};

/**
 * Type utility mapping an array/record of values to an array/record of predicates over those
 * values.
 *
 * @category Utility types
 */
export type SourcesToPredicates<T extends MTypes.NonPrimitive> = {
  readonly [key in keyof T]: Predicate.Predicate<T[key]>;
};

/**
 * Enhanced version of `Predicate.struct` that supports IDE field completion, allows passing only a
 * subset of the struct fields, and correctly infers a `Refinement` (instead of a plain `Predicate`)
 * even when only some fields use refinements.
 *
 * - Use to validate part of a struct without writing predicates for every field.
 * - Returns a `Refinement` if at least one field's predicate is a refinement, otherwise a plain
 *   `Predicate`.
 * - Fields not provided are not checked.
 *
 * **Example** (Refining a struct on a single field)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * type Person = { readonly name: string; readonly age: number | string };
 *
 * const hasNumericAge = MPredicate.struct<
 *   Person,
 *   { readonly age: (n: unknown) => n is number }
 * >({
 *   age: (n): n is number => typeof n === 'number',
 * });
 *
 * const p: Person = { name: 'Alice', age: 30 };
 * if (hasNumericAge(p)) {
 *   // `p.age` has been narrowed to `number`
 *   console.log(p.age + 1); // 31
 * }
 * ```
 *
 * @category Constructors
 */
export const struct = <
  O extends MTypes.NonPrimitive,
  F extends Partial<SourcesToPredicates<MTypes.Data<O>>>,
>(
  fields: F,
): [Extract<F[keyof F], MTypes.AnyRefinement>] extends [never]
  ? Predicate.Predicate<O>
  : Predicate.Refinement<
      O,
      {
        readonly [key in keyof O]: key extends keyof F
          ? F[key] extends MTypes.AnyPredicate
            ? Target<F[key]> & O[key]
            : never
          : O[key];
      }
    > => Predicate.Struct(fields as never) as never;

/**
 * Builds a predicate that tests strict equality (`===`) against `that`.
 *
 * - Use to filter, partition, or match values that must be referentially equal to a fixed value.
 * - Comparison is `===`, not `Equal.equals`; suitable for primitives or when reference identity is
 *   intended.
 * - The returned predicate accepts any supertype `B` of `that`.
 *
 * **Example** (Filtering with `strictEquals`)
 *
 * ```ts
 * import { pipe, Array } from 'effect';
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(pipe([1, 2, 3, 2, 1], Array.filter(MPredicate.strictEquals(2)))); // [2, 2]
 * ```
 *
 * @category Constructors
 */
export const strictEquals: <B, A extends B>(that: A) => Predicate.Predicate<B> = (that) => (self) =>
  self === that;

/**
 * Refines an `unknown` value to a JavaScript non-primitive (record, class instance, array, or
 * function).
 *
 * - Acts as a type guard narrowing the input to `MTypes.NonPrimitive`.
 * - Excludes `null`; includes functions (unlike `Predicate.isObject`, which excludes them).
 * - Use when distinguishing primitives from anything else in `unknown` data.
 *
 * **Example** (Splitting primitives from non-primitives)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isNonPrimitive({ a: 1 })); // true
 * console.log(MPredicate.isNonPrimitive(() => 1)); // true
 * console.log(MPredicate.isNonPrimitive(null)); // false
 * console.log(MPredicate.isNonPrimitive(42)); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isPrimitive} — the complementary guard
 */
// The `& NonPrimitive` part is useful in case A is `unknown`. A JavaScript object only has string and symbolic keys. So this needs not be checked.
export const isNonPrimitive = <A>(
  input: A,
): input is Exclude<A, MTypes.Primitive> & MTypes.NonPrimitive =>
  input !== null && (typeof input === 'object' || typeof input === 'function');

/**
 * Refines an `unknown` value to a JavaScript primitive (`string`, `number`, `bigint`, `boolean`,
 * `symbol`, `null`, or `undefined`).
 *
 * - Acts as a type guard narrowing the input to `MTypes.Primitive`.
 * - Defined as the negation of {@link isNonPrimitive}.
 *
 * **Example** (Guarding a primitive)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isPrimitive(42)); // true
 * console.log(MPredicate.isPrimitive('hi')); // true
 * console.log(MPredicate.isPrimitive(null)); // true
 * console.log(MPredicate.isPrimitive([1, 2])); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isNonPrimitive} — the complementary guard
 */
// The `& Primitive` part is useful in case A is `unknown`
export const isPrimitive = <A>(
  input: A,
): input is Exclude<A, MTypes.NonPrimitive> & MTypes.Primitive => !isNonPrimitive(input);

/**
 * Refines a function with an unknown number of arguments to one that takes exactly one argument.
 *
 * - Acts as a type guard checking `f.length === 1`.
 * - Useful when working with overloaded callbacks where arity matters.
 *
 * **Example** (Detecting a unary callback)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isOneArgFunction((n: number) => n + 1)); // true
 * console.log(MPredicate.isOneArgFunction((a: number, b: number) => a + b)); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isTwoArgFunction} — guard for binary callbacks
 */
export const isOneArgFunction = <A, R>(
  f: (a: A, ...args: ReadonlyArray<any>) => R,
): f is (a: A) => R => f.length === 1;

/**
 * Refines a function with an unknown number of arguments to one that takes exactly two arguments.
 *
 * - Acts as a type guard checking `f.length === 2`.
 *
 * **Example** (Detecting a binary callback)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isTwoArgFunction((a: number, b: number) => a + b)); // true
 * console.log(MPredicate.isTwoArgFunction((n: number) => n + 1)); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isOneArgFunction} — guard for unary callbacks
 */
export const isTwoArgFunction = <A, B, R>(
  f: (a: A, b: B, ...args: ReadonlyArray<any>) => R,
): f is (a: A, b: B) => R => f.length === 2;

/**
 * Refines an `Array<A>` to a `Singleton<A>` (a tuple with exactly one element).
 *
 * - Acts as a type guard checking `u.length === 1`.
 *
 * **Example** (Guarding a singleton)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isSingleton([5])); // true
 * console.log(MPredicate.isSingleton([5, 6])); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isReadonlySingleton} — readonly variant
 */
export const isSingleton = <A>(u: Array<A>): u is MTypes.Singleton<A> => u.length === 1;

/**
 * Refines a `ReadonlyArray<A>` to a `ReadonlySingleton<A>` (a tuple with exactly one element).
 *
 * - Acts as a type guard checking `u.length === 1`.
 *
 * @category Guards
 *
 * @see {@link isSingleton} — mutable variant
 */
export const isReadonlySingleton = <A>(u: ReadonlyArray<A>): u is MTypes.ReadonlySingleton<A> =>
  u.length === 1;

/**
 * Refines an `Array<A>` to a `Pair<A, A>` (a tuple with exactly two elements).
 *
 * - Acts as a type guard checking `u.length === 2`.
 *
 * **Example** (Guarding a pair)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isPair([5, 6])); // true
 * console.log(MPredicate.isPair([5])); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isReadonlyPair} — readonly variant
 */
export const isPair = <A>(u: Array<A>): u is MTypes.Pair<A, A> => u.length === 2;

/**
 * Refines a `ReadonlyArray<A>` to a `ReadonlyPair<A, A>` (a tuple with exactly two elements).
 *
 * - Acts as a type guard checking `u.length === 2`.
 *
 * @category Guards
 *
 * @see {@link isPair} — mutable variant
 */
export const isReadonlyPair = <A>(u: ReadonlyArray<A>): u is MTypes.ReadonlyPair<A, A> =>
  u.length === 2;

/**
 * Refines an `Array<A>` to an `OverOne<A>` (a non-empty array).
 *
 * - Acts as a type guard checking `u.length > 0`.
 *
 * **Example** (Guarding a non-empty array)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isOverOne([5])); // true
 * console.log(MPredicate.isOverOne([])); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isReadonlyOverOne} — readonly variant
 */
export const isOverOne = <A>(u: Array<A>): u is MTypes.OverOne<A> => u.length > 0;

/**
 * Refines a `ReadonlyArray<A>` to a `ReadonlyOverOne<A>` (a non-empty readonly array).
 *
 * - Acts as a type guard checking `u.length > 0`.
 *
 * @category Guards
 *
 * @see {@link isOverOne} — mutable variant
 */
export const isReadonlyOverOne = <A>(u: ReadonlyArray<A>): u is MTypes.ReadonlyOverOne<A> =>
  u.length > 0;

/**
 * Refines an `Array<A>` to an `OverTwo<A>` (an array with at least two elements).
 *
 * - Acts as a type guard checking `u.length >= 2`.
 *
 * **Example** (Guarding an array with two or more elements)
 *
 * ```ts
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MPredicate.isOverTwo([5, 6])); // true
 * console.log(MPredicate.isOverTwo([5])); // false
 * ```
 *
 * @category Guards
 *
 * @see {@link isReadonlyOverTwo} — readonly variant
 */
export const isOverTwo = <A>(u: Array<A>): u is MTypes.OverTwo<A> => u.length >= 2;

/**
 * Refines a `ReadonlyArray<A>` to a `ReadonlyOverTwo<A>` (a readonly array with at least two
 * elements).
 *
 * - Acts as a type guard checking `u.length >= 2`.
 *
 * @category Guards
 *
 * @see {@link isOverTwo} — mutable variant
 */
export const isReadonlyOverTwo = <A>(u: ReadonlyArray<A>): u is MTypes.ReadonlyOverTwo<A> =>
  u.length >= 2;
