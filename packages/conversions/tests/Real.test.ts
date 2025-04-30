/* eslint-disable functional/no-expression-statements */
import { CVPositiveReal, CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVReal', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVReal.moduleTag);
	});

	it('unsafeFromNumber', () => {
		TEUtils.strictEqual(CVReal.unsafeFromNumber(NaN), NaN);
		TEUtils.strictEqual(CVReal.unsafeFromNumber(15.4), 15.4);
	});

	describe('fromNumber', () => {
		it('Not passing: not a finite value', () => {
			TEUtils.assertTrue(pipe(NaN, CVReal.fromNumber, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(18.4, CVReal.fromNumber, Either.isRight));
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertTrue(pipe(BigDecimal.make(1n, -25), CVReal.fromBigDecimal, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(
				pipe(BigDecimal.make(1543367754n, 2), CVReal.fromBigDecimal, Either.isRight)
			);
		});
	});

	describe('fromBigInt', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(pipe(BigInt(1e15) * BigInt(1e15), CVReal.fromBigInt, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(BigInt(1e15), CVReal.fromBigInt, Either.isRight));
		});
	});

	it('toBigDecimal', () => {
		TEUtils.assertEquals(
			pipe(-18.4, CVReal.unsafeFromNumber, CVReal.toBigDecimal),
			BigDecimal.make(-184n, 1)
		);
		TEUtils.assertEquals(
			pipe(18.4, CVPositiveReal.unsafeFromNumber, CVReal.toBigDecimal),
			BigDecimal.make(184n, 1)
		);
	});

	describe('toBigInt', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertTrue(pipe(-18.4, CVReal.unsafeFromNumber, CVReal.toBigInt, Either.isLeft));
			TEUtils.assertTrue(
				pipe(18.4, CVPositiveReal.unsafeFromNumber, CVReal.toBigInt, Either.isLeft)
			);
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe(-18, CVReal.unsafeFromNumber, CVReal.toBigInt, Either.isRight));
			TEUtils.assertTrue(
				pipe(18, CVPositiveReal.unsafeFromNumber, CVReal.toBigInt, Either.isRight)
			);
		});
	});
});
