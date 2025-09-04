/* eslint-disable functional/no-expression-statements */
import { CVInteger, CVPositiveInteger, CVPositiveReal, CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal } from 'effect';
import { describe, it } from 'vitest';

describe('CVPositiveInteger', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVPositiveInteger.moduleTag);
	});

	describe('Conversions from number', () => {
		const notPassing1 = +Infinity;
		const notPassing2 = 15.4;
		const notPassing3 = -15;
		const passing = 15 as CVPositiveInteger.Type;

		describe('unsafeFromNumber', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromNumber(notPassing1));
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromNumber(notPassing2));
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromNumber(notPassing3));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.unsafeFromNumber(passing), passing);
			});
		});

		describe('fromNumberOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveInteger.fromNumberOption(notPassing1));
				TEUtils.assertNone(CVPositiveInteger.fromNumberOption(notPassing2));
				TEUtils.assertNone(CVPositiveInteger.fromNumberOption(notPassing3));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveInteger.fromNumberOption(passing), passing);
			});
		});

		describe('fromNumber', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveInteger.fromNumber(notPassing1));
				TEUtils.assertLeft(CVPositiveInteger.fromNumber(notPassing2));
				TEUtils.assertLeft(CVPositiveInteger.fromNumber(notPassing3));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveInteger.fromNumber(passing), passing);
			});
		});

		describe('fromNumberOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveInteger.fromNumberOrThrow(notPassing1));
				TEUtils.throws(() => CVPositiveInteger.fromNumberOrThrow(notPassing2));
				TEUtils.throws(() => CVPositiveInteger.fromNumberOrThrow(notPassing3));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.fromNumberOrThrow(passing), passing);
			});
		});
	});

	describe('Conversions from BigDecimal', () => {
		const notPassing1 = BigDecimal.make(1n, -500);
		const notPassing2 = BigDecimal.make(154n, 1);
		const notPassing3 = BigDecimal.make(-154n, 0);
		const passing = BigDecimal.make(154n, 0);
		const integer = 154 as CVPositiveInteger.Type;

		describe('unsafeFromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigDecimal(notPassing1));
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigDecimal(notPassing2));
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigDecimal(notPassing3));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.unsafeFromBigDecimal(passing), integer);
			});
		});

		describe('fromBigDecimalOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveInteger.fromBigDecimalOption(notPassing1));
				TEUtils.assertNone(CVPositiveInteger.fromBigDecimalOption(notPassing2));
				TEUtils.assertNone(CVPositiveInteger.fromBigDecimalOption(notPassing3));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveInteger.fromBigDecimalOption(passing), integer);
			});
		});

		describe('fromBigDecimal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveInteger.fromBigDecimal(notPassing1));
				TEUtils.assertLeft(CVPositiveInteger.fromBigDecimal(notPassing2));
				TEUtils.assertLeft(CVPositiveInteger.fromBigDecimal(notPassing3));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveInteger.fromBigDecimal(passing), integer);
			});
		});

		describe('fromBigDecimalOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveInteger.fromBigDecimalOrThrow(notPassing1));
				TEUtils.throws(() => CVPositiveInteger.fromBigDecimalOrThrow(notPassing2));
				TEUtils.throws(() => CVPositiveInteger.fromBigDecimalOrThrow(notPassing3));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.fromBigDecimalOrThrow(passing), integer);
			});
		});
	});

	describe('Conversions from BigInt', () => {
		const notPassing1 = 10n ** 500n;
		const notPassing2 = -154n;
		const passing = 154n;
		const integer = 154 as CVPositiveInteger.Type;

		describe('unsafeFromBigInt', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigInt(notPassing1));
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromBigInt(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.unsafeFromBigInt(passing), integer);
			});
		});

		describe('fromBigIntOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveInteger.fromBigIntOption(notPassing1));
				TEUtils.assertNone(CVPositiveInteger.fromBigIntOption(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveInteger.fromBigIntOption(passing), integer);
			});
		});

		describe('fromBigInt', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveInteger.fromBigInt(notPassing1));
				TEUtils.assertLeft(CVPositiveInteger.fromBigInt(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveInteger.fromBigInt(passing), integer);
			});
		});

		describe('fromBigIntOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveInteger.fromBigIntOrThrow(notPassing1));
				TEUtils.throws(() => CVPositiveInteger.fromBigIntOrThrow(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.fromBigIntOrThrow(passing), integer);
			});
		});
	});

	describe('Conversions from Real', () => {
		const notPassing1 = CVReal.unsafeFromNumber(-15);
		const notPassing2 = CVReal.unsafeFromNumber(15.4);
		const passing = CVReal.unsafeFromNumber(15);
		const integer = 15 as CVPositiveInteger.Type;

		describe('unsafeFromReal', () => {
			it('Not passing', () => {
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromReal(notPassing1));
				TEUtils.doesNotThrow(() => CVPositiveInteger.unsafeFromReal(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.unsafeFromReal(passing), integer);
			});
		});

		describe('fromRealOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveInteger.fromRealOption(notPassing1));
				TEUtils.assertNone(CVPositiveInteger.fromRealOption(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveInteger.fromRealOption(passing), integer);
			});
		});

		describe('fromReal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveInteger.fromReal(notPassing1));
				TEUtils.assertLeft(CVPositiveInteger.fromReal(notPassing2));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveInteger.fromReal(passing), integer);
			});
		});

		describe('fromRealOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveInteger.fromRealOrThrow(notPassing1));
				TEUtils.throws(() => CVPositiveInteger.fromRealOrThrow(notPassing2));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.fromRealOrThrow(passing), integer);
			});
		});
	});

	describe('Conversions from Integer', () => {
		const notPassing = CVInteger.unsafeFromNumber(-15);
		const passing = CVInteger.unsafeFromNumber(15);
		const integer = 15 as CVPositiveInteger.Type;

		describe('fromIntegerOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveInteger.fromIntegerOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveInteger.fromIntegerOption(passing), integer);
			});
		});

		describe('fromInteger', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveInteger.fromInteger(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveInteger.fromInteger(passing), integer);
			});
		});

		describe('fromIntegerOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveInteger.fromIntegerOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.fromIntegerOrThrow(passing), integer);
			});
		});
	});

	describe('Conversions from PositiveReal', () => {
		const notPassing = CVPositiveReal.unsafeFromNumber(15.4);
		const passing = CVPositiveReal.unsafeFromNumber(15);
		const integer = 15 as CVPositiveInteger.Type;

		describe('fromPositiveRealOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVPositiveInteger.fromPositiveRealOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVPositiveInteger.fromPositiveRealOption(passing), integer);
			});
		});

		describe('fromPositiveReal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVPositiveInteger.fromPositiveReal(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVPositiveInteger.fromPositiveReal(passing), integer);
			});
		});

		describe('fromPositiveRealOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVPositiveInteger.fromPositiveRealOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVPositiveInteger.fromPositiveRealOrThrow(passing), integer);
			});
		});
	});
});
