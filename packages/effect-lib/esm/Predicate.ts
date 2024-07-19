import { Effect, Predicate } from 'effect';
import * as MTypes from './types.js';

/**
 * Predicate that returns an effect of a boolean
 * @category models
 */
export interface EffectPredicate<in Z, out E, out R> {
	(x: Z): Effect.Effect<boolean, E, R>;
}

export const fromOredPredicates = <A>(
	predicates: Iterable<Predicate.Predicate<A>>
): Predicate.Predicate<A> => {
	return (a: A) => {
		for (const predicate of predicates) {
			if (predicate(a) === true) {
				return true;
			}
		}

		return false;
	};
};

export const fromAndedPredicates = <A>(
	predicates: Iterable<Predicate.Predicate<A>>
): Predicate.Predicate<A> => {
	return (a: A) => {
		for (const predicate of predicates) {
			if (predicate(a) === false) {
				return false;
			}
		}
		return true;
	};
};

/**
 * Extracts the source of a predicate or refinement.
 * @category utilities
 */
export type Source<R> = readonly [R] extends readonly [Predicate.Predicate<infer A>] ? A : never;

/**
 * Extracts the target of a predicate or refinement.
 * @category utilities
 */
export type Target<R> =
	readonly [R] extends readonly [Predicate.Refinement<infer _, infer A>] ? A : Source<R>;

/**
 * Extracts the difference between the source and the target of a refinement or predicate
 * @category utilities
 */
export type Difference<R> = Source<R> extends Target<R> ? never : Target<R>;

/**
 * @category utilities
 */
export type PredicatesToSources<T> = {
	readonly [Key in keyof T]: Source<T[Key]>;
};

/**
 * @category utilities
 */
export type PredicatesToTargets<T> = {
	readonly [Key in keyof T]: Target<T[Key]>;
};

/**
 * @category utilities
 */
export type PredicatesToDifferences<T> = {
	readonly [Key in keyof T]: Difference<T[Key]>;
};

export const struct = <F extends Record<string, MTypes.AnyPredicate>>(
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
> => Predicate.tuple(...elements) as never;
