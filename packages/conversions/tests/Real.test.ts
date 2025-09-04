/* eslint-disable functional/no-expression-statements */
import { CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal } from 'effect';
import { describe, it } from 'vitest';

describe('CVReal', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVReal.moduleTag);
	});

	describe('Conversions from number', () => {
		const notPassing = Infinity;
		const passing = 15.4 as CVReal.Type;

		describe('unsafeFromNumber', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVReal.unsafeFromNumber(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVReal.unsafeFromNumber(passing), passing);
			});
		});

		describe('fromNumberOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVReal.fromNumberOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVReal.fromNumberOption(passing), passing);
			});
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVReal.fromNumber(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVReal.fromNumber(passing), passing);
			});
		});

		describe('fromNumberOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVReal.fromNumberOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVReal.fromNumberOrThrow(passing), passing);
			});
		});
	});

	describe('Conversions from BigDecimal', () => {
		const notPassing = BigDecimal.make(1n, -500);
		const passing = BigDecimal.make(154n, 0);
		const real = 154 as CVReal.Type;

		describe('unsafeFromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVReal.unsafeFromBigDecimal(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVReal.unsafeFromBigDecimal(passing), real);
			});
		});

		describe('fromBigDecimalOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVReal.fromBigDecimalOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVReal.fromBigDecimalOption(passing), real);
			});
		});

		describe('fromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVReal.fromBigDecimal(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVReal.fromBigDecimal(passing), real);
			});
		});

		describe('fromBigDecimalOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVReal.fromBigDecimalOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVReal.fromBigDecimalOrThrow(passing), real);
			});
		});
	});

	describe('Conversions from BigInt', () => {
		const notPassing = 10n ** 500n;
		const passing = 154n;
		const real = 154 as CVReal.Type;

		describe('unsafeFromBigInt', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVReal.unsafeFromBigInt(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVReal.unsafeFromBigInt(passing), real);
			});
		});

		describe('fromBigIntOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVReal.fromBigIntOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVReal.fromBigIntOption(passing), real);
			});
		});

		describe('fromBigInt', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVReal.fromBigInt(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVReal.fromBigInt(passing), real);
			});
		});

		describe('fromBigIntOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVReal.fromBigIntOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVReal.fromBigIntOrThrow(passing), real);
			});
		});
	});
});
