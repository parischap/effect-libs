/* eslint-disable functional/no-expression-statements */
import { CVPositiveReal, CVPositiveRealInt, CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveReal', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPositiveReal.moduleTag);
	});

	it('unsafeFromNumber', () => {
		TEUtils.strictEqual(CVPositiveReal.unsafeFromNumber(NaN), NaN);
		TEUtils.strictEqual(CVPositiveReal.unsafeFromNumber(15.4), 15.4);
	});

	describe('fromNumberOption', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertNone(pipe(NaN, CVPositiveReal.fromNumberOption));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertNone(pipe(-18, CVPositiveReal.fromNumberOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(18, CVPositiveReal.fromNumberOption));
		});
	});

	describe('fromNumber', () => {
		it('Not passing: not finite', () => {
			TEUtils.assertLeft(pipe(NaN, CVPositiveReal.fromNumber));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(-18, CVPositiveReal.fromNumber));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(18, CVPositiveReal.fromNumber));
		});
	});

	describe('fromBigDecimalOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(pipe(BigDecimal.make(1n, -25), CVPositiveReal.fromBigDecimalOption));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertNone(
				pipe(BigDecimal.make(-1543367754n, 2), CVPositiveReal.fromBigDecimalOption)
			);
		});
		it('Passing', () => {
			TEUtils.assertSome(
				pipe(BigDecimal.make(1543367754n, 2), CVPositiveReal.fromBigDecimalOption)
			);
		});
	});

	describe('fromBigDecimal', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(1n, -25), CVPositiveReal.fromBigDecimal));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(BigDecimal.make(-1543367754n, 2), CVPositiveReal.fromBigDecimal));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigDecimal.make(1543367754n, 2), CVPositiveReal.fromBigDecimal));
		});
	});

	describe('fromBigIntOption', () => {
		it('Not passing: too big', () => {
			TEUtils.assertNone(pipe(BigInt(1e15) * BigInt(1e15), CVPositiveReal.fromBigIntOption));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertNone(pipe(BigInt(-1e15), CVPositiveReal.fromBigIntOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(BigInt(1e15), CVPositiveReal.fromBigIntOption));
		});
	});

	describe('fromBigInt', () => {
		it('Not passing: too big', () => {
			TEUtils.assertLeft(pipe(BigInt(1e15) * BigInt(1e15), CVPositiveReal.fromBigInt));
		});
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(BigInt(-1e15), CVPositiveReal.fromBigInt));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(BigInt(1e15), CVPositiveReal.fromBigInt));
		});
	});

	describe('fromRealOption', () => {
		it('Not passing: not positive', () => {
			TEUtils.assertNone(pipe(-15.4, CVReal.unsafeFromNumber, CVPositiveReal.fromRealOption));
		});
		it('Passing', () => {
			TEUtils.assertSome(pipe(15.4, CVReal.unsafeFromNumber, CVPositiveReal.fromRealOption));
		});
	});

	describe('fromReal', () => {
		it('Not passing: not positive', () => {
			TEUtils.assertLeft(pipe(-15.4, CVReal.unsafeFromNumber, CVPositiveReal.fromReal));
		});
		it('Passing', () => {
			TEUtils.assertRight(pipe(15.4, CVReal.unsafeFromNumber, CVPositiveReal.fromReal));
		});
	});

	it('fromPositiveRealInt', () => {
		TEUtils.strictEqual(
			pipe(15, CVPositiveRealInt.unsafeFromNumber, CVPositiveReal.fromPositiveRealInt),
			15
		);
	});
});
