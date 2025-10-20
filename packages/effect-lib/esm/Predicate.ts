/** A simple extension to the Effect Predicate module */

import { Effect, Predicate } from 'effect';
import * as MTypes from './types.js';

/**
 * Effectful predicate that returns an effectful boolean
 *
 * @category Models
 */
export interface EffectPredicate<in Z, out E, out R> {
  (x: Z): Effect.Effect<boolean, E, R>;
}

/**
 * Type utiliy that extracts the source of a predicate or refinement.
 *
 * @category Utility types
 */
export type Source<R extends MTypes.AnyPredicate> =
  readonly [R] extends readonly [Predicate.Predicate<infer A>] ? A : never;

/**
 * Type utiliy that extracts the target of a predicate or refinement.
 *
 * @category Utility types
 */
export type Target<R extends MTypes.AnyPredicate> =
  readonly [R] extends readonly [Predicate.Refinement<infer _, infer A>] ? A : Source<R>;

/**
 * Type utiliy that extracts the type covered by a refinement or predicate. Returns never when
 * applied to a predicate and its target when applied to a refinement.
 *
 * @category Utility types
 */
export type Coverage<R extends MTypes.AnyPredicate> =
  readonly [R] extends readonly [Predicate.Refinement<infer _, infer A>] ? A : never;

// Do not use an interface here.
type PredicateArray = ReadonlyArray<MTypes.AnyPredicate>;

/**
 * Type utiliy that takes an array of predicates or refinements and returns an array/record of their
 * sources
 *
 * @category Utility types
 */
export type PredicatesToSources<T extends PredicateArray> = {
  readonly [key in keyof T]: Source<T[key]>;
};

/**
 * Type utiliy that takes an array/record of predicates or refinements and returns an array/record
 * of their targets
 *
 * @category Utility types
 */
export type PredicatesToTargets<T extends PredicateArray> = {
  readonly [key in keyof T]: Target<T[key]>;
};
/**
 * Type utiliy that takes an array/record of predicates or refinements and returns an array/record
 * of their coverages
 *
 * @category Utility types
 */
export type PredicatesToCoverages<T extends PredicateArray> = {
  readonly [key in keyof T]: Coverage<T[key]>;
};

/**
 * Type utiliy that takes an array/record and returns an array/record of predicates
 *
 * @category Utility types
 */
export type SourcesToPredicates<T extends MTypes.NonPrimitive> = {
  readonly [key in keyof T]: Predicate.Predicate<T[key]>;
};

/**
 * Same as Predicate.struct but allows field completion and makes it possible to only pass a subset
 * of the object fields even when there are some refinements.
 *
 * @category Utils
 */
export const struct = <
  O extends MTypes.NonPrimitive,
  F extends Partial<SourcesToPredicates<MTypes.Data<O>>>,
>(
  fields: F,
): [Extract<F[keyof F], MTypes.AnyRefinement>] extends [never] ? Predicate.Predicate<O>
: Predicate.Refinement<
    O,
    {
      readonly [key in keyof O]: key extends keyof F ?
        F[key] extends MTypes.AnyPredicate ?
          Target<F[key]> & O[key]
        : never
      : O[key];
    }
  > => Predicate.struct(fields as never) as never;

/**
 * Strict equality predicate
 *
 * @category Constructors
 */
export const strictEquals: <B, A extends B>(that: A) => Predicate.Predicate<B> = (that) => (self) =>
  self === that;
