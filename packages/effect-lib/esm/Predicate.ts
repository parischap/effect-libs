/**
 * A simple extension to the Effect Predicate module
 *
 * @since 0.0.6
 */

import { Effect, Predicate } from 'effect';

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
 * Type utiliy that takes an array of predicates or refinements and returns an array of their
 * sources
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToSources<T> = {
	readonly [Key in keyof T]: Source<T[Key]>;
};

/**
 * Type utiliy that takes an array/record of predicates or refinements and returns an array/record
 * of their targets
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToTargets<T> = {
	readonly [Key in keyof T]: Target<T[Key]>;
};

/**
 * Type utiliy that takes an array/record of predicates or refinements and returns an array/record
 * of their coverages
 *
 * @since 0.0.6
 * @category Utility types
 */
export type PredicatesToCoverages<T> = {
	readonly [Key in keyof T]: Coverage<T[Key]>;
};

// Seems covered by Effect now
/*export const struct = <F extends Record<string, MTypes.AnyPredicate>>(
	fields: F
): Predicate.Refinement<
	PredicatesToSources<F>,
	PredicatesToTargets<F> extends PredicatesToSources<F> ? PredicatesToTargets<F> : never
> => Predicate.struct(fields) as never;

export const tuple = <T extends ReadonlyArray<MTypes.AnyPredicate>>(
	...elements: T
): Predicate.Refinement<
	PredicatesToSources<T>,
	PredicatesToTargets<T> extends PredicatesToSources<T> ? PredicatesToTargets<T> : never
> => Predicate.tuple(...elements) as never;*/
