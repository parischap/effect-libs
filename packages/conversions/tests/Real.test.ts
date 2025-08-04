/* eslint-disable functional/no-expression-statements */
import { CVPositiveReal, CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVReal', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVReal.moduleTag);
	});

	it('unsafeFromNumber', () => {
		TEUtils.strictEqual(CVReal.unsafeFromNumber(NaN), NaN);
		TEUtils.strictEqual(CVReal.unsafeFromNumber(15.4), 15.4);
	});

	describe('fromNumberOption', () => {
		it('Not passing: not a finite value', () => {
			TEUtils.assertNone(pipe(NaN, CVReal.fromNumberOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(18.4, CVReal.fromNumberOption));
		});
	});

	describe('fromNumber', () => {
		it('Not passing: not a finite value', () => {
			TEUtils.assertLeft(pipe(NaN, CVReal.fromNumber));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(18.4, CVReal.fromNumber));
		});
	});

	describe('fromBigDecimalOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(pipe(BigDecimal.make(1n, -25), CVReal.fromBigDecimalOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(BigDecimal.make(1543367754n, 2), CVReal.fromBigDecimalOption));
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(1n, -25), CVReal.fromBigDecimal));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigDecimal.make(1543367754n, 2), CVReal.fromBigDecimal));
		});
	});

	describe('fromBigIntOption', () => {
		it('Not passing', () => {
			TEUtils.assertNone(pipe(BigInt(1e15) * BigInt(1e15), CVReal.fromBigIntOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(BigInt(1e15), CVReal.fromBigIntOption));
		});
	});

	describe('fromBigInt', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(pipe(BigInt(1e15) * BigInt(1e15), CVReal.fromBigInt));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigInt(1e15), CVReal.fromBigInt));
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
			TEUtils.assertLeft(pipe(-18.4, CVReal.unsafeFromNumber, CVReal.toBigInt));
			TEUtils.assertLeft(pipe(18.4, CVPositiveReal.unsafeFromNumber, CVReal.toBigInt));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(-18, CVReal.unsafeFromNumber, CVReal.toBigInt));
			TEUtils.assertRight(pipe(18, CVPositiveReal.unsafeFromNumber, CVReal.toBigInt));
		});
	});
});
