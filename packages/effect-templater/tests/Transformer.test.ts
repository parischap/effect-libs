/* eslint-disable functional/no-expression-statements */
import { MBrand } from '@parischap/effect-lib';
import { Transformer } from '@parischap/effect-templater';
import { Either, Function, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Transformer', () => {
	const readTester =
		<A>(transformer: Transformer.Type<A>) =>
		(input: string): boolean | readonly [value: A, rest: string] =>
			pipe(
				input,
				transformer.read,
				Either.match({ onLeft: () => false, onRight: Function.identity })
			);

	const writeTester =
		<A>(transformer: Transformer.Type<A>) =>
		(input: A): boolean | string =>
			pipe(
				input,
				transformer.write,
				Either.match({ onLeft: () => false, onRight: Function.identity })
			);

	describe('String', () => {
		const stringReadTester = readTester(Transformer.String.any);
		it('Reading', () => {
			expect(stringReadTester('foo and bar')).toStrictEqual(['foo and bar', '']);
		});

		const stringWriteTester = writeTester(Transformer.String.any);
		it('Writing', () => {
			expect(stringWriteTester('foo and bar')).toBe('foo and bar');
		});
	});

	describe('Bases', () => {
		describe('binary', () => {
			const binaryReadTester = readTester(Transformer.Bases.binary);
			describe('Reading', () => {
				it('string not representing a binary number', () => {
					expect(binaryReadTester(' 11foo')).toBe(false);
				});

				it('string with binary number at start', () => {
					expect(binaryReadTester('00118foo')).toStrictEqual([3, '8foo']);
				});
			});

			const binaryWriteTester = writeTester(Transformer.Bases.binary);
			it('Writing', () => {
				expect(pipe(15, MBrand.PositiveInt.fromNumber, binaryWriteTester)).toBe('1111');
			});
		});

		describe('octal', () => {
			const octalReadTester = readTester(Transformer.Bases.octal);
			describe('Reading', () => {
				it('string not representing an octal number', () => {
					expect(octalReadTester(' 16foo')).toBe(false);
				});

				it('string with octal number at start', () => {
					expect(octalReadTester('168foo')).toStrictEqual([14, '8foo']);
				});
			});

			const octalWriteTester = writeTester(Transformer.Bases.octal);
			it('Writing', () => {
				expect(pipe(14, MBrand.PositiveInt.fromNumber, octalWriteTester)).toBe('16');
			});
		});

		describe('hexadecimal', () => {
			const hexadecimalReadTester = readTester(Transformer.Bases.hexadecimal);
			describe('Reading', () => {
				it('string not representing a hexadecimal number', () => {
					expect(hexadecimalReadTester(' foo')).toBe(false);
				});

				it('string with hexadecimal number at start', () => {
					expect(hexadecimalReadTester('Ffoo')).toStrictEqual([255, 'oo']);
				});
			});

			const hexadecimalWriteTester = writeTester(Transformer.Bases.hexadecimal);
			it('Writing', () => {
				expect(pipe(16, MBrand.PositiveInt.fromNumber, hexadecimalWriteTester)).toBe('10');
			});
		});
	});

	describe('Real', () => {
		describe('Options', () => {
			describe('floatingPoint', () => {
				const tester = Transformer.Real.Options.toTester(Transformer.Real.Options.floatingPoint);

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
						expect(tester('1001.')).toBe(false);
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
				const tester = Transformer.Real.Options.toTester(Transformer.Real.Options.ukFloatingPoint);

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

					it('With misplaced thousands separator', () => {
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
				const tester = Transformer.Real.Options.toTester(
					Transformer.Real.Options.germanFloatingPoint
				);

				describe('Reading', () => {
					it('Any floating point', () => {
						expect(tester('1.001.001,1001')).toBe(true);
					});
				});
			});

			describe('scientificNotation', () => {
				const tester = Transformer.Real.Options.toTester(
					Transformer.Real.Options.scientificNotation
				);

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
						expect(tester('0.00')).toBe(false);
					});

					it('With fractional significand', () => {
						expect(tester('.13e10')).toBe(false);
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
					const tester = Transformer.Real.Options.toTester(
						Transformer.Real.Options.frenchFloatingPoint2
					);

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
					const tester = Transformer.Real.Options.toTester(Transformer.Real.Options.frenchInt);

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
					const tester = Transformer.Real.Options.toTester(
						Transformer.Real.Options.unsignedFrenchInt
					);

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
					const tester = Transformer.Real.Options.toTester(
						Transformer.Real.Options.signedFrenchInt
					);

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
					const tester = Transformer.Real.Options.toTester(
						Transformer.Real.Options.plussedFrenchInt
					);

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

		describe('floatingPoint', () => {
			const floatingPointReadTester = readTester(Transformer.Real.floatingPoint);
			describe('Reading', () => {
				it('Empty string', () => {
					expect(floatingPointReadTester('')).toBe(false);
				});

				it('One space string', () => {
					expect(floatingPointReadTester(' foo')).toBe(false);
				});

				it('With upfront 0', () => {
					expect(floatingPointReadTester('01.1foo')).toStrictEqual([0, '1.1foo']);
				});

				it('With upfront space', () => {
					expect(floatingPointReadTester(' 1.1foo')).toBe(false);
				});

				it('Any positive number', () => {
					expect(floatingPointReadTester('1000348.3456foo')).toStrictEqual([1_000_348.3456, 'foo']);
				});

				it('Any negative number', () => {
					expect(floatingPointReadTester('-.3foo')).toStrictEqual([-0.3, 'foo']);
				});
			});

			const floatingPointWriteTester = writeTester(Transformer.Real.floatingPoint);
			describe('Writing', () => {
				it('Any positive number', () => {
					expect(pipe(10_034_538.76, MBrand.Real.fromNumber, floatingPointWriteTester)).toBe(
						'10034538.76'
					);
				});

				it('Any negative number', () => {
					expect(pipe(-1_740.7654, MBrand.Real.fromNumber, floatingPointWriteTester)).toBe(
						'-1740.7654'
					);
				});

				it('Any integer', () => {
					expect(pipe(-8, MBrand.Real.fromNumber, floatingPointWriteTester)).toBe('-8');
				});

				it('Any fractional number', () => {
					expect(pipe(0.34, MBrand.Real.fromNumber, floatingPointWriteTester)).toBe('0.34');
				});
			});
		});

		describe('ukFloatingPoint', () => {
			const ukFloatingPointReadTester = readTester(Transformer.Real.ukFloatingPoint);
			describe('Reading', () => {
				it('Any positive number', () => {
					expect(ukFloatingPointReadTester('1,000,348.3456foo')).toStrictEqual([
						1_000_348.3456,
						'foo'
					]);
				});

				it('Any negative number', () => {
					expect(ukFloatingPointReadTester('-10.3foo')).toStrictEqual([-10.3, 'foo']);
				});
			});

			const ukFloatingPointWriteTester = writeTester(Transformer.Real.ukFloatingPoint);
			describe('Writing', () => {
				it('Any positive number', () => {
					expect(pipe(10_034_538.7654, MBrand.Real.fromNumber, ukFloatingPointWriteTester)).toBe(
						'10,034,538.7654'
					);
				});

				it('Any negative number', () => {
					expect(pipe(-18.7654, MBrand.Real.fromNumber, ukFloatingPointWriteTester)).toBe(
						'-18.7654'
					);
				});
			});
		});

		describe('ukFloatingPoint2', () => {
			const ukFloatingPoint2ReadTester = readTester(Transformer.Real.ukFloatingPoint2);
			describe('Reading', () => {
				it('Number with one fractional digit', () => {
					expect(ukFloatingPoint2ReadTester('10.3foo')).toBe(false);
				});

				it('Any positive number with 2 fractional digits', () => {
					expect(ukFloatingPoint2ReadTester('10.30foo')).toStrictEqual([10.3, 'foo']);
				});

				it('Number with three fractional digits', () => {
					expect(ukFloatingPoint2ReadTester('-10.321foo')).toStrictEqual([-10.32, '1foo']);
				});
			});

			const ukFloatingPoint2WriteTester = writeTester(Transformer.Real.ukFloatingPoint2);
			describe('Writing', () => {
				it('Any integer', () => {
					expect(pipe(10_034_538, MBrand.Real.fromNumber, ukFloatingPoint2WriteTester)).toBe(
						'10,034,538.00'
					);
				});

				it('Any number with one fractional digit', () => {
					expect(pipe(-1_740.7, MBrand.Real.fromNumber, ukFloatingPoint2WriteTester)).toBe(
						'-1,740.70'
					);
				});

				it('Any number with two fractional digits', () => {
					expect(pipe(18.73, MBrand.Real.fromNumber, ukFloatingPoint2WriteTester)).toBe('18.73');
				});

				it('Any number with three fractional digits round down', () => {
					expect(
						pipe(18_740_543_323.344, MBrand.Real.fromNumber, ukFloatingPoint2WriteTester)
					).toBe('18,740,543,323.34');
				});

				it('Any number with three fractional digits round up', () => {
					expect(pipe(-194.455, MBrand.Real.fromNumber, ukFloatingPoint2WriteTester)).toBe(
						'-194.46'
					);
				});
			});
		});

		describe('frenchScientificNotation', () => {
			const frenchScientificNotationReadTester = readTester(
				Transformer.Real.frenchScientificNotation
			);
			describe('Reading', () => {
				it('Number greater than 10', () => {
					expect(frenchScientificNotationReadTester('10,3foo')).toStrictEqual([1, '0,3foo']);
				});

				it('Positive number without exponent', () => {
					expect(frenchScientificNotationReadTester('9,30foo')).toStrictEqual([9.3, 'foo']);
				});

				it('Negative number with positive exponent', () => {
					expect(frenchScientificNotationReadTester('-5,234e3foo')).toStrictEqual([-5_234, 'foo']);
				});

				it('Positive number with negative exponent', () => {
					expect(frenchScientificNotationReadTester('5,234e-3foo')).toStrictEqual([
						0.005234,
						'foo'
					]);
				});
			});

			const frenchScientificNotationWriteTester = writeTester(
				Transformer.Real.frenchScientificNotation
			);
			describe('Writing', () => {
				it('Any integer', () => {
					expect(pipe(0, MBrand.Real.fromNumber, frenchScientificNotationWriteTester)).toBe(false);
				});

				it('Any positive integer', () => {
					expect(
						pipe(10_034_538, MBrand.Real.fromNumber, frenchScientificNotationWriteTester)
					).toBe('1,0035e7');
				});

				it('Any negative integer', () => {
					expect(pipe(-0.0443, MBrand.Real.fromNumber, frenchScientificNotationWriteTester)).toBe(
						'-4,43e-2'
					);
				});
			});
		});

		describe('germanFractional', () => {
			const germanFractionalReadTester = readTester(Transformer.Real.germanFractional);
			describe('Reading', () => {
				it('Number with decimal part', () => {
					expect(germanFractionalReadTester('10,3foo')).toBe(false);
				});

				it('Positive number', () => {
					expect(germanFractionalReadTester(',3230foo')).toStrictEqual([0.323, 'foo']);
				});

				it('Negative number with exponent', () => {
					expect(germanFractionalReadTester('-,234e3foo')).toStrictEqual([-0.234, 'e3foo']);
				});
			});

			const germanFractionalWriteTester = writeTester(Transformer.Real.germanFractional);
			describe('Writing', () => {
				it('0', () => {
					expect(pipe(0, MBrand.Real.fromNumber, germanFractionalWriteTester)).toBe('0');
				});

				it('Any integer', () => {
					expect(pipe(8, MBrand.Real.fromNumber, germanFractionalWriteTester)).toBe(false);
				});

				it('Any fractional number', () => {
					expect(pipe(-0.443, MBrand.Real.fromNumber, germanFractionalWriteTester)).toBe('-0,443');
				});
			});
		});

		describe('ukInt', () => {
			const ukIntReadTester = readTester(Transformer.Real.ukInt);
			describe('Reading', () => {
				it('Positive integer', () => {
					expect(ukIntReadTester('10foo')).toStrictEqual([10, 'foo']);
				});

				it('Negative fractional number', () => {
					expect(ukIntReadTester('-10.3foo')).toStrictEqual([-10, '.3foo']);
				});
			});

			const ukIntWriteTester = writeTester(Transformer.Real.ukInt);
			describe('Writing', () => {
				it('0', () => {
					expect(pipe(0, MBrand.Int.fromNumber, ukIntWriteTester)).toBe('0');
				});

				it('Positive number', () => {
					expect(pipe(1048, MBrand.Int.fromNumber, ukIntWriteTester)).toBe('1,048');
				});

				it('Negative number', () => {
					expect(pipe(-224, MBrand.Int.fromNumber, ukIntWriteTester)).toBe('-224');
				});
			});
		});

		describe('unsignedUkInt', () => {
			const unsignedUkIntReadTester = readTester(Transformer.Real.unsignedUkInt);
			describe('Reading', () => {
				it('Positive integer', () => {
					expect(unsignedUkIntReadTester('10foo')).toStrictEqual([10, 'foo']);
				});

				it('Negative fractional number', () => {
					expect(unsignedUkIntReadTester('-10.3foo')).toBe(false);
				});
			});

			const unsignedUkIntWriteTester = writeTester(Transformer.Real.unsignedUkInt);
			describe('Writing', () => {
				it('0', () => {
					expect(pipe(0, MBrand.PositiveInt.fromNumber, unsignedUkIntWriteTester)).toBe('0');
				});

				it('Positive number', () => {
					expect(pipe(1048, MBrand.PositiveInt.fromNumber, unsignedUkIntWriteTester)).toBe('1,048');
				});
			});
		});

		describe('signedUkInt', () => {
			const signedUkIntReadTester = readTester(Transformer.Real.signedUkInt);
			describe('Reading', () => {
				it('Positive integer without sign', () => {
					expect(signedUkIntReadTester('10foo')).toBe(false);
				});

				it('Positive integer with sign', () => {
					expect(signedUkIntReadTester('+10foo')).toStrictEqual([10, 'foo']);
				});

				it('Negative integer', () => {
					expect(signedUkIntReadTester('-10.3foo')).toStrictEqual([-10, '.3foo']);
				});
			});

			const signedUkIntWriteTester = writeTester(Transformer.Real.signedUkInt);
			describe('Writing', () => {
				it('0', () => {
					expect(pipe(0, MBrand.Int.fromNumber, signedUkIntWriteTester)).toBe('+0');
				});

				it('Positive number', () => {
					expect(pipe(1048, MBrand.Int.fromNumber, signedUkIntWriteTester)).toBe('+1,048');
				});

				it('Negative number', () => {
					expect(pipe(-224, MBrand.Int.fromNumber, signedUkIntWriteTester)).toBe('-224');
				});
			});
		});

		describe('plussedUkInt', () => {
			const plussedUkIntReadTester = readTester(Transformer.Real.plussedUkInt);
			describe('Reading', () => {
				it('Positive integer without sign', () => {
					expect(plussedUkIntReadTester('10foo')).toStrictEqual([10, 'foo']);
				});

				it('Positive integer with sign', () => {
					expect(plussedUkIntReadTester('+10foo')).toStrictEqual([10, 'foo']);
				});

				it('Negative integer', () => {
					expect(plussedUkIntReadTester('-10.3foo')).toStrictEqual([-10, '.3foo']);
				});
			});

			const plussedUkIntWriteTester = writeTester(Transformer.Real.plussedUkInt);
			describe('Writing', () => {
				it('0', () => {
					expect(pipe(0, MBrand.Int.fromNumber, plussedUkIntWriteTester)).toBe('0');
				});

				it('Positive number', () => {
					expect(pipe(1048, MBrand.Int.fromNumber, plussedUkIntWriteTester)).toBe('1,048');
				});

				it('Negative number', () => {
					expect(pipe(-224, MBrand.Int.fromNumber, plussedUkIntWriteTester)).toBe('-224');
				});
			});
		});
	});
});
