/* eslint-disable functional/no-expression-statements */
import { MBrand } from '@parischap/effect-lib';
import { Transformer } from '@parischap/templater';
import { Either, Function, HashMap, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Transformer', () => {
	const readTesterMaker =
		<A>(transformer: Transformer.Type<A>) =>
		(input: string): boolean | readonly [value: A, rest: string] =>
			pipe(
				input,
				transformer.read,
				Either.match({ onLeft: () => false, onRight: Function.identity })
			);

	const writeTesterMaker =
		<A>(transformer: Transformer.Type<A>) =>
		(input: A): boolean | string =>
			pipe(
				input,
				transformer.write,
				Either.match({ onLeft: () => false, onRight: Function.identity })
			);

	describe('mapped case sensitive', () => {
		const map = HashMap.make(['am', 0], ['Pm', 12]);
		const transformer = Transformer.mapped(map, 'am/pm', true);
		const readTester = readTesterMaker(transformer);
		describe('Reading', () => {
			it('Empty string', () => {
				expect(readTester('')).toBe(false);
			});

			it('Non matching string', () => {
				expect(readTester('foo')).toBe(false);
			});

			it('Matching string bad case', () => {
				expect(readTester('pmfoo')).toBe(false);
			});

			it('Matching string', () => {
				expect(readTester('Pmfoo')).toStrictEqual([12, 'foo']);
			});
		});

		const writeTester = writeTesterMaker(transformer);
		describe('Writing', () => {
			it('Element of right type not in map', () => {
				expect(writeTester(1)).toBe(false);
			});

			it('Element of right type in map', () => {
				expect(writeTester(12)).toBe('Pm');
			});
		});
	});

	describe('mapped case insensitive', () => {
		const map = HashMap.make(['am', 0], ['Pm', 12]);
		const transformer = Transformer.mapped(map, 'am/pm', false);
		const readTester = readTesterMaker(transformer);
		describe('Reading', () => {
			it('Empty string', () => {
				expect(readTester('')).toBe(false);
			});

			it('Non matching string', () => {
				expect(readTester('foo')).toBe(false);
			});

			it('Matching string bad case', () => {
				expect(readTester('pmfoo')).toStrictEqual([12, 'foo']);
			});

			it('Matching string', () => {
				expect(readTester('Pmfoo')).toStrictEqual([12, 'foo']);
			});
		});

		const writeTester = writeTesterMaker(transformer);
		describe('Writing', () => {
			it('Element of right type not in map', () => {
				expect(writeTester(1)).toBe(false);
			});

			it('Element of right type in map', () => {
				expect(writeTester(12)).toBe('pm');
			});
		});
	});

	describe('String', () => {
		describe('rest', () => {
			const readTester = readTesterMaker(Transformer.String.rest);
			it('Reading', () => {
				expect(readTester('foo and bar')).toStrictEqual(['foo and bar', '']);
			});

			const writeTester = writeTesterMaker(Transformer.String.rest);
			it('Writing', () => {
				expect(writeTester('foo and bar')).toBe('foo and bar');
			});
		});

		describe('fixedLength', () => {
			describe('4 characters without padding', () => {
				const transformer = Transformer.String.fixedLength(4, '');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						expect(readTester('foo')).toBe(false);
					});
					it('Input 4 characters long', () => {
						expect(readTester('foot')).toStrictEqual(['foot', '']);
					});
					it('Input more than 4 characters long', () => {
						expect(readTester('foo and bar')).toStrictEqual(['foo ', 'and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						expect(writeTester('foo')).toBe(false);
					});
					it('Input 4 characters long', () => {
						expect(writeTester('foot')).toBe('foot');
					});
					it('Input more than 4 characters long', () => {
						expect(writeTester('foo and bar')).toBe(false);
					});
				});
			});

			describe('4 characters with left padding', () => {
				const transformer = Transformer.String.fixedLength(4, ' ');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						expect(readTester('foo')).toBe(false);
					});
					it('Input 4 characters long without padding', () => {
						expect(readTester('foot')).toStrictEqual(['foot', '']);
					});
					it('Input more than 4 characters long with padding', () => {
						expect(readTester('  foo and bar')).toStrictEqual(['fo', 'o and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						expect(writeTester('foo')).toBe(' foo');
					});
					it('Input 4 characters long', () => {
						expect(writeTester('foot')).toBe('foot');
					});
					it('Input more than 4 characters long', () => {
						expect(writeTester('foo and bar')).toBe(false);
					});
				});
			});

			describe('4 characters with right padding', () => {
				const transformer = Transformer.String.fixedLength(4, '', ' ');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						expect(readTester('foo')).toBe(false);
					});
					it('Input 4 characters long without padding', () => {
						expect(readTester('foot')).toStrictEqual(['foot', '']);
					});
					it('Input more than 4 characters long with padding', () => {
						expect(readTester('foo and bar')).toStrictEqual(['foo', 'and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						expect(writeTester('foo')).toBe('foo ');
					});
					it('Input 4 characters long', () => {
						expect(writeTester('foot')).toBe('foot');
					});
					it('Input more than 4 characters long', () => {
						expect(writeTester('foo and bar')).toBe(false);
					});
				});
			});

			describe('4 characters with left and right padding', () => {
				const transformer = Transformer.String.fixedLength(4, ' ', ' ');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						expect(readTester('foo')).toBe(false);
					});
					it('Input 4 characters long without padding', () => {
						expect(readTester('foot')).toStrictEqual(['foot', '']);
					});
					it('Input more than 4 characters long with padding', () => {
						expect(readTester(' fo and bar')).toStrictEqual(['fo', 'and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						expect(writeTester('foo')).toBe(' foo');
					});
					it('Input 4 characters long', () => {
						expect(writeTester('foot')).toBe('foot');
					});
					it('Input more than 4 characters long', () => {
						expect(writeTester('foo and bar')).toBe(false);
					});
				});
			});
		});
	});

	describe('Number', () => {
		describe('Option', () => {
			describe('Real', () => {
				describe('standard', () => {
					const tester = Transformer.Number.Option.toTester(
						Transformer.Number.Option.Real.standard
					);

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

				describe('uk', () => {
					const tester = Transformer.Number.Option.toTester(Transformer.Number.Option.Real.uk);

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

				describe('german', () => {
					const tester = Transformer.Number.Option.toTester(Transformer.Number.Option.Real.german);

					describe('Reading', () => {
						it('Any floating point', () => {
							expect(tester('1.001.001,1001')).toBe(true);
						});
					});
				});

				describe('scientific', () => {
					const tester = Transformer.Number.Option.toTester(
						Transformer.Number.Option.Real.scientific
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

					describe('french2FractionalDigits', () => {
						const tester = Transformer.Number.Option.toTester(
							Transformer.Number.Option.Real.french2FractionalDigits
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
				});
			});

			describe('Int', () => {
				describe('french', () => {
					const tester = Transformer.Number.Option.toTester(Transformer.Number.Option.Int.french);

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

				describe('signedFrench', () => {
					const tester = Transformer.Number.Option.toTester(
						Transformer.Number.Option.Int.signedFrench
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

				describe('plussedFrench', () => {
					const tester = Transformer.Number.Option.toTester(
						Transformer.Number.Option.Int.plussedFrench
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

			describe('PositiveInt', () => {
				describe('french', () => {
					const tester = Transformer.Number.Option.toTester(
						Transformer.Number.Option.PositiveInt.french
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
			});
		});

		describe('Real', () => {
			describe('standard', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.standard);
				describe('Reading', () => {
					it('Empty string', () => {
						expect(readTester('')).toBe(false);
					});

					it('One space string', () => {
						expect(readTester(' foo')).toBe(false);
					});

					it('With upfront 0', () => {
						expect(readTester('01.1foo')).toStrictEqual([0, '1.1foo']);
					});

					it('With upfront space', () => {
						expect(readTester(' 1.1foo')).toBe(false);
					});

					it('Any positive number', () => {
						expect(readTester('1000348.3456foo')).toStrictEqual([1_000_348.3456, 'foo']);
					});

					it('Any negative number', () => {
						expect(readTester('-.3foo')).toStrictEqual([-0.3, 'foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.standard);
				describe('Writing', () => {
					it('Any positive number', () => {
						expect(pipe(10_034_538.76, MBrand.Real.fromNumber, writeTester)).toBe('10034538.76');
					});

					it('Any negative number', () => {
						expect(pipe(-1_740.7654, MBrand.Real.fromNumber, writeTester)).toBe('-1740.7654');
					});

					it('Any integer', () => {
						expect(pipe(-8, MBrand.Real.fromNumber, writeTester)).toBe('-8');
					});

					it('Any fractional number', () => {
						expect(pipe(0.34, MBrand.Real.fromNumber, writeTester)).toBe('0.34');
					});
				});
			});

			describe('uk', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.uk);
				describe('Reading', () => {
					it('Any positive number', () => {
						expect(readTester('1,000,348.3456foo')).toStrictEqual([1_000_348.3456, 'foo']);
					});

					it('Any negative number', () => {
						expect(readTester('-10.3foo')).toStrictEqual([-10.3, 'foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.uk);
				describe('Writing', () => {
					it('Any positive number', () => {
						expect(pipe(10_034_538.7654, MBrand.Real.fromNumber, writeTester)).toBe(
							'10,034,538.7654'
						);
					});

					it('Any negative number', () => {
						expect(pipe(-18.7654, MBrand.Real.fromNumber, writeTester)).toBe('-18.7654');
					});
				});
			});

			describe('uk2FractionalDigits', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.uk2FractionalDigits);
				describe('Reading', () => {
					it('Number with one fractional digit', () => {
						expect(readTester('10.3foo')).toBe(false);
					});

					it('Any positive number with 2 fractional digits', () => {
						expect(readTester('10.30foo')).toStrictEqual([10.3, 'foo']);
					});

					it('Number with three fractional digits', () => {
						expect(readTester('-10.321foo')).toStrictEqual([-10.32, '1foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.uk2FractionalDigits);
				describe('Writing', () => {
					it('Any integer', () => {
						expect(pipe(10_034_538, MBrand.Real.fromNumber, writeTester)).toBe('10,034,538.00');
					});

					it('Any number with one fractional digit', () => {
						expect(pipe(-1_740.7, MBrand.Real.fromNumber, writeTester)).toBe('-1,740.70');
					});

					it('Any number with two fractional digits', () => {
						expect(pipe(18.73, MBrand.Real.fromNumber, writeTester)).toBe('18.73');
					});

					it('Any number with three fractional digits round down', () => {
						expect(pipe(18_740_543_323.344, MBrand.Real.fromNumber, writeTester)).toBe(
							'18,740,543,323.34'
						);
					});

					it('Any number with three fractional digits round up', () => {
						expect(pipe(-194.455, MBrand.Real.fromNumber, writeTester)).toBe('-194.46');
					});
				});
			});

			describe('frenchScientific', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.frenchScientific);
				describe('Reading', () => {
					it('Number greater than 10', () => {
						expect(readTester('10,3foo')).toStrictEqual([1, '0,3foo']);
					});

					it('Positive number without exponent', () => {
						expect(readTester('9,30foo')).toStrictEqual([9.3, 'foo']);
					});

					it('Negative number with positive exponent', () => {
						expect(readTester('-5,234e3foo')).toStrictEqual([-5_234, 'foo']);
					});

					it('Positive number with negative exponent', () => {
						expect(readTester('5,234e-3foo')).toStrictEqual([0.005234, 'foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.frenchScientific);
				describe('Writing', () => {
					it('Any integer', () => {
						expect(pipe(0, MBrand.Real.fromNumber, writeTester)).toBe(false);
					});

					it('Any positive integer', () => {
						expect(pipe(10_034_538, MBrand.Real.fromNumber, writeTester)).toBe('1,0035e7');
					});

					it('Any negative integer', () => {
						expect(pipe(-0.0443, MBrand.Real.fromNumber, writeTester)).toBe('-4,43e-2');
					});
				});
			});

			describe('germanFractional', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.germanFractional);
				describe('Reading', () => {
					it('Number with decimal part', () => {
						expect(readTester('10,3foo')).toBe(false);
					});

					it('Positive number', () => {
						expect(readTester(',3230foo')).toStrictEqual([0.323, 'foo']);
					});

					it('Negative number with exponent', () => {
						expect(readTester('-,234e3foo')).toStrictEqual([-0.234, 'e3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.germanFractional);
				describe('Writing', () => {
					it('0', () => {
						expect(pipe(0, MBrand.Real.fromNumber, writeTester)).toBe('0');
					});

					it('Any integer', () => {
						expect(pipe(8, MBrand.Real.fromNumber, writeTester)).toBe(false);
					});

					it('Any fractional number', () => {
						expect(pipe(-0.443, MBrand.Real.fromNumber, writeTester)).toBe('-0,443');
					});
				});
			});
		});

		describe('Int', () => {
			describe('uk', () => {
				const readTester = readTesterMaker(Transformer.Number.Int.uk);
				describe('Reading', () => {
					it('Positive integer', () => {
						expect(readTester('10foo')).toStrictEqual([10, 'foo']);
					});

					it('Negative fractional number', () => {
						expect(readTester('-10.3foo')).toStrictEqual([-10, '.3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Int.uk);
				describe('Writing', () => {
					it('0', () => {
						expect(pipe(0, MBrand.Int.fromNumber, writeTester)).toBe('0');
					});

					it('Positive number', () => {
						expect(pipe(1048, MBrand.Int.fromNumber, writeTester)).toBe('1,048');
					});

					it('Negative number', () => {
						expect(pipe(-224, MBrand.Int.fromNumber, writeTester)).toBe('-224');
					});
				});
			});

			describe('signedUk', () => {
				const readTester = readTesterMaker(Transformer.Number.Int.signedUk);
				describe('Reading', () => {
					it('Positive integer without sign', () => {
						expect(readTester('10foo')).toBe(false);
					});

					it('Positive integer with sign', () => {
						expect(readTester('+10foo')).toStrictEqual([10, 'foo']);
					});

					it('Negative integer', () => {
						expect(readTester('-10.3foo')).toStrictEqual([-10, '.3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Int.signedUk);
				describe('Writing', () => {
					it('0', () => {
						expect(pipe(0, MBrand.Int.fromNumber, writeTester)).toBe('+0');
					});

					it('Positive number', () => {
						expect(pipe(1048, MBrand.Int.fromNumber, writeTester)).toBe('+1,048');
					});

					it('Negative number', () => {
						expect(pipe(-224, MBrand.Int.fromNumber, writeTester)).toBe('-224');
					});
				});
			});

			describe('plussedUk', () => {
				const readTester = readTesterMaker(Transformer.Number.Int.plussedUk);
				describe('Reading', () => {
					it('Positive integer without sign', () => {
						expect(readTester('10foo')).toStrictEqual([10, 'foo']);
					});

					it('Positive integer with sign', () => {
						expect(readTester('+10foo')).toStrictEqual([10, 'foo']);
					});

					it('Negative integer', () => {
						expect(readTester('-10.3foo')).toStrictEqual([-10, '.3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Int.plussedUk);
				describe('Writing', () => {
					it('0', () => {
						expect(pipe(0, MBrand.Int.fromNumber, writeTester)).toBe('0');
					});

					it('Positive number', () => {
						expect(pipe(1048, MBrand.Int.fromNumber, writeTester)).toBe('1,048');
					});

					it('Negative number', () => {
						expect(pipe(-224, MBrand.Int.fromNumber, writeTester)).toBe('-224');
					});
				});
			});
		});

		describe('PositiveInt', () => {
			describe('binary', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.binary);
				describe('Reading', () => {
					it('string not representing a binary number', () => {
						expect(readTester(' 11foo')).toBe(false);
					});

					it('string with binary number at start', () => {
						expect(readTester('00118foo')).toStrictEqual([3, '8foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.binary);
				it('Writing', () => {
					expect(pipe(15, MBrand.PositiveInt.fromNumber, writeTester)).toBe('1111');
				});
			});

			describe('octal', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.octal);
				describe('Reading', () => {
					it('string not representing an octal number', () => {
						expect(readTester(' 16foo')).toBe(false);
					});

					it('string with octal number at start', () => {
						expect(readTester('168foo')).toStrictEqual([14, '8foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.octal);
				it('Writing', () => {
					expect(pipe(14, MBrand.PositiveInt.fromNumber, writeTester)).toBe('16');
				});
			});

			describe('hexadecimal', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.hexadecimal);
				describe('Reading', () => {
					it('string not representing a hexadecimal number', () => {
						expect(readTester(' foo')).toBe(false);
					});

					it('string with hexadecimal number at start', () => {
						expect(readTester('Ffoo')).toStrictEqual([255, 'oo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.hexadecimal);
				it('Writing', () => {
					expect(pipe(16, MBrand.PositiveInt.fromNumber, writeTester)).toBe('10');
				});
			});

			describe('uk', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.uk);
				describe('Reading', () => {
					it('Positive integer', () => {
						expect(readTester('10foo')).toStrictEqual([10, 'foo']);
					});

					it('Negative fractional number', () => {
						expect(readTester('-10.3foo')).toBe(false);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.uk);
				describe('Writing', () => {
					it('0', () => {
						expect(pipe(0, MBrand.PositiveInt.fromNumber, writeTester)).toBe('0');
					});

					it('Positive number', () => {
						expect(pipe(1048, MBrand.PositiveInt.fromNumber, writeTester)).toBe('1,048');
					});
				});
			});
		});
	});
});
