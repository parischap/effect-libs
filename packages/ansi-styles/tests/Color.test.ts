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
				expect(ASColor.has(ASColor.ThreeBit.red)).toBe(true);
				expect(ASColor.has(ASColor.EightBit.red)).toBe(true);
				expect(ASColor.has(ASColor.Rgb.red)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.has(new Date())).toBe(false);
			});
		});

		describe('isThreeBit', () => {
			it('Matching', () => {
				expect(ASColor.isThreeBit(ASColor.ThreeBit.red)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.isThreeBit(ASColor.EightBit.red)).toBe(false);
				expect(ASColor.isThreeBit(ASColor.Rgb.red)).toBe(false);
			});
		});

		describe('isEightBit', () => {
			it('Matching', () => {
				expect(ASColor.isEightBit(ASColor.EightBit.red)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.isEightBit(ASColor.ThreeBit.red)).toBe(false);
				expect(ASColor.isEightBit(ASColor.Rgb.red)).toBe(false);
			});
		});

		describe('isRgb', () => {
			it('Matching', () => {
				expect(ASColor.isRgb(ASColor.Rgb.red)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASColor.isRgb(ASColor.ThreeBit.red)).toBe(false);
				expect(ASColor.isRgb(ASColor.EightBit.red)).toBe(false);
			});
		});
	});

	describe('ThreeBit', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					expect(Equal.equals(ASColor.ThreeBit.black, ASColor.ThreeBit.black)).toBe(true);
				});

				it('Non-matching', () => {
					expect(Equal.equals(ASColor.ThreeBit.black, new Date())).toBe(false);
					expect(Equal.equals(ASColor.ThreeBit.black, ASColor.ThreeBit.red)).toBe(false);
					expect(Equal.equals(ASColor.ThreeBit.black, ASColor.EightBit.black)).toBe(false);
				});
			});

			it('.pipe()', () => {
				expect(ASColor.ThreeBit.black.pipe(ASColor.ThreeBit.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASColor.ThreeBit.has(ASColor.ThreeBit.black)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASColor.ThreeBit.has(new Date())).toBe(false);
					expect(ASColor.ThreeBit.has(ASColor.EightBit.black)).toBe(false);
				});
			});
		});
	});

	describe('EightBit', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					expect(Equal.equals(ASColor.EightBit.black, ASColor.EightBit.black)).toBe(true);
				});

				it('Non-matching', () => {
					expect(Equal.equals(ASColor.EightBit.black, new Date())).toBe(false);
					expect(Equal.equals(ASColor.EightBit.black, ASColor.EightBit.red)).toBe(false);
					expect(Equal.equals(ASColor.EightBit.black, ASColor.ThreeBit.black)).toBe(false);
				});
			});

			it('.pipe()', () => {
				expect(ASColor.EightBit.black.pipe(ASColor.EightBit.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASColor.EightBit.has(ASColor.EightBit.black)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASColor.EightBit.has(new Date())).toBe(false);
					expect(ASColor.EightBit.has(ASColor.ThreeBit.black)).toBe(false);
				});
			});
		});
	});

	describe('Rgb', () => {
		describe('Prototype and guards', () => {
			describe('Equal.equals', () => {
				it('Matching', () => {
					expect(Equal.equals(ASColor.Rgb.black, ASColor.Rgb.black)).toBe(true);
				});

				it('Non-matching', () => {
					expect(Equal.equals(ASColor.Rgb.black, new Date())).toBe(false);
					expect(Equal.equals(ASColor.Rgb.black, ASColor.Rgb.red)).toBe(false);
					expect(Equal.equals(ASColor.Rgb.black, ASColor.EightBit.black)).toBe(false);
				});
			});

			it('.pipe()', () => {
				expect(ASColor.Rgb.black.pipe(ASColor.Rgb.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASColor.Rgb.has(ASColor.Rgb.black)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASColor.Rgb.has(new Date())).toBe(false);
					expect(ASColor.Rgb.has(ASColor.EightBit.black)).toBe(false);
				});
			});
		});
	});

	describe('equivalence', () => {
		it('Matching', () => {
			expect(ASColor.equivalence(ASColor.ThreeBit.black, ASColor.ThreeBit.black)).toBe(true);
			expect(ASColor.equivalence(ASColor.EightBit.black, ASColor.EightBit.black)).toBe(true);
			expect(
				ASColor.equivalence(ASColor.Rgb.black, ASColor.Rgb.make({ red: 0, green: 0, blue: 0 }))
			).toBe(true);
		});

		it('Non-matching', () => {
			expect(ASColor.equivalence(ASColor.ThreeBit.black, ASColor.EightBit.black)).toBe(false);
			expect(ASColor.equivalence(ASColor.EightBit.black, ASColor.Rgb.black)).toBe(false);
			expect(ASColor.equivalence(ASColor.ThreeBit.black, ASColor.Rgb.black)).toBe(false);
		});
	});

	describe('toId', () => {
		it('ThreeBit', () => {
			expect(ASColor.toId(ASColor.ThreeBit.green)).toBe('Green');
		});
		it('ThreeBit.Bright', () => {
			expect(ASColor.toId(ASColor.ThreeBit.Bright.green)).toBe('BrightGreen');
		});
		it('EightBit', () => {
			expect(ASColor.toId(ASColor.EightBit.green)).toBe('EightBitGreen');
		});
		it('Rgb predefined', () => {
			expect(ASColor.toId(ASColor.Rgb.green)).toBe('RgbGreen');
		});
		it('Rgb user-defined', () => {
			expect(ASColor.toId(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 }))).toBe(
				'Rgb127/18/12'
			);
		});
	});

	describe('toSequence', () => {
		it('ThreeBit', () => {
			expect(ASColor.toSequence(ASColor.ThreeBit.green)).toEqual([32]);
		});
		it('ThreeBit.Bright', () => {
			expect(ASColor.toSequence(ASColor.ThreeBit.Bright.green)).toEqual([92]);
		});
		it('EightBit', () => {
			expect(ASColor.toSequence(ASColor.EightBit.green)).toEqual([38, 5, 2]);
		});
		it('Rgb predefined', () => {
			expect(ASColor.toSequence(ASColor.Rgb.green)).toEqual([38, 2, 0, 128, 0]);
		});
		it('Rgb user-defined', () => {
			expect(ASColor.toSequence(ASColor.Rgb.make({ red: 127, green: 18, blue: 12 }))).toEqual([
				38, 2, 127, 18, 12
			]);
		});
	});
});
