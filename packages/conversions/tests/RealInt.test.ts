/* eslint-disable functional/no-expression-statements */
import { CVPositiveRealInt, CVReal, CVRealInt } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVRealInt', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVRealInt.moduleTag);
	});

	it('unsafeFromNumber', () => {
		TEUtils.strictEqual(CVRealInt.unsafeFromNumber(NaN), NaN);
		TEUtils.strictEqual(CVRealInt.unsafeFromNumber(15.4), 15.4);
		TEUtils.strictEqual(CVRealInt.unsafeFromNumber(15), 15);
	});

	describe('fromNumber', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertTrue(pipe(NaN, CVRealInt.fromNumber, Either.isLeft));
		});
		it('Not passing: not integer', () => {
			TEUtils.assertTrue(pipe(15.4, CVRealInt.fromNumber, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(15, CVRealInt.fromNumber, Either.isRight));
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertTrue(pipe(BigDecimal.make(1n, -25), CVRealInt.fromBigDecimal, Either.isLeft));
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1543367754n, 2), CVRealInt.fromBigDecimal, Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1543367754n, 0), CVRealInt.fromBigDecimal, Either.isRight)
			);
		});
	});

	describe('fromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.assertTrue(pipe(BigInt(1e15) * BigInt(1e15), CVRealInt.fromBigInt, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(BigInt(1e15), CVRealInt.fromBigInt, Either.isRight));
		});
	});

	it('toBigDecimal', () => {
		TEUtils.assertEquals(
			pipe(-18, CVRealInt.unsafeFromNumber, CVRealInt.toBigDecimal),
			BigDecimal.make(-18n, 0)
		);
		TEUtils.assertEquals(
			pipe(18, CVPositiveRealInt.unsafeFromNumber, CVRealInt.toBigDecimal),
			BigDecimal.make(18n, 0)
		);
	});

	it('toBigInt', () => {
		TEUtils.strictEqual(pipe(-18, CVRealInt.unsafeFromNumber, CVRealInt.toBigInt), -18n);
		TEUtils.strictEqual(pipe(18, CVPositiveRealInt.unsafeFromNumber, CVRealInt.toBigInt), 18n);
	});

	describe('fromReal', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertTrue(pipe(18.4, CVReal.unsafeFromNumber, CVRealInt.fromReal, Either.isLeft));
		});
		it('Passing', () => {
			pipe(18, CVReal.unsafeFromNumber, CVRealInt.fromReal, Either.isRight);
			pipe(18, CVPositiveRealInt.unsafeFromNumber, CVRealInt.fromReal, Either.isRight);
		});
	});
});
