/* eslint-disable functional/no-expression-statements */
import { CVRoundingMode } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVRoundingMode', () => {
	describe('toCorrecter', () => {
		it('Ceil', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Ceil);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), 0);
		});

		it('Floor', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Floor);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), -1);
		});

		it('Expand', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Expand);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), -1);
		});

		it('Trunc', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Trunc);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), 0);
		});

		it('HalfCeil', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfCeil);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: false }), -1);
		});

		it('HalfFloor', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfFloor);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: false }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
		});

		it('HalfExpand', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfExpand);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
		});

		it('HalfEven', () => {
			const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfEven);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: true }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: true }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: true }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: true }), -1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: true }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: true }), 0);

			TEUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: false }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: false }), -1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
			TEUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
		});
	});
});
