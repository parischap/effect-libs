/* eslint-disable functional/no-expression-statements */
import { MBigInt } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('MBigInt', () => {
	describe('fromPrimitiveOrThrow', () => {
		it('Passing', () => {
			TEUtils.strictEqual(MBigInt.fromPrimitiveOrThrow(10), 10n);
		});
		it('Not passing', () => {
			TEUtils.throws(() => MBigInt.fromPrimitiveOrThrow(10.4));
			TEUtils.throws(() => MBigInt.fromPrimitiveOrThrow(Infinity));
			TEUtils.throws(() => MBigInt.fromPrimitiveOrThrow(NaN));
		});
	});

	describe('fromPrimitiveOption', () => {
		it('Passing', () => {
			TEUtils.assertSome(MBigInt.fromPrimitiveOption(10), 10n);
		});
		it('Not passing', () => {
			TEUtils.assertNone(MBigInt.fromPrimitiveOption(10.4));
			TEUtils.assertNone(MBigInt.fromPrimitiveOption(-Infinity));
			TEUtils.assertNone(MBigInt.fromPrimitiveOption(NaN));
		});
	});

	describe('fromPrimitive', () => {
		it('Passing', () => {
			TEUtils.assertRight(MBigInt.fromPrimitive(10), 10n);
		});
		it('Not passing', () => {
			TEUtils.assertLeft(MBigInt.fromPrimitive(10.4));
			TEUtils.assertLeft(MBigInt.fromPrimitive(Infinity));
			TEUtils.assertLeft(MBigInt.fromPrimitive(NaN));
		});
	});

	describe('isEven', () => {
		it('Passing', () => {
			TEUtils.assertTrue(MBigInt.isEven(10n));
		});
		it('Not passing', () => {
			TEUtils.assertFalse(MBigInt.isEven(11n));
		});
	});

	describe('log10', () => {
		it('Negative value', () => {
			TEUtils.assertNone(MBigInt.log10(-3n));
		});

		it('Positive value', () => {
			TEUtils.assertSome(MBigInt.log10(1248n), 3);
		});
	});
});
