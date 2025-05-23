/* eslint-disable functional/no-expression-statements */
import { MBigInt } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('MBigInt', () => {
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
