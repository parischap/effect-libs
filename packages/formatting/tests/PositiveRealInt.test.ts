/* eslint-disable functional/no-expression-statements */
import { CVPositiveReal, CVPositiveRealInt, CVReal, CVRealInt } from '@parischap/formatting';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveRealInt', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPositiveRealInt.moduleTag);
	});

	it('unsafeFromNumber', () => {
		TEUtils.strictEqual(CVPositiveRealInt.unsafeFromNumber(NaN), NaN);
		TEUtils.strictEqual(CVPositiveRealInt.unsafeFromNumber(15), 15);
	});

	describe('fromNumber', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertTrue(pipe(NaN, CVPositiveRealInt.fromNumber, Either.isLeft));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(pipe(-18, CVPositiveRealInt.fromNumber, Either.isLeft));
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertTrue(pipe(18.4, CVPositiveRealInt.fromNumber, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(18, CVPositiveRealInt.fromNumber, Either.isRight));
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1n, -25), CVPositiveRealInt.fromBigDecimal, Either.isLeft)
			);
		});
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(-1543367754n, 0), CVPositiveRealInt.fromBigDecimal, Either.isLeft)
			);
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1543367754n, 2), CVPositiveRealInt.fromBigDecimal, Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1543367754n, 0), CVPositiveRealInt.fromBigDecimal, Either.isRight)
			);
		});
	});

	describe('fromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.assertTrue(
				pipe(BigInt(1e15) * BigInt(1e15), CVPositiveRealInt.fromBigInt, Either.isLeft)
			);
		});
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(pipe(BigInt(-1e15), CVPositiveRealInt.fromBigInt, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(BigInt(1e15), CVPositiveRealInt.fromBigInt, Either.isRight));
		});
	});

	describe('fromReal', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertTrue(
				pipe(18.4, CVReal.unsafeFromNumber, CVPositiveRealInt.fromReal, Either.isLeft)
			);
		});
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(
				pipe(-18, CVReal.unsafeFromNumber, CVPositiveRealInt.fromReal, Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(18, CVReal.unsafeFromNumber, CVPositiveRealInt.fromReal, Either.isRight)
			);
		});
	});

	describe('fromRealInt', () => {
		it('Not passing: not positive', () => {
			TEUtils.assertTrue(
				pipe(-18, CVRealInt.unsafeFromNumber, CVPositiveRealInt.fromRealInt, Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(18, CVRealInt.unsafeFromNumber, CVPositiveRealInt.fromRealInt, Either.isRight)
			);
		});
	});

	describe('fromPositiveReal', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertTrue(
				pipe(
					18.4,
					CVPositiveReal.unsafeFromNumber,
					CVPositiveRealInt.fromPositiveReal,
					Either.isLeft
				)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(
					18,
					CVPositiveReal.unsafeFromNumber,
					CVPositiveRealInt.fromPositiveReal,
					Either.isRight
				)
			);
		});
	});
});
