/**
 * Extension to the Effect Predicate module providing type-level utilities for predicates and
 * refinements, an enhanced struct predicate, and a strict-equality predicate constructor.
 *
 * ## Mental model
 *
 * - **`Predicate.Predicate<A>`** is a function `(a: A) => boolean`.
 * - **`Predicate.Refinement<A, B>`** is a predicate that narrows `A` to `B` when it returns `true`.
 * - This module focuses on **type-level** introspection (`Source`, `Target`, `Coverage`) and
 *   **value-level** constructors (`strictEquals`, `struct`).
 *
 * ## Common tasks
 *
 * - **Construct**: {@link strictEquals}, {@link struct}
 * - **Introspect at type level**: {@link Source}, {@link Target}, {@link Coverage}
 * - **Lift records**: {@link PredicatesToSources}, {@link PredicatesToTargets},
 *   {@link PredicatesToCoverages}, {@link SourcesToPredicates}
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
 * Type utility mapping an array/record of values to an array/record of predicates over those values.
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
 * const hasNumericAge = MPredicate.struct<Person, { readonly age: (n: unknown) => n is number }>({
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
