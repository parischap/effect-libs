/* eslint-disable functional/no-expression-statements */
import { MNumber } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MNumber', () => {
	describe('intModulo', () => {
		it('Positive divisor strictly inferior to dividend', () => {
			TEUtils.strictEqual(MNumber.intModulo(3)(5), 2);
		});

		it('Positive divisor superior or equal to dividend', () => {
			TEUtils.strictEqual(MNumber.intModulo(5)(3), 3);
		});

		it('Negative divisor strictly inferior to dividend in absolute value', () => {
			TEUtils.strictEqual(MNumber.intModulo(3)(-5), 1);
		});

		it('Negative divisor superior or equal to dividend in absolute value', () => {
			TEUtils.strictEqual(MNumber.intModulo(5)(-3), 2);
		});
	});

	describe('quotientAndRemainder', () => {
		it('Positive dividend, positive divisor', () => {
			TEUtils.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(5)), [5, 2]);
		});

		it('Negative dividend, positive divisor', () => {
			TEUtils.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(5)), [-6, 3]);
		});

		it('Positive dividend, negative divisor', () => {
			TEUtils.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(-5)), [-6, -3]);
		});

		it('Negative dividend, negative divisor', () => {
			TEUtils.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(-5)), [5, -2]);
		});
	});

	describe('equals', () => {
		it('Passing', () => {
			TEUtils.assertTrue(pipe(0.3, MNumber.equals(0.1 + 0.2)));
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(0.4, MNumber.equals(0.1 + 0.2)));
		});
	});

	describe('trunc', () => {
		it('Number that does not need to be truncated', () => {
			TEUtils.assertTrue(pipe(54.5, MNumber.trunc(2), MNumber.equals(54.5)));
		});

		it('Positive number, first following digit < 5', () => {
			TEUtils.assertTrue(pipe(0.544, MNumber.trunc(2), MNumber.equals(0.54)));
		});

		it('Positive number, first following digit >= 5', () => {
			TEUtils.assertTrue(pipe(0.545, MNumber.trunc(2), MNumber.equals(0.54)));
		});

		it('Negative number, first following digit < 5', () => {
			TEUtils.assertTrue(pipe(-0.544, MNumber.trunc(2), MNumber.equals(-0.54)));
		});

		it('Negative number, first following digit >= 5', () => {
			TEUtils.assertTrue(pipe(-0.545, MNumber.trunc(2), MNumber.equals(-0.54)));
		});
	});

	describe('isMultipleOf', () => {
		it('Passing', () => {
			TEUtils.assertTrue(pipe(27, MNumber.isMultipleOf(3)));
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(26, MNumber.isMultipleOf(3)));
		});
	});

	describe('shift', () => {
		it('Positive shift', () => {
			TEUtils.strictEqual(pipe(5.04, MNumber.shift(2)), 504);
		});

		it('Negative shift', () => {
			TEUtils.strictEqual(pipe(504, MNumber.shift(-2)), 5.04);
		});
	});

	describe('round', () => {
		it('Ceil', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.Ceil });
			TEUtils.assertTrue(pipe(0.456, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(0.4561, round, MNumber.equals(0.457)));
			TEUtils.assertTrue(pipe(-0.4561, round, MNumber.equals(-0.456)));
			TEUtils.assertTrue(pipe(-0.456, round, MNumber.equals(-0.456)));
		});

		it('Floor', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.Floor });
			TEUtils.assertTrue(pipe(0.456, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(0.4561, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(-0.4561, round, MNumber.equals(-0.457)));
			TEUtils.assertTrue(pipe(-0.456, round, MNumber.equals(-0.456)));
		});

		it('Expand', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.Expand });
			TEUtils.assertTrue(pipe(0.456, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(0.4561, round, MNumber.equals(0.457)));
			TEUtils.assertTrue(pipe(-0.4561, round, MNumber.equals(-0.457)));
			TEUtils.assertTrue(pipe(-0.456, round, MNumber.equals(-0.456)));
		});

		it('Trunc', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.Trunc });
			TEUtils.assertTrue(pipe(0.456, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(0.4561, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(-0.4561, round, MNumber.equals(-0.456)));
			TEUtils.assertTrue(pipe(-0.456, round, MNumber.equals(-0.456)));
		});

		it('HalfCeil', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.HalfCeil });
			TEUtils.assertTrue(pipe(0.4565, round, MNumber.equals(0.457)));
			TEUtils.assertTrue(pipe(0.4564, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(-0.4565, round, MNumber.equals(-0.456)));
			TEUtils.assertTrue(pipe(-0.4566, round, MNumber.equals(-0.457)));
		});

		it('HalfFloor', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.HalfFloor });
			TEUtils.assertTrue(pipe(0.4565, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(0.4566, round, MNumber.equals(0.457)));
			TEUtils.assertTrue(pipe(-0.4565, round, MNumber.equals(-0.457)));
			TEUtils.assertTrue(pipe(-0.4564, round, MNumber.equals(-0.456)));
		});

		it('HalfExpand', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.HalfExpand });
			TEUtils.assertTrue(pipe(0.4565, round, MNumber.equals(0.457)));
			TEUtils.assertTrue(pipe(0.4564, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(-0.4565, round, MNumber.equals(-0.457)));
			TEUtils.assertTrue(pipe(-0.4564, round, MNumber.equals(-0.456)));
		});

		it('HalfEven', () => {
			const round = MNumber.round({ precision: 3, roundingMode: MNumber.RoundingMode.HalfEven });
			TEUtils.assertTrue(pipe(0.4566, round, MNumber.equals(0.457)));
			TEUtils.assertTrue(pipe(0.4565, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(0.4564, round, MNumber.equals(0.456)));
			TEUtils.assertTrue(pipe(-0.4566, round, MNumber.equals(-0.457)));
			TEUtils.assertTrue(pipe(-0.4565, round, MNumber.equals(-0.456)));
			TEUtils.assertTrue(pipe(-0.4564, round, MNumber.equals(-0.456)));

			TEUtils.assertTrue(pipe(0.4576, round, MNumber.equals(0.458)));
			TEUtils.assertTrue(pipe(0.4575, round, MNumber.equals(0.458)));
			TEUtils.assertTrue(pipe(0.4574, round, MNumber.equals(0.457)));
			TEUtils.assertTrue(pipe(-0.4576, round, MNumber.equals(-0.458)));
			TEUtils.assertTrue(pipe(-0.4575, round, MNumber.equals(-0.458)));
			TEUtils.assertTrue(pipe(-0.4574, round, MNumber.equals(-0.457)));
		});
	});
});
