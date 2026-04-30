/**
 * Extension to the Effect Predicate module providing type-level utilities for
 * predicates/refinements and an enhanced struct predicate
 */

import type * as Effect from 'effect/Effect';
import * as Predicate from 'effect/Predicate';

import type * as MTypes from './types/types.js';

/**
 * An effectful predicate: a function from `Z` to `Effect<boolean, E, R>`
 *
 * @category Models
 */
export interface EffectPredicate<in Z, out E, out R> {
  (x: Z): Effect.Effect<boolean, E, R>;
}

/**
 * Type utility that extracts the source of a predicate or refinement.
 *
 * @category Utility types
 */
export type Source<R extends MTypes.AnyPredicate> = readonly [R] extends readonly [
  Predicate.Predicate<infer A>,
]
  ? A
  : never;

/**
 * Type utility that extracts the target of a predicate or refinement.
 *
 * @category Utility types
 */
export type Target<R extends MTypes.AnyPredicate> = readonly [R] extends readonly [
  Predicate.Refinement<infer _, infer A>,
]
  ? A
  : Source<R>;

/**
 * Type utility that extracts the type covered by a refinement or predicate. Returns never when
 * applied to a predicate and its target when applied to a refinement.
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
 * Type utility that takes an array of predicates or refinements and returns an array/record of
 * their sources
 *
 * @category Utility types
 */
export type PredicatesToSources<T extends PredicateArray> = {
  readonly [key in keyof T]: Source<T[key]>;
};

/**
 * Type utility that takes an array/record of predicates or refinements and returns an array/record
 * of their targets
 *
 * @category Utility types
 */
export type PredicatesToTargets<T extends PredicateArray> = {
  readonly [key in keyof T]: Target<T[key]>;
};
/**
 * Type utility that takes an array/record of predicates or refinements and returns an array/record
 * of their coverages
 *
 * @category Utility types
 */
export type PredicatesToCoverages<T extends PredicateArray> = {
  readonly [key in keyof T]: Coverage<T[key]>;
};

/**
 * Type utility that takes an array/record and returns an array/record of predicates
 *
 * @category Utility types
 */
export type SourcesToPredicates<T extends MTypes.NonPrimitive> = {
  readonly [key in keyof T]: Predicate.Predicate<T[key]>;
};

/**
 * Enhanced version of `Predicate.struct` that supports IDE field completion, allows passing only a
 * subset of the struct fields, and correctly infers refinement types even when only some fields use
 * refinements.
 *
 * @category Utils
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
 * Creates a predicate that tests strict equality (`===`) against the given value
 *
 * @category Constructors
 */
export const strictEquals: <B, A extends B>(that: A) => Predicate.Predicate<B> = (that) => (self) =>
  self === that;
