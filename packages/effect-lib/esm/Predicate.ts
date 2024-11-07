/**
 * A simple extension to the Effect Predicate module
 *
 * @since 0.0.6
 */

import { Effect, Predicate } from 'effect';
import * as MTypes from './types.js';

/**
 * Effectful predicate that returns an effectful boolean
 *
 * @since 0.0.6
 * @category Models
 */
export interface EffectPredicate<in Z, out E, out R> {
	(x: Z): Effect.Effect<boolean, E, R>;
}

/**
 * Type that represents a record/array of predicates. From a typescript perspective, this covers
 * arrays, objects, class instances and functions but not not null and undefined
 *
 * @since 0.0.6
 * @category Models
 */
export type AnyPredicateArray = ReadonlyArray<Predicate.Predicate.Any>;

/**
 * Type utiliy that extracts the source of a predicate or refinement.
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Source<R extends Predicate.Predicate.Any> =
	readonly [R] extends readonly [Predicate.Predicate<infer A>] ? A : never;

/**
 * Type utiliy that extracts the target of a predicate or refinement.
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Target<R extends Predicate.Predicate.Any> =
	readonly [R] extends readonly [Predicate.Refinement<infer _, infer A>] ? A : Source<R>;

/**
 * Type utiliy that extracts the type covered by a refinement or predicate. Returns never when
 * applied to a predicate and its target when applied to a refinement.
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Coverage<R extends Predicate.Predicate.Any> =
	Source<R> extends Target<R> ? never : Target<R>;

/**
 * Type utiliy that takes an array of predicates or refinements and returns an array of their
 * sources
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToSources<T extends AnyPredicateArray> = {
	readonly [key in keyof T]: Source<T[key]>;
};

/**
 * Type utiliy that takes an array of predicates or refinements and returns an array of their
 * targets
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToTargets<T extends AnyPredicateArray> = {
	readonly [key in keyof T]: Target<T[key]>;
};

/**
 * Type utiliy that takes an array of predicates or refinements and returns an array of their
 * coverages
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToCoverages<T extends AnyPredicateArray> = {
	readonly [key in keyof T]: Coverage<T[key]>;
};

/**
 * Type utiliy that takes an record of predicates or refinements and returns an record of their
 * sources
 *
 * @since 0.0.6
 * @category Utility types
 */
export type SourcesToPredicates<T extends MTypes.AnyRecord> = {
	readonly [key in keyof T]: Predicate.Predicate<T[key]>;
};

/**
 * Same as Predicate struct but allows field completion and makes it possible to only pass only a
 * subset of the object fields aven when there are some refinements.
 */
/*export const struct = <F extends MTypes.AnyRecord>(
	fields: NoInfer<Partial<SourcesToPredicates<MTypes.Data<F>>>>
): Predicate.Predicate<F> => Predicate.struct(fields as never) as never;*/
