/* eslint-disable functional/no-expression-statements */
import { ASColor } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Color', () => {
	describe('Tag and guards', () => {
		it('moduleTag', () => {
			expect(ASColor.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASColor.has(ASColor.threeBitRed)).toBe(true);
				expect(ASColor.has(ASColor.eightBitRed)).toBe(true);
				expect(ASColor.has(ASColor.rgbRed)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.has(new Date())).toBe(false);
			});
		});

		describe('isThreeBit', () => {
			it('Matching', () => {
				expect(ASColor.isThreeBit(ASColor.threeBitRed)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.isThreeBit(ASColor.eightBitRed)).toBe(false);
				expect(ASColor.isThreeBit(ASColor.rgbRed)).toBe(false);
			});
		});

		describe('isEightBit', () => {
			it('Matching', () => {
				expect(ASColor.isEightBit(ASColor.eightBitRed)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.isEightBit(ASColor.threeBitRed)).toBe(false);
				expect(ASColor.isEightBit(ASColor.rgbRed)).toBe(false);
			});
		});

		describe('isRgb', () => {
			it('Matching', () => {
				expect(ASColor.isRgb(ASColor.rgbRed)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.isRgb(ASColor.threeBitRed)).toBe(false);
				expect(ASColor.isRgb(ASColor.eightBitRed)).toBe(false);
			});
		});
	});

	describe('ThreeBit', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					expect(Equal.equals(ASColor.threeBitBlack, ASColor.threeBitBlack)).toBe(true);
				});

				it('Non-matching', () => {
					expect(Equal.equals(ASColor.threeBitBlack, new Date())).toBe(false);
					expect(Equal.equals(ASColor.threeBitBlack, ASColor.threeBitRed)).toBe(false);
					expect(Equal.equals(ASColor.threeBitBlack, ASColor.eightBitBlack)).toBe(false);
				});
			});

			it('.pipe()', () => {
				expect(ASColor.threeBitBlack.pipe(ASColor.ThreeBit.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASColor.ThreeBit.has(ASColor.threeBitBlack)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASColor.ThreeBit.has(new Date())).toBe(false);
					expect(ASColor.ThreeBit.has(ASColor.eightBitBlack)).toBe(false);
				});
			});
		});
	});

	describe('EightBit', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					expect(Equal.equals(ASColor.eightBitBlack, ASColor.eightBitBlack)).toBe(true);
				});

				it('Non-matching', () => {
					expect(Equal.equals(ASColor.eightBitBlack, new Date())).toBe(false);
					expect(Equal.equals(ASColor.eightBitBlack, ASColor.eightBitRed)).toBe(false);
					expect(Equal.equals(ASColor.eightBitBlack, ASColor.threeBitBlack)).toBe(false);
				});
			});

			it('.pipe()', () => {
				expect(ASColor.eightBitBlack.pipe(ASColor.EightBit.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASColor.EightBit.has(ASColor.eightBitBlack)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASColor.EightBit.has(new Date())).toBe(false);
					expect(ASColor.EightBit.has(ASColor.threeBitBlack)).toBe(false);
				});
			});
		});
	});

	describe('Rgb', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					expect(Equal.equals(ASColor.rgbBlack, ASColor.rgbBlack)).toBe(true);
				});

				it('Non-matching', () => {
					expect(Equal.equals(ASColor.rgbBlack, new Date())).toBe(false);
					expect(Equal.equals(ASColor.rgbBlack, ASColor.rgbRed)).toBe(false);
					expect(Equal.equals(ASColor.rgbBlack, ASColor.eightBitBlack)).toBe(false);
				});
			});

			it('.pipe()', () => {
				expect(ASColor.rgbBlack.pipe(ASColor.Rgb.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASColor.Rgb.has(ASColor.rgbBlack)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASColor.Rgb.has(new Date())).toBe(false);
					expect(ASColor.Rgb.has(ASColor.eightBitBlack)).toBe(false);
				});
			});
		});
	});

	describe('equivalence', () => {
		it('Matching', () => {
			expect(ASColor.equivalence(ASColor.threeBitBlack, ASColor.threeBitBlack)).toBe(true);
			expect(ASColor.equivalence(ASColor.eightBitBlack, ASColor.eightBitBlack)).toBe(true);
			expect(
				ASColor.equivalence(ASColor.rgbBlack, ASColor.Rgb.make({ red: 0, green: 0, blue: 0 }))
			).toBe(true);
		});

		it('Non-matching', () => {
			expect(ASColor.equivalence(ASColor.threeBitBlack, ASColor.eightBitBlack)).toBe(false);
			expect(ASColor.equivalence(ASColor.eightBitBlack, ASColor.rgbBlack)).toBe(false);
			expect(ASColor.equivalence(ASColor.threeBitBlack, ASColor.rgbBlack)).toBe(false);
		});
	});

	describe('toId', () => {
		it('ThreeBit', () => {
			expect(ASColor.toId(ASColor.threeBitGreen)).toBe('Green');
		});
		it('ThreeBit.Bright', () => {
			expect(ASColor.toId(ASColor.threeBitBrightGreen)).toBe('BrightGreen');
		});
		it('EightBit', () => {
			expect(ASColor.toId(ASColor.eightBitGreen)).toBe('EightBitGreen');
		});
		it('Rgb predefined', () => {
			expect(ASColor.toId(ASColor.rgbGreen)).toBe('RgbGreen');
		});
		it('Rgb user-defined', () => {
			expect(ASColor.toId(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 }))).toBe(
				'Rgb127/18/12'
			);
		});
	});

	describe('toSequence', () => {
		it('ThreeBit', () => {
			expect(ASColor.toSequence(ASColor.threeBitGreen)).toEqual([32]);
		});
		it('ThreeBit.Bright', () => {
			expect(ASColor.toSequence(ASColor.threeBitBrightGreen)).toEqual([92]);
		});
		it('EightBit', () => {
			expect(ASColor.toSequence(ASColor.eightBitGreen)).toEqual([38, 5, 2]);
		});
		it('Rgb predefined', () => {
			expect(ASColor.toSequence(ASColor.rgbGreen)).toEqual([38, 2, 0, 128, 0]);
		});
		it('Rgb user-defined', () => {
			expect(ASColor.toSequence(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 }))).toEqual([
				38, 2, 127, 18, 12
			]);
		});
	});
});
