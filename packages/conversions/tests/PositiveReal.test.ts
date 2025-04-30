/* eslint-disable functional/no-expression-statements */
import { CVPositiveReal, CVPositiveRealInt, CVReal, CVRealInt } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveReal', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPositiveReal.moduleTag);
	});

	it('unsafeFromNumber', () => {
		TEUtils.strictEqual(CVPositiveReal.unsafeFromNumber(NaN), NaN);
		TEUtils.strictEqual(CVPositiveReal.unsafeFromNumber(15.4), 15.4);
	});

	describe('fromNumber', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertTrue(pipe(NaN, CVPositiveReal.fromNumber, Either.isLeft));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(pipe(-18, CVPositiveReal.fromNumber, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(18, CVPositiveReal.fromNumber, Either.isRight));
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1n, -25), CVPositiveReal.fromBigDecimal, Either.isLeft)
			);
		});
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(-1543367754n, 2), CVPositiveReal.fromBigDecimal, Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1543367754n, 2), CVPositiveReal.fromBigDecimal, Either.isRight)
			);
		});
	});

	describe('fromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.assertTrue(
				pipe(BigInt(1e15) * BigInt(1e15), CVPositiveReal.fromBigInt, Either.isLeft)
			);
		});
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(pipe(BigInt(-1e15), CVPositiveReal.fromBigInt, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(BigInt(1e15), CVPositiveReal.fromBigInt, Either.isRight));
		});
	});

	describe('fromReal', () => {
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(
				pipe(-15.4, CVReal.unsafeFromNumber, CVPositiveReal.fromReal, Either.isLeft)
			);
		});
		it('Passing', () => {
			pipe(15.4, CVReal.unsafeFromNumber, CVPositiveReal.fromReal, Either.isRight);
			pipe(-15, CVRealInt.unsafeFromNumber, CVPositiveReal.fromReal, Either.isRight);
			pipe(15, CVPositiveRealInt.unsafeFromNumber, CVPositiveReal.fromReal, Either.isRight);
		});
	});

	describe('fromPositiveRealInt', () => {
		it('Passing', () => {
			pipe(
				15,
				CVPositiveRealInt.unsafeFromNumber,
				CVPositiveReal.fromPositiveRealInt,
				Either.isRight
			);
		});
	});
});
