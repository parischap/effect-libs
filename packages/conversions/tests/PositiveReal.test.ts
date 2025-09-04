/* eslint-disable functional/no-expression-statements */
import { CVPositiveReal, CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveReal', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPositiveReal.moduleTag);
	});

	describe('Conversions from number', () => {
		const notPassing1 = NaN;
		const notPassing2 = -15.4;
		const passing = 15.4 as CVPositiveReal.Type;

		describe('unsafeFromNumber', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveReal.unsafeFromNumber(notPassing1));
				TEUtils.doesNotThrow(() => CVPositiveReal.unsafeFromNumber(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.unsafeFromNumber(passing), passing);
			});
		});

		describe('fromNumberOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveReal.fromNumberOption(notPassing1));
				TEUtils.assertNone(CVPositiveReal.fromNumberOption(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveReal.fromNumberOption(passing), passing);
			});
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveReal.fromNumber(notPassing1));
				TEUtils.assertLeft(CVPositiveReal.fromNumber(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveReal.fromNumber(passing), passing);
			});
		});

		describe('fromNumberOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveReal.fromNumberOrThrow(notPassing1));
				TEUtils.throws(() => CVPositiveReal.fromNumberOrThrow(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.fromNumberOrThrow(passing), passing);
			});
		});
	});

	describe('Conversions from BigDecimal', () => {
		const notPassing1 = BigDecimal.make(1n, -500);
		const notPassing2 = BigDecimal.make(-154n, 1);
		const passing = BigDecimal.make(154n, 0);
		const real = 154 as CVPositiveReal.Type;

		describe('unsafeFromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigDecimal(notPassing1));
				TEUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigDecimal(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.unsafeFromBigDecimal(passing), real);
			});
		});

		describe('fromBigDecimalOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveReal.fromBigDecimalOption(notPassing1));
				TEUtils.assertNone(CVPositiveReal.fromBigDecimalOption(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveReal.fromBigDecimalOption(passing), real);
			});
		});

		describe('fromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveReal.fromBigDecimal(notPassing1));
				TEUtils.assertLeft(CVPositiveReal.fromBigDecimal(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveReal.fromBigDecimal(passing), real);
			});
		});

		describe('fromBigDecimalOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveReal.fromBigDecimalOrThrow(notPassing1));
				TEUtils.throws(() => CVPositiveReal.fromBigDecimalOrThrow(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.fromBigDecimalOrThrow(passing), real);
			});
		});
	});

	describe('Conversions from BigInt', () => {
		const notPassing1 = 10n ** 500n;
		const notPassing2 = -154n;
		const passing = 154n;
		const real = 154 as CVPositiveReal.Type;

		describe('unsafeFromBigInt', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigInt(notPassing1));
				TEUtils.doesNotThrow(() => CVPositiveReal.unsafeFromBigInt(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.unsafeFromBigInt(passing), real);
			});
		});

		describe('fromBigIntOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveReal.fromBigIntOption(notPassing1));
				TEUtils.assertNone(CVPositiveReal.fromBigIntOption(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveReal.fromBigIntOption(passing), real);
			});
		});

		describe('fromBigInt', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveReal.fromBigInt(notPassing1));
				TEUtils.assertLeft(CVPositiveReal.fromBigInt(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveReal.fromBigInt(passing), real);
			});
		});

		describe('fromBigIntOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveReal.fromBigIntOrThrow(notPassing1));
				TEUtils.throws(() => CVPositiveReal.fromBigIntOrThrow(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.fromBigIntOrThrow(passing), real);
			});
		});
	});

	describe('Conversions from Real', () => {
		const notPassing = CVReal.unsafeFromNumber(-15.4);
		const passing = CVReal.unsafeFromNumber(15.4);
		const real = 15.4 as CVPositiveReal.Type;

		describe('unsafeFromReal', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveReal.unsafeFromReal(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.unsafeFromReal(passing), real);
			});
		});

		describe('fromRealOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveReal.fromRealOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveReal.fromRealOption(passing), real);
			});
		});

		describe('fromReal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveReal.fromReal(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveReal.fromReal(passing), real);
			});
		});

		describe('fromRealOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveReal.fromRealOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveReal.fromRealOrThrow(passing), real);
			});
		});
	});
});
