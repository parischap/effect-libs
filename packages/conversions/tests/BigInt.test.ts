/* eslint-disable functional/no-expression-statements */
import { CVBigInt, CVInteger, CVPositiveInteger, CVReal } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVBigInt', () => {
	it('From Integer', () => {
		TEUtils.deepStrictEqual(CVBigInt.fromInteger(CVInteger.unsafeFromNumber(-154)), -154n);
	});

	it('From PositiveInteger', () => {
		TEUtils.deepStrictEqual(CVBigInt.fromInteger(CVPositiveInteger.unsafeFromNumber(154)), 154n);
	});

	describe('Conversions from Real', () => {
		const notPassing = CVReal.unsafeFromNumber(15.4);
		const passing = CVReal.unsafeFromNumber(15);
		const bigint = 15n;

		describe('fromRealOption', () => {
			it('Not passing', () => {
				TEUtils.assertNone(CVBigInt.fromRealOption(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertSome(CVBigInt.fromRealOption(passing), bigint);
			});
		});

		describe('fromReal', () => {
			it('Not passing', () => {
				TEUtils.assertLeft(CVBigInt.fromReal(notPassing));
			});
			it('Passing', () => {
				TEUtils.assertRight(CVBigInt.fromReal(passing), bigint);
			});
		});

		describe('fromRealOrThrow', () => {
			it('Not passing', () => {
				TEUtils.throws(() => CVBigInt.fromRealOrThrow(notPassing));
			});
			it('Passing', () => {
				TEUtils.strictEqual(CVBigInt.fromRealOrThrow(passing), bigint);
			});
		});
	});
});
