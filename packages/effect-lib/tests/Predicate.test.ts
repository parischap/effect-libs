/* eslint-disable functional/no-expression-statements */
import { MPredicate, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { pipe, Predicate } from 'effect';
import { describe, it } from 'vitest';

/** Source */
MTypes.areEqualTypes<MPredicate.Source<Predicate.Predicate<number>>, number>() satisfies true;
MTypes.areEqualTypes<MPredicate.Source<Predicate.Refinement<number, 5>>, number>() satisfies true;

/** Target */
MTypes.areEqualTypes<MPredicate.Target<Predicate.Predicate<number>>, number>() satisfies true;
MTypes.areEqualTypes<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>() satisfies true;

/** Coverage */
MTypes.areEqualTypes<MPredicate.Coverage<Predicate.Predicate<number>>, never>() satisfies true;
MTypes.areEqualTypes<MPredicate.Target<Predicate.Refinement<number, 5>>, 5>() satisfies true;

/** PredicatesToSources */
MTypes.areEqualTypes<
	MPredicate.PredicatesToSources<
		readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
	>,
	readonly [number, boolean]
>() satisfies true;

/** PredicatesToTargets */
MTypes.areEqualTypes<
	MPredicate.PredicatesToTargets<
		readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
	>,
	readonly [number, true]
>() satisfies true;

/** PredicatesToCoverages */
MTypes.areEqualTypes<
	MPredicate.PredicatesToCoverages<
		readonly [Predicate.Predicate<number>, Predicate.Refinement<boolean, true>]
	>,
	readonly [never, true]
>() satisfies true;

/** SourcesToPredicates */
MTypes.areEqualTypes<
	MPredicate.SourcesToPredicates<readonly [number, boolean]>,
	readonly [Predicate.Predicate<number>, Predicate.Predicate<boolean>]
>() satisfies true;
MTypes.areEqualTypes<
	MPredicate.SourcesToPredicates<{ readonly a: number; readonly b: boolean }>,
	{ readonly a: Predicate.Predicate<number>; readonly b: Predicate.Predicate<boolean> }
>() satisfies true;

describe('MPredicate', () => {
	describe('struct', () => {
		it('Type error expected', () => {
			/* @ts-expect-error c not present in object */
			TEUtils.assertFalse(pipe({ a: 0, b: 1 }, MPredicate.struct({ c: Predicate.isNumber })));
		});

		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(
					{ a: 0, b: 1, c: 2 },
					MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isNumber })
				)
			);
		});

		it('Failing', () => {
			TEUtils.assertFalse(
				pipe(
					{ a: 0, b: 1, c: 2 },
					MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isString })
				)
			);
		});
	});

	describe('strictEquals', () => {
		it('Matching', () => {
			TEUtils.assertTrue(pipe(5, MPredicate.strictEquals(5)));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(pipe(5, MPredicate.strictEquals(2)));
		});
	});
});
