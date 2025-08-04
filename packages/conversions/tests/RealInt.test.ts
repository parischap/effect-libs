/* eslint-disable functional/no-expression-statements */
import { CVPositiveRealInt, CVReal, CVRealInt } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe } from 'effect';
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

	describe('fromNumberOption', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertNone(CVRealInt.fromNumberOption(NaN));
		});
		it('Not passing: not integer', () => {
			TEUtils.assertNone(CVRealInt.fromNumberOption(15.4));
		});
		it('Passing', () => {
			TEUtils.assertSome(CVRealInt.fromNumberOption(15));
		});
	});

	describe('fromNumber', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertLeft(CVRealInt.fromNumber(NaN));
		});
		it('Not passing: not integer', () => {
			TEUtils.assertLeft(CVRealInt.fromNumber(15.4));
		});
		it('Passing', () => {
			TEUtils.assertRight(CVRealInt.fromNumber(15));
		});
	});

	describe('fromBigDecimalOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(pipe(BigDecimal.make(1n, -25), CVRealInt.fromBigDecimalOption));
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertNone(pipe(BigDecimal.make(1543367754n, 2), CVRealInt.fromBigDecimalOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(BigDecimal.make(1543367754n, 0), CVRealInt.fromBigDecimalOption));
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(1n, -25), CVRealInt.fromBigDecimal));
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(1543367754n, 2), CVRealInt.fromBigDecimal));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigDecimal.make(1543367754n, 0), CVRealInt.fromBigDecimal));
		});
	});

	describe('fromBigIntOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(pipe(BigInt(1e15) * BigInt(1e15), CVRealInt.fromBigIntOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(BigInt(1e15), CVRealInt.fromBigIntOption));
		});
	});

	describe('fromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(pipe(BigInt(1e15) * BigInt(1e15), CVRealInt.fromBigInt));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigInt(1e15), CVRealInt.fromBigInt));
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

	describe('fromRealOption', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertNone(pipe(18.4, CVReal.unsafeFromNumber, CVRealInt.fromRealOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(18, CVReal.unsafeFromNumber, CVRealInt.fromRealOption));
			TEUtils.assertSome(pipe(18, CVPositiveRealInt.unsafeFromNumber, CVRealInt.fromRealOption));
		});
	});

	describe('fromReal', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertLeft(pipe(18.4, CVReal.unsafeFromNumber, CVRealInt.fromReal));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(18, CVReal.unsafeFromNumber, CVRealInt.fromReal));
			TEUtils.assertRight(pipe(18, CVPositiveRealInt.unsafeFromNumber, CVRealInt.fromReal));
		});
	});
});
