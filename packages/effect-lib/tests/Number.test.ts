/* eslint-disable functional/no-expression-statements */
import { MNumber } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

const hugeBigInt = 10n ** 500n;
const hugeBigDecimal = BigDecimal.make(hugeBigInt, 0);
const number = 243;
const bigint = BigInt(number);
const bigDecimal = BigDecimal.make(bigint, 0);

describe('MNumber', () => {
	describe('unsafeFromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.doesNotThrow(() => MNumber.unsafeFromBigDecimal(hugeBigDecimal));
		});
		it('Passing', () => {
			TEUtils.strictEqual(MNumber.unsafeFromBigDecimal(bigDecimal), number);
		});
	});

	describe('fromBigDecimalOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(MNumber.fromBigDecimalOption(hugeBigDecimal));
		});
		it('Passing', () => {
			TEUtils.assertSome(MNumber.fromBigDecimalOption(bigDecimal), number);
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(MNumber.fromBigDecimal(hugeBigDecimal));
		});
		it('Passing', () => {
			TEUtils.assertRight(MNumber.fromBigDecimal(bigDecimal), number);
		});
	});

	describe('fromBigDecimalOrThrow', () => {
		it('Not passing: too big', () => {
			TEUtils.throws(() => MNumber.fromBigDecimalOrThrow(hugeBigDecimal));
		});
		it('Passing', () => {
			TEUtils.strictEqual(MNumber.fromBigDecimalOrThrow(bigDecimal), number);
		});
	});

	describe('unsafeFromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.doesNotThrow(() => MNumber.unsafeFromBigInt(hugeBigInt));
		});
		it('Passing', () => {
			TEUtils.strictEqual(MNumber.unsafeFromBigInt(bigint), number);
		});
	});

	describe('fromBigIntOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(MNumber.fromBigIntOption(hugeBigInt));
		});
		it('Passing', () => {
			TEUtils.assertSome(MNumber.fromBigIntOption(bigint), number);
		});
	});

	describe('fromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(MNumber.fromBigInt(hugeBigInt));
		});
		it('Passing', () => {
			TEUtils.assertRight(MNumber.fromBigInt(bigint), number);
		});
	});

	describe('fromBigIntOrThrow', () => {
		it('Not passing: too big', () => {
			TEUtils.throws(() => MNumber.fromBigIntOrThrow(hugeBigInt));
		});
		it('Passing', () => {
			TEUtils.strictEqual(MNumber.fromBigIntOrThrow(bigint), number);
		});
	});

	it('intModulo', () => {
		TEUtils.strictEqual(MNumber.intModulo(3)(5), 2);
		TEUtils.strictEqual(MNumber.intModulo(5)(3), 3);
		TEUtils.strictEqual(MNumber.intModulo(3)(-5), 1);
		TEUtils.strictEqual(MNumber.intModulo(5)(-3), 2);
		TEUtils.strictEqual(pipe(-3, MNumber.intModulo(3), Math.abs), 0);
		TEUtils.strictEqual(MNumber.intModulo(-3)(5), 2);
		TEUtils.strictEqual(MNumber.intModulo(-5)(3), 3);
		TEUtils.strictEqual(MNumber.intModulo(-3)(-5), 1);
		TEUtils.strictEqual(MNumber.intModulo(-5)(-3), 2);
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

	describe('sign2', () => {
		it('Strictly positive value', () => {
			TEUtils.strictEqual(MNumber.sign2(5), 1);
		});

		it('+0', () => {
			TEUtils.strictEqual(MNumber.sign2(+0), 1);
		});

		it('0', () => {
			TEUtils.strictEqual(MNumber.sign2(0), 1);
		});

		it('-0', () => {
			TEUtils.strictEqual(MNumber.sign2(-0), -1);
		});

		it('Strictly negative value', () => {
			TEUtils.strictEqual(MNumber.sign2(-5), -1);
		});
	});
});
