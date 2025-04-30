/* eslint-disable functional/no-expression-statements */
import { CVRoundingMode, CVRoundingOption } from '@parischap/conversions';
import { MNumber } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Equal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVRoundingOption', () => {
	const roundingOption = CVRoundingOption.make({
		precision: 3,
		roundingMode: CVRoundingMode.Type.HalfEven
	});

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVRoundingOption.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertTrue(
					Equal.equals(
						roundingOption,
						CVRoundingOption.make({
							precision: 3,
							roundingMode: CVRoundingMode.Type.HalfEven
						})
					)
				);
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(
					Equal.equals(
						roundingOption,
						CVRoundingOption.make({
							precision: 2,
							roundingMode: CVRoundingMode.Type.HalfEven
						})
					)
				);
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(roundingOption.toString(), 'HalfEvenRounderWith3Precision');
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(roundingOption.pipe(CVRoundingOption.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVRoundingOption.has(roundingOption));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVRoundingOption.has(new Date()));
			});
		});
	});

	describe('toNumberRounder', () => {
		const rounder = CVRoundingOption.toNumberRounder(roundingOption);
		it('Even number', () => {
			TEUtils.assertTrue(pipe(0.4566, rounder, MNumber.equals(0.457)));
		});
		it('Odd number', () => {
			TEUtils.assertTrue(pipe(-0.4564, rounder, MNumber.equals(-0.456)));
		});
	});

	describe('toBigDecimalRounder', () => {
		const rounder = CVRoundingOption.toBigDecimalRounder(roundingOption);
		it('Even number', () => {
			TEUtils.assertEquals(rounder(BigDecimal.make(4566n, 4)), BigDecimal.make(457n, 3));
		});
		it('Odd number', () => {
			TEUtils.assertEquals(rounder(BigDecimal.make(-4564n, 4)), BigDecimal.make(-456n, 3));
		});
	});
});
