/* eslint-disable functional/no-expression-statements */
import { CVInteger, CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal } from 'effect';
import { describe, it } from 'vitest';

describe('CVInteger', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVInteger.moduleTag);
	});

	describe('Conversions from number', () => {
		const notPassing1 = -Infinity;
		const notPassing2 = -15.4;
		const passing = -15 as CVInteger.Type;

		describe('unsafeFromNumber', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVInteger.unsafeFromNumber(notPassing1));
				TEUtils.doesNotThrow(() => CVInteger.unsafeFromNumber(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.unsafeFromNumber(passing), passing);
			});
		});

		describe('fromNumberOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVInteger.fromNumberOption(notPassing1));
				TEUtils.assertNone(CVInteger.fromNumberOption(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVInteger.fromNumberOption(passing), passing);
			});
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVInteger.fromNumber(notPassing1));
				TEUtils.assertLeft(CVInteger.fromNumber(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVInteger.fromNumber(passing), passing);
			});
		});

		describe('fromNumberOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVInteger.fromNumberOrThrow(notPassing1));
				TEUtils.throws(() => CVInteger.fromNumberOrThrow(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.fromNumberOrThrow(passing), passing);
			});
		});
	});

	describe('Conversions from BigDecimal', () => {
		const notPassing1 = BigDecimal.make(1n, -500);
		const notPassing2 = BigDecimal.make(-154n, 1);
		const passing = BigDecimal.make(154n, 0);
		const integer = 154 as CVInteger.Type;

		describe('unsafeFromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVInteger.unsafeFromBigDecimal(notPassing1));
				TEUtils.doesNotThrow(() => CVInteger.unsafeFromBigDecimal(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.unsafeFromBigDecimal(passing), integer);
			});
		});

		describe('fromBigDecimalOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVInteger.fromBigDecimalOption(notPassing1));
				TEUtils.assertNone(CVInteger.fromBigDecimalOption(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVInteger.fromBigDecimalOption(passing), integer);
			});
		});

		describe('fromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVInteger.fromBigDecimal(notPassing1));
				TEUtils.assertLeft(CVInteger.fromBigDecimal(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVInteger.fromBigDecimal(passing), integer);
			});
		});

		describe('fromBigDecimalOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVInteger.fromBigDecimalOrThrow(notPassing1));
				TEUtils.throws(() => CVInteger.fromBigDecimalOrThrow(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.fromBigDecimalOrThrow(passing), integer);
			});
		});
	});

	describe('Conversions from BigInt', () => {
		const notPassing = 10n ** 500n;
		const passing = 154n;
		const integer = 154 as CVInteger.Type;

		describe('unsafeFromBigInt', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVInteger.unsafeFromBigInt(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.unsafeFromBigInt(passing), integer);
			});
		});

		describe('fromBigIntOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVInteger.fromBigIntOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVInteger.fromBigIntOption(passing), integer);
			});
		});

		describe('fromBigInt', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVInteger.fromBigInt(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVInteger.fromBigInt(passing), integer);
			});
		});

		describe('fromBigIntOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVInteger.fromBigIntOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.fromBigIntOrThrow(passing), integer);
			});
		});
	});

	describe('Conversions from Real', () => {
		const notPassing = CVReal.unsafeFromNumber(-15.4);
		const passing = CVReal.unsafeFromNumber(-15);
		const integer = -15 as CVInteger.Type;

		describe('unsafeFromReal', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVInteger.unsafeFromReal(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.unsafeFromReal(passing), integer);
			});
		});

		describe('fromRealOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVInteger.fromRealOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVInteger.fromRealOption(passing), integer);
			});
		});

		describe('fromReal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVInteger.fromReal(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVInteger.fromReal(passing), integer);
			});
		});

		describe('fromRealOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVInteger.fromRealOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVInteger.fromRealOrThrow(passing), integer);
			});
		});
	});
});
