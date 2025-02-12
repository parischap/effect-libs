/* eslint-disable functional/no-expression-statements */
import { MPredicate, MTypes } from '@parischap/effect-lib';
import { pipe, Predicate } from 'effect';
import { describe, expect, it } from 'vitest';

/** Source */
MTypes.checkNever<MTypes.Equals<MPredicate.Source<Predicate.Predicate<number>>, number>>();
MTypes.checkNever<MTypes.Equals<MPredicate.Source<Predicate.Refinement<number, 5>>, number>>();

/** Target */
MTypes.checkNever<MTypes.Equals<MPredicate.Target<Predicate.Predicate<number>>, number>>();
MTypes.checkNever<MTypes.Equals<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>>();

/** Coverage */
MTypes.checkNever<MTypes.Equals<MPredicate.Coverage<Predicate.Predicate<number>>, never>>();
MTypes.checkNever<MTypes.Equals<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>>();

/** PredicatesToSources */
MTypes.checkNever<
	MTypes.Equals<
		MPredicate.PredicatesToSources<
			readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
		>,
		readonly [number, boolean]
	>
>();

/** PredicatesToTargets */
MTypes.checkNever<
	MTypes.Equals<
		MPredicate.PredicatesToTargets<
			readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
		>,
		readonly [number, true]
	>
>();

/** PredicatesToCoverages */
MTypes.checkNever<
	MTypes.Equals<
		MPredicate.PredicatesToCoverages<
			readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
		>,
		readonly [never, true]
	>
>();

/** SourcesToPredicates */
MTypes.checkNever<
	MTypes.Equals<
		MPredicate.SourcesToPredicates<readonly [number, boolean]>,
		readonly [Predicate.Predicate<number>, Predicate.Predicate<boolean>]
	>
>();
MTypes.checkNever<
	MTypes.Equals<
		MPredicate.SourcesToPredicates<{ readonly a: number; readonly b: boolean }>,
		{ readonly a: Predicate.Predicate<number>; readonly b: Predicate.Predicate<boolean> }
	>
>();

describe('MPredicate', () => {
	describe('struct', () => {
		it('Type error expected', () => {
			/* @ts-expect-error c not present in object */
			expect(pipe({ a: 0, b: 1 }, MPredicate.struct({ c: Predicate.isNumber }))).toEqual(false);
		});

		it('Passing', () => {
			expect(
				pipe(
					{ a: 0, b: 1, c: 2 },
					MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isNumber })
				)
			).toEqual(true);
		});

		it('Failing', () => {
			expect(
				pipe(
					{ a: 0, b: 1, c: 2 },
					MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isString })
				)
			).toEqual(false);
		});
	});
});
