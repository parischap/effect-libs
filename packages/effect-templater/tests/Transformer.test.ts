/* eslint-disable functional/no-expression-statements */
import { MBrand } from '@parischap/effect-lib';
import { Transformer } from '@parischap/effect-templater';
import { Chunk, Either, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Transformer.RealOptions', () => {
	describe('floatingPoint', () => {
		const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.floatingPoint);

		describe('Reading', () => {
			it('Empty string', () => {
				expect(tester('')).toBe(false);
			});

			it('One space string', () => {
				expect(tester(' ')).toBe(false);
			});

			it('With upfront 0', () => {
				expect(tester('01.1')).toBe(false);
			});

			it('With upfront space', () => {
				expect(tester(' 1.1')).toBe(false);
			});

			it('With comma in the decimal part', () => {
				expect(tester('1,001.1')).toBe(false);
			});

			it('With fractional separator but without fractional part', () => {
				expect(tester('1001,')).toBe(false);
			});

			it('With thousand sep in the fractional part', () => {
				expect(tester('1001.100,1')).toBe(false);
			});

			it('With two fractional separators', () => {
				expect(tester('1.001.1')).toBe(false);
			});

			it('0', () => {
				expect(tester('0')).toBe(true);
			});

			it('Any integer', () => {
				expect(tester('1001')).toBe(true);
			});

			it('Any floating point', () => {
				expect(tester('1001.1001')).toBe(true);
			});

			it('Floating point with no decimal part', () => {
				expect(tester('.1001')).toBe(true);
			});

			it('Floating point with null decimal part', () => {
				expect(tester('0.1001')).toBe(true);
			});

			it('Floating point with trailing zeros in the fractional part', () => {
				expect(tester('0.1000')).toBe(true);
			});

			it('Floating point with leading zeros in the fractional part', () => {
				expect(tester('0.0001')).toBe(true);
			});
		});
	});

	describe('ukFloatingPoint', () => {
		const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.ukFloatingPoint);

		describe('Reading', () => {
			it('Empty string', () => {
				expect(tester('')).toBe(false);
			});

			it('One space string', () => {
				expect(tester(' ')).toBe(false);
			});

			it('With upfront 0', () => {
				expect(tester('01,001.1')).toBe(false);
			});

			it('With upfront space', () => {
				expect(tester(' 1,001.1')).toBe(false);
			});

			it('With fractional separator but without fractional part', () => {
				expect(tester('1,001.')).toBe(false);
			});

			it('With thousand sep in the fractional part', () => {
				expect(tester('1,001.100,1')).toBe(false);
			});

			it('With two fractional separators', () => {
				expect(tester('1,001.1.101')).toBe(false);
			});

			it('With misplaced thousand separator', () => {
				expect(tester('1,001,1.1001')).toBe(false);
			});

			it('0', () => {
				expect(tester('0')).toBe(true);
			});

			it('Any integer', () => {
				expect(tester('1,001,001')).toBe(true);
			});

			it('Any floating point', () => {
				expect(tester('121.1001')).toBe(true);
			});

			it('Floating point with no decimal part', () => {
				expect(tester('.1001')).toBe(true);
			});

			it('Floating point with null decimal part', () => {
				expect(tester('0.1001')).toBe(true);
			});
		});
	});

	describe('germanFloatingPoint', () => {
		const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.germanFloatingPoint);

		describe('Reading', () => {
			it('Any floating point', () => {
				expect(tester('1.001.001,1001')).toBe(true);
			});
		});
	});

	describe('scientificNotation', () => {
		const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.scientificNotation);

		describe('Reading', () => {
			it('Empty string', () => {
				expect(tester('')).toBe(false);
			});

			it('One space string', () => {
				expect(tester(' ')).toBe(false);
			});

			it('With no significand', () => {
				expect(tester('e10')).toBe(false);
			});

			it('', () => {
				expect(tester('10.65e4')).toBe(false);
			});

			it('With space after e', () => {
				expect(tester('3.14e 2')).toBe(false);
			});

			it('With space before e', () => {
				expect(tester('3.14 e2')).toBe(false);
			});

			it('With fractional exponent', () => {
				expect(tester('3.14e-2.3')).toBe(false);
			});

			it('0.00', () => {
				expect(tester('0.00')).toBe(true);
			});

			it('With fractional significand', () => {
				expect(tester('.13e10')).toBe(true);
			});

			it('Any number between 0 and 10 without exponent', () => {
				expect(tester('7.45')).toBe(true);
			});

			it('Any number between 0 and 10 with unsigned strictly positive exponent', () => {
				expect(tester('3.15e12')).toBe(true);
			});

			it('Any number between 0 and 10 with signed strictly positive exponent', () => {
				expect(tester('3.15e+12')).toBe(true);
			});

			it('Any number between 0 and 10 with null exponent', () => {
				expect(tester('3.15e0')).toBe(true);
			});

			it('Any number between 0 and 10 with strictly negative exponent', () => {
				expect(tester('3.15e-12')).toBe(true);
			});
		});

		describe('frenchFloatingPoint2', () => {
			const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.frenchFloatingPoint2);

			describe('Reading', () => {
				it('Empty string', () => {
					expect(tester('')).toBe(false);
				});

				it('One space string', () => {
					expect(tester(' ')).toBe(false);
				});

				it('With upfront 0', () => {
					expect(tester('01,10')).toBe(false);
				});

				it('With upfront space', () => {
					expect(tester(' 1,13')).toBe(false);
				});

				it('0', () => {
					expect(tester('0')).toBe(false);
				});

				it('Any integer with no fractional digit', () => {
					expect(tester('1 001')).toBe(false);
				});

				it('Any integer with one fractional digit', () => {
					expect(tester('1 001,1')).toBe(false);
				});

				it('Any integer with three fractional digits', () => {
					expect(tester('1 001,123')).toBe(false);
				});

				it('Any integer with two fractional digits but no space sep', () => {
					expect(tester('1001,12')).toBe(false);
				});

				it('0,00', () => {
					expect(tester('0,00')).toBe(true);
				});

				it('Any integer with two fractional digits', () => {
					expect(tester('1 001,43')).toBe(true);
				});
			});
		});

		describe('frenchInt', () => {
			const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.frenchInt);

			describe('Reading', () => {
				it('Empty string', () => {
					expect(tester('')).toBe(false);
				});

				it('One space string', () => {
					expect(tester(' ')).toBe(false);
				});

				it('With upfront 0', () => {
					expect(tester('01')).toBe(false);
				});

				it('With upfront space', () => {
					expect(tester(' 1')).toBe(false);
				});

				it('With comma in the decimal part', () => {
					expect(tester('1,001')).toBe(false);
				});

				it('With fractional part', () => {
					expect(tester('1 001,134')).toBe(false);
				});

				it('Unsigned integer', () => {
					expect(tester('1 001')).toBe(true);
				});

				it('Integer with minus sign', () => {
					expect(tester('-1 001')).toBe(true);
				});

				it('Integer with spaced minus sign', () => {
					expect(tester('- 1 001')).toBe(false);
				});

				it('Integer with plus sign', () => {
					expect(tester('+1 001')).toBe(false);
				});
			});
		});

		describe('unsignedFrenchInt', () => {
			const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.unsignedFrenchInt);

			describe('Reading', () => {
				it('Empty string', () => {
					expect(tester('')).toBe(false);
				});

				it('One space string', () => {
					expect(tester(' ')).toBe(false);
				});

				it('With upfront 0', () => {
					expect(tester('01')).toBe(false);
				});

				it('With upfront space', () => {
					expect(tester(' 1')).toBe(false);
				});

				it('Unsigned integer', () => {
					expect(tester('1 001')).toBe(true);
				});

				it('Integer with minus sign', () => {
					expect(tester('-1 001')).toBe(false);
				});

				it('Integer with spaced minus sign', () => {
					expect(tester('- 1 001')).toBe(false);
				});

				it('Integer with plus sign', () => {
					expect(tester('+1 001')).toBe(false);
				});
			});
		});

		describe('signedFrenchInt', () => {
			const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.signedFrenchInt);

			describe('Reading', () => {
				it('Empty string', () => {
					expect(tester('')).toBe(false);
				});

				it('One space string', () => {
					expect(tester(' ')).toBe(false);
				});

				it('With upfront 0', () => {
					expect(tester('01')).toBe(false);
				});

				it('Unsigned integer', () => {
					expect(tester('1 001')).toBe(false);
				});

				it('Integer with minus sign', () => {
					expect(tester('-1 001')).toBe(true);
				});

				it('Integer with spaced minus sign', () => {
					expect(tester('- 1 001')).toBe(false);
				});

				it('Integer with plus sign', () => {
					expect(tester('+1 001')).toBe(true);
				});
			});
		});

		describe('plussedFrenchInt', () => {
			const tester = Transformer.RealOptions.toTester(Transformer.RealOptions.plussedFrenchInt);

			describe('Reading', () => {
				it('Empty string', () => {
					expect(tester('')).toBe(false);
				});

				it('One space string', () => {
					expect(tester(' ')).toBe(false);
				});

				it('With upfront 0', () => {
					expect(tester('01')).toBe(false);
				});

				it('Unsigned integer', () => {
					expect(tester('1 001')).toBe(true);
				});

				it('Integer with minus sign', () => {
					expect(tester('-1 001')).toBe(true);
				});

				it('Integer with spaced minus sign', () => {
					expect(tester('-  001')).toBe(false);
				});

				it('Integer with plus sign', () => {
					expect(tester('+1 001')).toBe(true);
				});
			});
		});
	});
});

describe('Transformer', () => {
	describe('string', () => {
		it('Reading', () => {
			expect(
				pipe(
					'foo and bar',
					Transformer.string.read,
					// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
					Either.map(Chunk.fromIterable),
					Equal.equals(Either.right(Chunk.make('foo and bar', '')))
				)
			).toBe(true);
		});

		it('Writing', () => {
			expect(
				pipe('foo and bar', Transformer.string.write, Equal.equals(Either.right('foo and bar')))
			).toBe(true);
		});
	});

	describe('floatingPoint', () => {
		describe('Reading', () => {
			it('Empty string', () => {
				expect(pipe('', Transformer.floatingPoint.read, Either.isLeft)).toBe(true);
			});

			it('One space string', () => {
				expect(pipe(' foo', Transformer.floatingPoint.read, Either.isLeft)).toBe(true);
			});

			it('With upfront 0', () => {
				expect(
					pipe(
						'01.1foo',
						Transformer.floatingPoint.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(0, '1.1foo')))
					)
				).toBe(true);
			});

			it('With upfront space', () => {
				expect(pipe(' 1.1foo', Transformer.floatingPoint.read, Either.isLeft)).toBe(true);
			});

			it('Any positive number', () => {
				expect(
					pipe(
						'1000348.3456foo',
						Transformer.floatingPoint.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(1_000_348.3456, 'foo')))
					)
				).toBe(true);
			});

			it('Any negative number', () => {
				expect(
					pipe(
						'-.3foo',
						Transformer.floatingPoint.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(-0.3, 'foo')))
					)
				).toBe(true);
			});
		});

		describe('Writing', () => {
			it('Any positive number', () => {
				expect(
					pipe(
						10_034_538.76,
						MBrand.Real.fromNumber,
						Transformer.floatingPoint.write,
						Equal.equals(Either.right('10034538.76'))
					)
				).toBe(true);
			});

			it('Any negative number', () => {
				expect(
					pipe(
						-1_740.7654,
						MBrand.Real.fromNumber,
						Transformer.floatingPoint.write,
						Equal.equals(Either.right('-1740.7654'))
					)
				).toBe(true);
			});

			it('Any integer', () => {
				expect(
					pipe(
						-8,
						MBrand.Real.fromNumber,
						Transformer.floatingPoint.write,
						Equal.equals(Either.right('-8'))
					)
				).toBe(true);
			});

			it('Any fractional number', () => {
				expect(
					pipe(
						0.34,
						MBrand.Real.fromNumber,
						Transformer.floatingPoint.write,
						Equal.equals(Either.right('0.34'))
					)
				).toBe(true);
			});
		});
	});

	describe('ukFloatingPoint', () => {
		describe('Reading', () => {
			it('Any positive number', () => {
				expect(
					pipe(
						'1,000,348.3456foo',
						Transformer.ukFloatingPoint.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(1_000_348.3456, 'foo')))
					)
				).toBe(true);
			});

			it('Any negative number', () => {
				expect(
					pipe(
						'-10.3foo',
						Transformer.floatingPoint.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(-10.3, 'foo')))
					)
				).toBe(true);
			});
		});

		describe('Writing', () => {
			it('Any positive number', () => {
				expect(
					pipe(
						10_034_538.7654,
						MBrand.Real.fromNumber,
						Transformer.ukFloatingPoint.write,
						Equal.equals(Either.right('10,034,538.7654'))
					)
				).toBe(true);
			});

			it('Any negative number', () => {
				expect(
					pipe(
						-18.7654,
						MBrand.Real.fromNumber,
						Transformer.ukFloatingPoint.write,
						Equal.equals(Either.right('-18.7654'))
					)
				).toBe(true);
			});
		});
	});

	describe('ukFloatingPoint2', () => {
		describe('Reading', () => {
			it('Number with one fractional digit', () => {
				expect(pipe('10.3foo', Transformer.ukFloatingPoint2.read, Either.isLeft)).toBe(true);
			});

			it('Any positive number with 2 fractional digits', () => {
				expect(
					pipe(
						'10.30foo',
						Transformer.ukFloatingPoint2.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(10.3, 'foo')))
					)
				).toBe(true);
			});

			it('Number with three fractional digits', () => {
				expect(
					pipe(
						'-10.321foo',
						Transformer.ukFloatingPoint2.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(-10.32, '1foo')))
					)
				).toBe(true);
			});
		});

		describe('Writing', () => {
			it('Any integer', () => {
				expect(
					pipe(
						10_034_538,
						MBrand.Real.fromNumber,
						Transformer.ukFloatingPoint2.write,
						Equal.equals(Either.right('10,034,538.00'))
					)
				).toBe(true);
			});

			it('Any number with one fractional digit', () => {
				expect(
					pipe(
						-1_740.7,
						MBrand.Real.fromNumber,
						Transformer.ukFloatingPoint2.write,
						Equal.equals(Either.right('-1,740.70'))
					)
				).toBe(true);
			});

			it('Any number with two fractional digits', () => {
				expect(
					pipe(
						18.73,
						MBrand.Real.fromNumber,
						Transformer.ukFloatingPoint2.write,
						Equal.equals(Either.right('18.73'))
					)
				).toBe(true);
			});

			it('Any number with three fractional digits round down', () => {
				expect(
					pipe(
						18_740_543_323.344,
						MBrand.Real.fromNumber,
						Transformer.ukFloatingPoint2.write,
						Equal.equals(Either.right('18,740,543,323.34'))
					)
				).toBe(true);
			});

			it('Any number with three fractional digits round up', () => {
				expect(
					pipe(
						-194.455,
						MBrand.Real.fromNumber,
						Transformer.ukFloatingPoint2.write,
						Equal.equals(Either.right('-194.46'))
					)
				).toBe(true);
			});
		});
	});

	describe('frenchScientificNotation', () => {
		describe('Reading', () => {
			it('Number greater than 10', () => {
				expect(
					pipe(
						'10,3foo',
						Transformer.frenchScientificNotation.read, // Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(1, '0,3foo')))
					)
				).toBe(true);
			});

			it('Positive number without exponent', () => {
				expect(
					pipe(
						'9,30foo',
						Transformer.frenchScientificNotation.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(9.3, 'foo')))
					)
				).toBe(true);
			});

			it('Negative number with exponent', () => {
				expect(
					pipe(
						'-5,234e3foo',
						Transformer.frenchScientificNotation.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(-5_234, 'foo')))
					)
				).toBe(true);
			});
		});

		describe('Writing', () => {
			it('Any integer', () => {
				expect(
					pipe(
						0,
						MBrand.Real.fromNumber,
						Transformer.frenchScientificNotation.write,
						Equal.equals(Either.right('0e0'))
					)
				).toBe(true);
			});

			it('Any positive integer', () => {
				expect(
					pipe(
						10_034_538,
						MBrand.Real.fromNumber,
						Transformer.frenchScientificNotation.write,
						Equal.equals(Either.right('1,0035e7'))
					)
				).toBe(true);
			});

			it('Any negative integer', () => {
				expect(
					pipe(
						-4.43,
						MBrand.Real.fromNumber,
						Transformer.frenchScientificNotation.write,
						Equal.equals(Either.right('-4,43e0'))
					)
				).toBe(true);
			});
		});
	});

	describe('germanFractional', () => {
		describe('Reading', () => {
			it('Number with decimal part', () => {
				expect(pipe('10,3foo', Transformer.germanFractional.read, Either.isLeft)).toBe(true);
			});

			it('Positive number', () => {
				expect(
					pipe(
						',3230foo',
						Transformer.germanFractional.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(0.323, 'foo')))
					)
				).toBe(true);
			});

			it('Negative number with exponent', () => {
				expect(
					pipe(
						'-,234e3foo',
						Transformer.germanFractional.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(-0.234, 'e3foo')))
					)
				).toBe(true);
			});
		});

		describe('Writing', () => {
			it('0', () => {
				expect(
					pipe(0, MBrand.Real.fromNumber, Transformer.germanFractional.write, Either.isLeft)
				).toBe(true);
			});

			it('Number that rounds to 0 with maxFractionalDigits', () => {
				expect(
					pipe(0.00004, MBrand.Real.fromNumber, Transformer.germanFractional.write, Either.isLeft)
				).toBe(true);
			});

			it('Any integer', () => {
				expect(
					pipe(8, MBrand.Real.fromNumber, Transformer.germanFractional.write, Either.isLeft)
				).toBe(true);
			});

			it('Any fractional number', () => {
				expect(
					pipe(
						-0.443,
						MBrand.Real.fromNumber,
						Transformer.germanFractional.write,
						Equal.equals(Either.right('-,443'))
					)
				).toBe(true);
			});
		});
	});

	describe('ukInt', () => {
		describe('Reading', () => {
			it('Positive integer', () => {
				expect(
					pipe(
						'10foo',
						Transformer.ukInt.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(10, 'foo')))
					)
				).toBe(true);
			});

			it('Negative fractional number', () => {
				expect(
					pipe(
						'-10.3foo',
						Transformer.ukInt.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(-10, '.3foo')))
					)
				).toBe(true);
			});
		});

		describe('Writing', () => {
			it('0', () => {
				expect(
					pipe(0, MBrand.Int.fromNumber, Transformer.ukInt.write, Equal.equals(Either.right('0')))
				).toBe(true);
			});

			it('Positive number', () => {
				expect(
					pipe(
						1048,
						MBrand.Int.fromNumber,
						Transformer.ukInt.write,
						Equal.equals(Either.right('1,048'))
					)
				).toBe(true);
			});

			it('Negative number', () => {
				expect(
					pipe(
						-224,
						MBrand.Int.fromNumber,
						Transformer.ukInt.write,
						Equal.equals(Either.right('-224'))
					)
				).toBe(true);
			});
		});
	});

	describe('unsignedUkInt', () => {
		describe('Reading', () => {
			it('Positive integer', () => {
				expect(
					pipe(
						'10foo',
						Transformer.unsignedUkInt.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(10, 'foo')))
					)
				).toBe(true);
			});

			it('Negative fractional number', () => {
				expect(pipe('-10.3foo', Transformer.unsignedUkInt.read, Either.isLeft)).toBe(true);
			});
		});

		describe('Writing', () => {
			it('0', () => {
				expect(
					pipe(
						0,
						MBrand.PositiveInt.fromNumber,
						Transformer.unsignedUkInt.write,
						Equal.equals(Either.right('0'))
					)
				).toBe(true);
			});

			it('Positive number', () => {
				expect(
					pipe(
						1048,
						MBrand.PositiveInt.fromNumber,
						Transformer.unsignedUkInt.write,
						Equal.equals(Either.right('1,048'))
					)
				).toBe(true);
			});
		});
	});

	describe('signedUkInt', () => {
		describe('Reading', () => {
			it('Positive integer without sign', () => {
				expect(pipe('10foo', Transformer.signedUkInt.read, Either.isLeft)).toBe(true);
			});

			it('Positive integer with sign', () => {
				expect(
					pipe(
						'+10foo',
						Transformer.signedUkInt.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(10, 'foo')))
					)
				).toBe(true);
			});

			expect(
				pipe(
					'-10.3foo',
					Transformer.signedUkInt.read,
					// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
					Either.map(Chunk.fromIterable),
					Equal.equals(Either.right(Chunk.make(-10, '.3foo')))
				)
			).toBe(true);
		});

		describe('Writing', () => {
			it('0', () => {
				expect(
					pipe(
						0,
						MBrand.Int.fromNumber,
						Transformer.signedUkInt.write,
						Equal.equals(Either.right('+0'))
					)
				).toBe(true);
			});

			it('Positive number', () => {
				expect(
					pipe(
						1048,
						MBrand.Int.fromNumber,
						Transformer.signedUkInt.write,
						Equal.equals(Either.right('+1,048'))
					)
				).toBe(true);
			});

			it('Negative number', () => {
				expect(
					pipe(
						-224,
						MBrand.Int.fromNumber,
						Transformer.signedUkInt.write,
						Equal.equals(Either.right('-224'))
					)
				).toBe(true);
			});
		});
	});

	describe('plussedUkInt', () => {
		describe('Reading', () => {
			it('Positive integer without sign', () => {
				expect(
					pipe(
						'10foo',
						Transformer.plussedUkInt.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(10, 'foo')))
					)
				).toBe(true);
			});

			it('Positive integer with sign', () => {
				expect(
					pipe(
						'+10foo',
						Transformer.plussedUkInt.read,
						// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
						Either.map(Chunk.fromIterable),
						Equal.equals(Either.right(Chunk.make(10, 'foo')))
					)
				).toBe(true);
			});

			expect(
				pipe(
					'-10.3foo',
					Transformer.plussedUkInt.read,
					// Revert from Chunk to Array when Effect 4.0 with structural equality comes out
					Either.map(Chunk.fromIterable),
					Equal.equals(Either.right(Chunk.make(-10, '.3foo')))
				)
			).toBe(true);
		});

		describe('Writing', () => {
			it('0', () => {
				expect(
					pipe(
						0,
						MBrand.Int.fromNumber,
						Transformer.plussedUkInt.write,
						Equal.equals(Either.right('0'))
					)
				).toBe(true);
			});

			it('Positive number', () => {
				expect(
					pipe(
						1048,
						MBrand.Int.fromNumber,
						Transformer.plussedUkInt.write,
						Equal.equals(Either.right('1,048'))
					)
				).toBe(true);
			});

			it('Negative number', () => {
				expect(
					pipe(
						-224,
						MBrand.Int.fromNumber,
						Transformer.plussedUkInt.write,
						Equal.equals(Either.right('-224'))
					)
				).toBe(true);
			});
		});
	});
});
