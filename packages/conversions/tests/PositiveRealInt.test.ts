/* eslint-disable functional/no-expression-statements */
import { CVPositiveReal, CVPositiveRealInt, CVReal, CVRealInt } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveRealInt', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPositiveRealInt.moduleTag);
	});

	it('unsafeFromNumber', () => {
		TEUtils.strictEqual(CVPositiveRealInt.unsafeFromNumber(NaN), NaN);
		TEUtils.strictEqual(CVPositiveRealInt.unsafeFromNumber(15), 15);
	});

	describe('fromNumberOption', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertNone(pipe(NaN, CVPositiveRealInt.fromNumberOption));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertNone(pipe(-18, CVPositiveRealInt.fromNumberOption));
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertNone(pipe(18.4, CVPositiveRealInt.fromNumberOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(18, CVPositiveRealInt.fromNumberOption));
		});
	});

	describe('fromNumber', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertLeft(pipe(NaN, CVPositiveRealInt.fromNumber));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(-18, CVPositiveRealInt.fromNumber));
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertLeft(pipe(18.4, CVPositiveRealInt.fromNumber));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(18, CVPositiveRealInt.fromNumber));
		});
	});

	describe('fromBigDecimalOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(pipe(BigDecimal.make(1n, -25), CVPositiveRealInt.fromBigDecimalOption));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertNone(
				pipe(BigDecimal.make(-1543367754n, 0), CVPositiveRealInt.fromBigDecimalOption)
			);
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertNone(
				pipe(BigDecimal.make(1543367754n, 2), CVPositiveRealInt.fromBigDecimalOption)
			);
		});
		it('Passing', () => {
			TEUtils.assertSome(
				pipe(BigDecimal.make(1543367754n, 0), CVPositiveRealInt.fromBigDecimalOption)
			);
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(1n, -25), CVPositiveRealInt.fromBigDecimal));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(-1543367754n, 0), CVPositiveRealInt.fromBigDecimal));
		});
		it('Not passing: not an integer', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(1543367754n, 2), CVPositiveRealInt.fromBigDecimal));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigDecimal.make(1543367754n, 0), CVPositiveRealInt.fromBigDecimal));
		});
	});

	describe('fromBigIntOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(pipe(BigInt(1e15) * BigInt(1e15), CVPositiveRealInt.fromBigIntOption));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertNone(pipe(BigInt(-1e15), CVPositiveRealInt.fromBigIntOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(BigInt(1e15), CVPositiveRealInt.fromBigIntOption));
		});
	});

	describe('fromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(pipe(BigInt(1e15) * BigInt(1e15), CVPositiveRealInt.fromBigInt));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(BigInt(-1e15), CVPositiveRealInt.fromBigInt));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigInt(1e15), CVPositiveRealInt.fromBigInt));
		});
	});

	describe('fromRealOption', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertNone(pipe(18.4, CVReal.unsafeFromNumber, CVPositiveRealInt.fromRealOption));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertNone(pipe(-18, CVReal.unsafeFromNumber, CVPositiveRealInt.fromRealOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(18, CVReal.unsafeFromNumber, CVPositiveRealInt.fromRealOption));
		});
	});

	describe('fromReal', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertLeft(pipe(18.4, CVReal.unsafeFromNumber, CVPositiveRealInt.fromReal));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(-18, CVReal.unsafeFromNumber, CVPositiveRealInt.fromReal));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(18, CVReal.unsafeFromNumber, CVPositiveRealInt.fromReal));
		});
	});

	describe('fromRealIntOption', () => {
		it('Not passing: not positive', () => {
			TEUtils.assertNone(
				pipe(-18, CVRealInt.unsafeFromNumber, CVPositiveRealInt.fromRealIntOption)
			);
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(18, CVRealInt.unsafeFromNumber, CVPositiveRealInt.fromRealIntOption));
		});
	});

	describe('fromRealInt', () => {
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(-18, CVRealInt.unsafeFromNumber, CVPositiveRealInt.fromRealInt));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(18, CVRealInt.unsafeFromNumber, CVPositiveRealInt.fromRealInt));
		});
	});

	describe('fromPositiveRealOption', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertNone(
				pipe(18.4, CVPositiveReal.unsafeFromNumber, CVPositiveRealInt.fromPositiveRealOption)
			);
		});
		it('Passing', () => {
			TEUtils.assertSome(
				pipe(18, CVPositiveReal.unsafeFromNumber, CVPositiveRealInt.fromPositiveRealOption)
			);
		});
	});

	describe('fromPositiveReal', () => {
		it('Not passing: not an integer', () => {
			TEUtils.assertLeft(
				pipe(18.4, CVPositiveReal.unsafeFromNumber, CVPositiveRealInt.fromPositiveReal)
			);
		});
		it('Passing', () => {
			TEUtils.assertRight(
				pipe(18, CVPositiveReal.unsafeFromNumber, CVPositiveRealInt.fromPositiveReal)
			);
		});
	});
});
