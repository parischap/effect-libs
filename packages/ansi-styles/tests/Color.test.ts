/* eslint-disable functional/no-expression-statements */
import { ASColor } from '@parischap/ansi-styles';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('Color', () => {
	describe('Tag and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), ASColor.moduleTag);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASColor.has(ASColor.threeBitRed));
				TEUtils.assertTrue(ASColor.has(ASColor.eightBitRed));
				TEUtils.assertTrue(ASColor.has(ASColor.rgbRed));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASColor.has(new Date()));
			});
		});

		describe('isThreeBit', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASColor.isThreeBit(ASColor.threeBitRed));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASColor.isThreeBit(ASColor.eightBitRed));
				TEUtils.assertFalse(ASColor.isThreeBit(ASColor.rgbRed));
			});
		});

		describe('isEightBit', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASColor.isEightBit(ASColor.eightBitRed));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASColor.isEightBit(ASColor.threeBitRed));
				TEUtils.assertFalse(ASColor.isEightBit(ASColor.rgbRed));
			});
		});

		describe('isRgb', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASColor.isRgb(ASColor.rgbRed));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASColor.isRgb(ASColor.threeBitRed));
				TEUtils.assertFalse(ASColor.isRgb(ASColor.eightBitRed));
			});
		});
	});

	describe('ThreeBit', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					TEUtils.assertEquals(ASColor.threeBitBlack, ASColor.threeBitBlack);
				});

				it('Non-matching', () => {
					TEUtils.assertNotEquals(ASColor.threeBitBlack, new Date());
					TEUtils.assertNotEquals(ASColor.threeBitBlack, ASColor.threeBitRed);
					TEUtils.assertNotEquals(ASColor.threeBitBlack, ASColor.eightBitBlack);
				});
			});

			it('.pipe()', () => {
				TEUtils.assertTrue(ASColor.threeBitBlack.pipe(ASColor.ThreeBit.has));
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(ASColor.ThreeBit.has(ASColor.threeBitBlack));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(ASColor.ThreeBit.has(new Date()));
					TEUtils.assertFalse(ASColor.ThreeBit.has(ASColor.eightBitBlack));
				});
			});
		});
	});

	describe('EightBit', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					TEUtils.assertEquals(ASColor.eightBitBlack, ASColor.eightBitBlack);
				});

				it('Non-matching', () => {
					TEUtils.assertNotEquals(ASColor.eightBitBlack, new Date());
					TEUtils.assertNotEquals(ASColor.eightBitBlack, ASColor.eightBitRed);
					TEUtils.assertNotEquals(ASColor.eightBitBlack, ASColor.threeBitBlack);
				});
			});

			it('.pipe()', () => {
				TEUtils.assertTrue(ASColor.eightBitBlack.pipe(ASColor.EightBit.has));
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(ASColor.EightBit.has(ASColor.eightBitBlack));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(ASColor.EightBit.has(new Date()));
					TEUtils.assertFalse(ASColor.EightBit.has(ASColor.threeBitBlack));
				});
			});
		});
	});

	describe('Rgb', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					TEUtils.assertEquals(ASColor.rgbBlack, ASColor.rgbBlack);
				});

				it('Non-matching', () => {
					TEUtils.assertNotEquals(ASColor.rgbBlack, new Date());
					TEUtils.assertNotEquals(ASColor.rgbBlack, ASColor.rgbRed);
					TEUtils.assertNotEquals(ASColor.rgbBlack, ASColor.eightBitBlack);
				});
			});

			it('.pipe()', () => {
				TEUtils.assertTrue(ASColor.rgbBlack.pipe(ASColor.Rgb.has));
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(ASColor.Rgb.has(ASColor.rgbBlack));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(ASColor.Rgb.has(new Date()));
					TEUtils.assertFalse(ASColor.Rgb.has(ASColor.eightBitBlack));
				});
			});
		});
	});

	describe('equivalence', () => {
		it('Matching', () => {
			TEUtils.assertTrue(ASColor.equivalence(ASColor.threeBitBlack, ASColor.threeBitBlack));
			TEUtils.assertTrue(ASColor.equivalence(ASColor.eightBitBlack, ASColor.eightBitBlack));
			TEUtils.assertTrue(
				ASColor.equivalence(ASColor.rgbBlack, ASColor.Rgb.make({ red: 0, green: 0, blue: 0 }))
			);
		});

		it('Non-matching', () => {
			TEUtils.assertFalse(ASColor.equivalence(ASColor.threeBitBlack, ASColor.eightBitBlack));
			TEUtils.assertFalse(ASColor.equivalence(ASColor.eightBitBlack, ASColor.rgbBlack));
			TEUtils.assertFalse(ASColor.equivalence(ASColor.threeBitBlack, ASColor.rgbBlack));
		});
	});

	describe('toId', () => {
		it('ThreeBit', () => {
			TEUtils.strictEqual(ASColor.toId(ASColor.threeBitGreen), 'Green');
		});
		it('ThreeBit.Bright', () => {
			TEUtils.strictEqual(ASColor.toId(ASColor.threeBitBrightGreen), 'BrightGreen');
		});
		it('EightBit', () => {
			TEUtils.strictEqual(ASColor.toId(ASColor.eightBitGreen), 'EightBitGreen');
		});
		it('Rgb predefined', () => {
			TEUtils.strictEqual(ASColor.toId(ASColor.rgbGreen), 'RgbGreen');
		});
		it('Rgb user-defined', () => {
			TEUtils.strictEqual(
				ASColor.toId(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 })),
				'Rgb127/18/12'
			);
		});
	});

	describe('toSequence', () => {
		it('ThreeBit', () => {
			TEUtils.deepStrictEqual(ASColor.toSequence(ASColor.threeBitGreen), [32]);
		});
		it('ThreeBit.Bright', () => {
			TEUtils.deepStrictEqual(ASColor.toSequence(ASColor.threeBitBrightGreen), [92]);
		});
		it('EightBit', () => {
			TEUtils.deepStrictEqual(ASColor.toSequence(ASColor.eightBitGreen), [38, 5, 2]);
		});
		it('Rgb predefined', () => {
			TEUtils.deepStrictEqual(ASColor.toSequence(ASColor.rgbGreen), [38, 2, 0, 128, 0]);
		});
		it('Rgb user-defined', () => {
			TEUtils.deepStrictEqual(
				ASColor.toSequence(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 })),
				[38, 2, 127, 18, 12]
			);
		});
	});
});
