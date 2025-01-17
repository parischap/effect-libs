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
 * Type utiliy that extracts the source of a predicate or refinement.
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Source<R> = readonly [R] extends readonly [Predicate.Predicate<infer A>] ? A : never;

/**
 * Type utiliy that extracts the target of a predicate or refinement.
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Target<R> =
	readonly [R] extends readonly [Predicate.Refinement<infer _, infer A>] ? A : Source<R>;

/**
 * Type utiliy that extracts the type covered by a refinement or predicate. Returns never when
 * applied to a predicate and its target when applied to a refinement.
 *
 * @since 0.0.6
 * @category Utility types
 */
export type Coverage<R> = Source<R> extends Target<R> ? never : Target<R>;

/**
 * Type utiliy that takes an array/record of predicates or refinements and returns an array/record
 * of their sources
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToSources<T> = {
	readonly [key in keyof T]: Source<T[key]>;
};

/**
 * Type utiliy that takes an array/record of predicates or refinements and returns an array/record
 * of their targets
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToTargets<T> = {
	readonly [key in keyof T]: Target<T[key]>;
};
/**
 * Type utiliy that takes an array/record of predicates or refinements and returns an array/record
 * of their coverages
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToCoverages<T> = {
	readonly [key in keyof T]: Coverage<T[key]>;
};

/**
 * Type utiliy that takes an array/record and returns an array/record of predicates
 *
 * @since 0.0.6
 * @category Utility types
 */
export type SourcesToPredicates<T extends MTypes.NonNullObject> = {
	readonly [key in keyof T]: Predicate.Predicate<T[key]>;
};

/**
 * Same as Predicate.struct but allows field completion and makes it possible to only pass a subset
 * of the object fields even when there are some refinements.
 *
 * @since 0.5.0
 * @category Utils
 */
export const struct =
	<O extends MTypes.NonNullObject, F extends Partial<SourcesToPredicates<MTypes.Data<O>>>>(
		fields: F
	) =>
	(
		o: O
	): o is { readonly [key in keyof O]: key extends keyof F ? Target<F[key]> & O[key] : O[key] } =>
		Predicate.struct(fields as never)(o as never) as never;
