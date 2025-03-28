/* eslint-disable functional/no-expression-statements */
import { MBrand } from '@parischap/effect-lib';
import { Transformer } from '@parischap/templater';
import { Either, Function, HashMap, pipe } from 'effect';
import { describe, it } from 'vitest';

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
				TEUtils.assertFalse(readTester(''));
			});

			it('Non matching string', () => {
				TEUtils.assertFalse(readTester('foo'));
			});

			it('Matching string bad case', () => {
				TEUtils.assertFalse(readTester('pmfoo'));
			});

			it('Matching string', () => {
				TEUtils.deepStrictEqual(readTester('Pmfoo'),[12, 'foo']);
			});
		});

		const writeTester = writeTesterMaker(transformer);
		describe('Writing', () => {
			it('Element of right type not in map', () => {
				TEUtils.assertFalse(writeTester(1));
			});

			it('Element of right type in map', () => {
				TEUtils.strictEqual(writeTester(12),'Pm');
			});
		});
	});

	describe('mapped case insensitive', () => {
		const map = HashMap.make(['am', 0], ['Pm', 12]);
		const transformer = Transformer.mapped(map, 'am/pm', false);
		const readTester = readTesterMaker(transformer);
		describe('Reading', () => {
			it('Empty string', () => {
				TEUtils.assertFalse(readTester(''));
			});

			it('Non matching string', () => {
				TEUtils.assertFalse(readTester('foo'));
			});

			it('Matching string bad case', () => {
				TEUtils.deepStrictEqual(readTester('pmfoo'),[12, 'foo']);
			});

			it('Matching string', () => {
				TEUtils.deepStrictEqual(readTester('Pmfoo'),[12, 'foo']);
			});
		});

		const writeTester = writeTesterMaker(transformer);
		describe('Writing', () => {
			it('Element of right type not in map', () => {
				TEUtils.assertFalse(writeTester(1));
			});

			it('Element of right type in map', () => {
				TEUtils.strictEqual(writeTester(12),'pm');
			});
		});
	});

	describe('String', () => {
		describe('rest', () => {
			const readTester = readTesterMaker(Transformer.String.rest);
			it('Reading', () => {
				TEUtils.deepStrictEqual(readTester('foo and bar'),['foo and bar', '']);
			});

			const writeTester = writeTesterMaker(Transformer.String.rest);
			it('Writing', () => {
				TEUtils.strictEqual(writeTester('foo and bar'),'foo and bar');
			});
		});

		describe('fixedLength', () => {
			describe('4 characters without padding', () => {
				const transformer = Transformer.String.fixedLength(4, '');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.assertFalse(readTester('foo'));
					});
					it('Input 4 characters long', () => {
						TEUtils.deepStrictEqual(readTester('foot'),['foot', '']);
					});
					it('Input more than 4 characters long', () => {
						TEUtils.deepStrictEqual(readTester('foo and bar'),['foo ', 'and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.assertFalse(writeTester('foo'));
					});
					it('Input 4 characters long', () => {
						TEUtils.strictEqual(writeTester('foot'),'foot');
					});
					it('Input more than 4 characters long', () => {
						TEUtils.assertFalse(writeTester('foo and bar'));
					});
				});
			});

			describe('4 characters with left padding', () => {
				const transformer = Transformer.String.fixedLength(4, ' ');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.assertFalse(readTester('foo'));
					});
					it('Input 4 characters long without padding', () => {
						TEUtils.deepStrictEqual(readTester('foot'),['foot', '']);
					});
					it('Input more than 4 characters long with padding', () => {
						TEUtils.deepStrictEqual(readTester('  foo and bar'),['fo', 'o and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.strictEqual(writeTester('foo'),' foo');
					});
					it('Input 4 characters long', () => {
						TEUtils.strictEqual(writeTester('foot'),'foot');
					});
					it('Input more than 4 characters long', () => {
						TEUtils.assertFalse(writeTester('foo and bar'));
					});
				});
			});

			describe('4 characters with right padding', () => {
				const transformer = Transformer.String.fixedLength(4, '', ' ');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.assertFalse(readTester('foo'));
					});
					it('Input 4 characters long without padding', () => {
						TEUtils.deepStrictEqual(readTester('foot'),['foot', '']);
					});
					it('Input more than 4 characters long with padding', () => {
						TEUtils.deepStrictEqual(readTester('foo and bar'),['foo', 'and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.strictEqual(writeTester('foo'),'foo ');
					});
					it('Input 4 characters long', () => {
						TEUtils.strictEqual(writeTester('foot'),'foot');
					});
					it('Input more than 4 characters long', () => {
						TEUtils.assertFalse(writeTester('foo and bar'));
					});
				});
			});

			describe('4 characters with left and right padding', () => {
				const transformer = Transformer.String.fixedLength(4, ' ', ' ');
				const readTester = readTesterMaker(transformer);
				describe('Reading', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.assertFalse(readTester('foo'));
					});
					it('Input 4 characters long without padding', () => {
						TEUtils.deepStrictEqual(readTester('foot'),['foot', '']);
					});
					it('Input more than 4 characters long with padding', () => {
						TEUtils.deepStrictEqual(readTester(' fo and bar'),['fo', 'and bar']);
					});
				});

				const writeTester = writeTesterMaker(transformer);
				describe('Writing', () => {
					it('Input less than 4 characters long', () => {
						TEUtils.strictEqual(writeTester('foo'),' foo');
					});
					it('Input 4 characters long', () => {
						TEUtils.strictEqual(writeTester('foot'),'foot');
					});
					it('Input more than 4 characters long', () => {
						TEUtils.assertFalse(writeTester('foo and bar'));
					});
				});
			});
		});
	});

	describe('Number', () => {
		describe('Options', () => {
			describe('Real', () => {
				describe('standard', () => {
					const tester = Transformer.Number.Options.toTester(
						Transformer.Number.Options.Real.standard
					);

					describe('Reading', () => {
						it('Empty string', () => {
							TEUtils.assertFalse(tester(''));
						});

						it('One space string', () => {
							TEUtils.assertFalse(tester(' '));
						});

						it('With upfront 0', () => {
							TEUtils.assertFalse(tester('01.1'));
						});

						it('With upfront space', () => {
							TEUtils.assertFalse(tester(' 1.1'));
						});

						it('With comma in the decimal part', () => {
							TEUtils.assertFalse(tester('1,001.1'));
						});

						it('With fractional separator but without fractional part', () => {
							TEUtils.assertFalse(tester('1001.'));
						});

						it('With thousand sep in the fractional part', () => {
							TEUtils.assertFalse(tester('1001.100,1'));
						});

						it('With two fractional separators', () => {
							TEUtils.assertFalse(tester('1.001.1'));
						});

						it('0', () => {
							TEUtils.assertTrue(tester('0'));
						});

						it('Any integer', () => {
							TEUtils.assertTrue(tester('1001'));
						});

						it('Any floating point', () => {
							TEUtils.assertTrue(tester('1001.1001'));
						});

						it('Floating point with no decimal part', () => {
							TEUtils.assertTrue(tester('.1001'));
						});

						it('Floating point with null decimal part', () => {
							TEUtils.assertTrue(tester('0.1001'));
						});

						it('Floating point with trailing zeros in the fractional part', () => {
							TEUtils.assertTrue(tester('0.1000'));
						});

						it('Floating point with leading zeros in the fractional part', () => {
							TEUtils.assertTrue(tester('0.0001'));
						});
					});
				});

				describe('uk', () => {
					const tester = Transformer.Number.Options.toTester(Transformer.Number.Options.Real.uk);

					describe('Reading', () => {
						it('Empty string', () => {
							TEUtils.assertFalse(tester(''));
						});

						it('One space string', () => {
							TEUtils.assertFalse(tester(' '));
						});

						it('With upfront 0', () => {
							TEUtils.assertFalse(tester('01,001.1'));
						});

						it('With upfront space', () => {
							TEUtils.assertFalse(tester(' 1,001.1'));
						});

						it('With fractional separator but without fractional part', () => {
							TEUtils.assertFalse(tester('1,001.'));
						});

						it('With thousand sep in the fractional part', () => {
							TEUtils.assertFalse(tester('1,001.100,1'));
						});

						it('With two fractional separators', () => {
							TEUtils.assertFalse(tester('1,001.1.101'));
						});

						it('With misplaced thousands separator', () => {
							TEUtils.assertFalse(tester('1,001,1.1001'));
						});

						it('0', () => {
							TEUtils.assertTrue(tester('0'));
						});

						it('Any integer', () => {
							TEUtils.assertTrue(tester('1,001,001'));
						});

						it('Any floating point', () => {
							TEUtils.assertTrue(tester('121.1001'));
						});

						it('Floating point with no decimal part', () => {
							TEUtils.assertTrue(tester('.1001'));
						});

						it('Floating point with null decimal part', () => {
							TEUtils.assertTrue(tester('0.1001'));
						});
					});
				});

				describe('german', () => {
					const tester = Transformer.Number.Options.toTester(
						Transformer.Number.Options.Real.german
					);

					describe('Reading', () => {
						it('Any floating point', () => {
							TEUtils.assertTrue(tester('1.001.001,1001'));
						});
					});
				});

				describe('scientific', () => {
					const tester = Transformer.Number.Options.toTester(
						Transformer.Number.Options.Real.scientific
					);

					describe('Reading', () => {
						it('Empty string', () => {
							TEUtils.assertFalse(tester(''));
						});

						it('One space string', () => {
							TEUtils.assertFalse(tester(' '));
						});

						it('With no significand', () => {
							TEUtils.assertFalse(tester('e10'));
						});

						it('', () => {
							TEUtils.assertFalse(tester('10.65e4'));
						});

						it('With space after e', () => {
							TEUtils.assertFalse(tester('3.14e 2'));
						});

						it('With space before e', () => {
							TEUtils.assertFalse(tester('3.14 e2'));
						});

						it('With fractional exponent', () => {
							TEUtils.assertFalse(tester('3.14e-2.3'));
						});

						it('0.00', () => {
							TEUtils.assertFalse(tester('0.00'));
						});

						it('With fractional significand', () => {
							TEUtils.assertFalse(tester('.13e10'));
						});

						it('Any number between 0 and 10 without exponent', () => {
							TEUtils.assertTrue(tester('7.45'));
						});

						it('Any number between 0 and 10 with unsigned strictly positive exponent', () => {
							TEUtils.assertTrue(tester('3.15e12'));
						});

						it('Any number between 0 and 10 with signed strictly positive exponent', () => {
							TEUtils.assertTrue(tester('3.15e+12'));
						});

						it('Any number between 0 and 10 with null exponent', () => {
							TEUtils.assertTrue(tester('3.15e0'));
						});

						it('Any number between 0 and 10 with strictly negative exponent', () => {
							TEUtils.assertTrue(tester('3.15e-12'));
						});
					});

					describe('french2FractionalDigits', () => {
						const tester = Transformer.Number.Options.toTester(
							Transformer.Number.Options.Real.french2FractionalDigits
						);

						describe('Reading', () => {
							it('Empty string', () => {
								TEUtils.assertFalse(tester(''));
							});

							it('One space string', () => {
								TEUtils.assertFalse(tester(' '));
							});

							it('With upfront 0', () => {
								TEUtils.assertFalse(tester('01,10'));
							});

							it('With upfront space', () => {
								TEUtils.assertFalse(tester(' 1,13'));
							});

							it('0', () => {
								TEUtils.assertFalse(tester('0'));
							});

							it('Any integer with no fractional digit', () => {
								TEUtils.assertFalse(tester('1 001'));
							});

							it('Any integer with one fractional digit', () => {
								TEUtils.assertFalse(tester('1 001,1'));
							});

							it('Any integer with three fractional digits', () => {
								TEUtils.assertFalse(tester('1 001,123'));
							});

							it('Any integer with two fractional digits but no space sep', () => {
								TEUtils.assertFalse(tester('1001,12'));
							});

							it('0,00', () => {
								TEUtils.assertTrue(tester('0,00'));
							});

							it('Any integer with two fractional digits', () => {
								TEUtils.assertTrue(tester('1 001,43'));
							});
						});
					});
				});
			});

			describe('Int', () => {
				describe('french', () => {
					const tester = Transformer.Number.Options.toTester(Transformer.Number.Options.Int.french);

					describe('Reading', () => {
						it('Empty string', () => {
							TEUtils.assertFalse(tester(''));
						});

						it('One space string', () => {
							TEUtils.assertFalse(tester(' '));
						});

						it('With upfront 0', () => {
							TEUtils.assertFalse(tester('01'));
						});

						it('With upfront space', () => {
							TEUtils.assertFalse(tester(' 1'));
						});

						it('With comma in the decimal part', () => {
							TEUtils.assertFalse(tester('1,001'));
						});

						it('With fractional part', () => {
							TEUtils.assertFalse(tester('1 001,134'));
						});

						it('Unsigned integer', () => {
							TEUtils.assertTrue(tester('1 001'));
						});

						it('Integer with minus sign', () => {
							TEUtils.assertTrue(tester('-1 001'));
						});

						it('Integer with spaced minus sign', () => {
							TEUtils.assertFalse(tester('- 1 001'));
						});

						it('Integer with plus sign', () => {
							TEUtils.assertFalse(tester('+1 001'));
						});
					});
				});

				describe('signedFrench', () => {
					const tester = Transformer.Number.Options.toTester(
						Transformer.Number.Options.Int.signedFrench
					);

					describe('Reading', () => {
						it('Empty string', () => {
							TEUtils.assertFalse(tester(''));
						});

						it('One space string', () => {
							TEUtils.assertFalse(tester(' '));
						});

						it('With upfront 0', () => {
							TEUtils.assertFalse(tester('01'));
						});

						it('Unsigned integer', () => {
							TEUtils.assertFalse(tester('1 001'));
						});

						it('Integer with minus sign', () => {
							TEUtils.assertTrue(tester('-1 001'));
						});

						it('Integer with spaced minus sign', () => {
							TEUtils.assertFalse(tester('- 1 001'));
						});

						it('Integer with plus sign', () => {
							TEUtils.assertTrue(tester('+1 001'));
						});
					});
				});

				describe('plussedFrench', () => {
					const tester = Transformer.Number.Options.toTester(
						Transformer.Number.Options.Int.plussedFrench
					);

					describe('Reading', () => {
						it('Empty string', () => {
							TEUtils.assertFalse(tester(''));
						});

						it('One space string', () => {
							TEUtils.assertFalse(tester(' '));
						});

						it('With upfront 0', () => {
							TEUtils.assertFalse(tester('01'));
						});

						it('Unsigned integer', () => {
							TEUtils.assertTrue(tester('1 001'));
						});

						it('Integer with minus sign', () => {
							TEUtils.assertTrue(tester('-1 001'));
						});

						it('Integer with spaced minus sign', () => {
							TEUtils.assertFalse(tester('-  001'));
						});

						it('Integer with plus sign', () => {
							TEUtils.assertTrue(tester('+1 001'));
						});
					});
				});
			});

			describe('PositiveInt', () => {
				describe('french', () => {
					const tester = Transformer.Number.Options.toTester(
						Transformer.Number.Options.PositiveInt.french
					);

					describe('Reading', () => {
						it('Empty string', () => {
							TEUtils.assertFalse(tester(''));
						});

						it('One space string', () => {
							TEUtils.assertFalse(tester(' '));
						});

						it('With upfront 0', () => {
							TEUtils.assertFalse(tester('01'));
						});

						it('With upfront space', () => {
							TEUtils.assertFalse(tester(' 1'));
						});

						it('Unsigned integer', () => {
							TEUtils.assertTrue(tester('1 001'));
						});

						it('Integer with minus sign', () => {
							TEUtils.assertFalse(tester('-1 001'));
						});

						it('Integer with spaced minus sign', () => {
							TEUtils.assertFalse(tester('- 1 001'));
						});

						it('Integer with plus sign', () => {
							TEUtils.assertFalse(tester('+1 001'));
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
						TEUtils.assertFalse(readTester(''));
					});

					it('One space string', () => {
						TEUtils.assertFalse(readTester(' foo'));
					});

					it('With upfront 0', () => {
						TEUtils.deepStrictEqual(readTester('01.1foo'),[0, '1.1foo']);
					});

					it('With upfront space', () => {
						TEUtils.assertFalse(readTester(' 1.1foo'));
					});

					it('Any positive number', () => {
						TEUtils.deepStrictEqual(readTester('1000348.3456foo'),[1_000_348.3456, 'foo']);
					});

					it('Any negative number', () => {
						TEUtils.deepStrictEqual(readTester('-.3foo'),[-0.3, 'foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.standard);
				describe('Writing', () => {
					it('Any positive number', () => {
						TEUtils.strictEqual(pipe(10_034_538.76, MBrand.Real.fromNumber, writeTester),'10034538.76');
					});

					it('Any negative number', () => {
						TEUtils.strictEqual(pipe(-1_740.7654, MBrand.Real.fromNumber, writeTester),'-1740.7654');
					});

					it('Any integer', () => {
						TEUtils.strictEqual(pipe(-8, MBrand.Real.fromNumber, writeTester),'-8');
					});

					it('Any fractional number', () => {
						TEUtils.strictEqual(pipe(0.34, MBrand.Real.fromNumber, writeTester),'0.34');
					});
				});
			});

			describe('uk', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.uk);
				describe('Reading', () => {
					it('Any positive number', () => {
						TEUtils.deepStrictEqual(readTester('1,000,348.3456foo'),[1_000_348.3456, 'foo']);
					});

					it('Any negative number', () => {
						TEUtils.deepStrictEqual(readTester('-10.3foo'),[-10.3, 'foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.uk);
				describe('Writing', () => {
					it('Any positive number', () => {
						TEUtils.strictEqual(pipe(10_034_538.7654, MBrand.Real.fromNumber, writeTester),
							'10,034,538.7654'
						);
					});

					it('Any negative number', () => {
						TEUtils.strictEqual(pipe(-18.7654, MBrand.Real.fromNumber, writeTester),'-18.7654');
					});
				});
			});

			describe('uk2FractionalDigits', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.uk2FractionalDigits);
				describe('Reading', () => {
					it('Number with one fractional digit', () => {
						TEUtils.assertFalse(readTester('10.3foo'));
					});

					it('Any positive number with 2 fractional digits', () => {
						TEUtils.deepStrictEqual(readTester('10.30foo'),[10.3, 'foo']);
					});

					it('Number with three fractional digits', () => {
						TEUtils.deepStrictEqual(readTester('-10.321foo'),[-10.32, '1foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.uk2FractionalDigits);
				describe('Writing', () => {
					it('Any integer', () => {
						TEUtils.strictEqual(pipe(10_034_538, MBrand.Real.fromNumber, writeTester),'10,034,538.00');
					});

					it('Any number with one fractional digit', () => {
						TEUtils.strictEqual(pipe(-1_740.7, MBrand.Real.fromNumber, writeTester),'-1,740.70');
					});

					it('Any number with two fractional digits', () => {
						TEUtils.strictEqual(pipe(18.73, MBrand.Real.fromNumber, writeTester),'18.73');
					});

					it('Any number with three fractional digits round down', () => {
						TEUtils.strictEqual(pipe(18_740_543_323.344, MBrand.Real.fromNumber, writeTester),
							'18,740,543,323.34'
						);
					});

					it('Any number with three fractional digits round up', () => {
						TEUtils.strictEqual(pipe(-194.455, MBrand.Real.fromNumber, writeTester),'-194.46');
					});
				});
			});

			describe('frenchScientific', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.frenchScientific);
				describe('Reading', () => {
					it('Number greater than 10', () => {
						TEUtils.deepStrictEqual(readTester('10,3foo'),[1, '0,3foo']);
					});

					it('Positive number without exponent', () => {
						TEUtils.deepStrictEqual(readTester('9,30foo'),[9.3, 'foo']);
					});

					it('Negative number with positive exponent', () => {
						TEUtils.deepStrictEqual(readTester('-5,234e3foo'),[-5_234, 'foo']);
					});

					it('Positive number with negative exponent', () => {
						TEUtils.deepStrictEqual(readTester('5,234e-3foo'),[0.005234, 'foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.frenchScientific);
				describe('Writing', () => {
					it('Any integer', () => {
						TEUtils.assertFalse(pipe(0, MBrand.Real.fromNumber, writeTester));
					});

					it('Any positive integer', () => {
						TEUtils.strictEqual(pipe(10_034_538, MBrand.Real.fromNumber, writeTester),'1,0035e7');
					});

					it('Any negative integer', () => {
						TEUtils.strictEqual(pipe(-0.0443, MBrand.Real.fromNumber, writeTester),'-4,43e-2');
					});
				});
			});

			describe('germanFractional', () => {
				const readTester = readTesterMaker(Transformer.Number.Real.germanFractional);
				describe('Reading', () => {
					it('Number with decimal part', () => {
						TEUtils.assertFalse(readTester('10,3foo'));
					});

					it('Positive number', () => {
						TEUtils.deepStrictEqual(readTester(',3230foo'),[0.323, 'foo']);
					});

					it('Negative number with exponent', () => {
						TEUtils.deepStrictEqual(readTester('-,234e3foo'),[-0.234, 'e3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Real.germanFractional);
				describe('Writing', () => {
					it('0', () => {
						TEUtils.strictEqual(pipe(0, MBrand.Real.fromNumber, writeTester),'0');
					});

					it('Any integer', () => {
						TEUtils.assertFalse(pipe(8, MBrand.Real.fromNumber, writeTester));
					});

					it('Any fractional number', () => {
						TEUtils.strictEqual(pipe(-0.443, MBrand.Real.fromNumber, writeTester),'-0,443');
					});
				});
			});
		});

		describe('Int', () => {
			describe('uk', () => {
				const readTester = readTesterMaker(Transformer.Number.Int.uk);
				describe('Reading', () => {
					it('Positive integer', () => {
						TEUtils.deepStrictEqual(readTester('10foo'),[10, 'foo']);
					});

					it('Negative fractional number', () => {
						TEUtils.deepStrictEqual(readTester('-10.3foo'),[-10, '.3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Int.uk);
				describe('Writing', () => {
					it('0', () => {
						TEUtils.strictEqual(pipe(0, MBrand.Int.fromNumber, writeTester),'0');
					});

					it('Positive number', () => {
						TEUtils.strictEqual(pipe(1048, MBrand.Int.fromNumber, writeTester),'1,048');
					});

					it('Negative number', () => {
						TEUtils.strictEqual(pipe(-224, MBrand.Int.fromNumber, writeTester),'-224');
					});
				});
			});

			describe('signedUk', () => {
				const readTester = readTesterMaker(Transformer.Number.Int.signedUk);
				describe('Reading', () => {
					it('Positive integer without sign', () => {
						TEUtils.assertFalse(readTester('10foo'));
					});

					it('Positive integer with sign', () => {
						TEUtils.deepStrictEqual(readTester('+10foo'),[10, 'foo']);
					});

					it('Negative integer', () => {
						TEUtils.deepStrictEqual(readTester('-10.3foo'),[-10, '.3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Int.signedUk);
				describe('Writing', () => {
					it('0', () => {
						TEUtils.strictEqual(pipe(0, MBrand.Int.fromNumber, writeTester),'+0');
					});

					it('Positive number', () => {
						TEUtils.strictEqual(pipe(1048, MBrand.Int.fromNumber, writeTester),'+1,048');
					});

					it('Negative number', () => {
						TEUtils.strictEqual(pipe(-224, MBrand.Int.fromNumber, writeTester),'-224');
					});
				});
			});

			describe('plussedUk', () => {
				const readTester = readTesterMaker(Transformer.Number.Int.plussedUk);
				describe('Reading', () => {
					it('Positive integer without sign', () => {
						TEUtils.deepStrictEqual(readTester('10foo'),[10, 'foo']);
					});

					it('Positive integer with sign', () => {
						TEUtils.deepStrictEqual(readTester('+10foo'),[10, 'foo']);
					});

					it('Negative integer', () => {
						TEUtils.deepStrictEqual(readTester('-10.3foo'),[-10, '.3foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.Int.plussedUk);
				describe('Writing', () => {
					it('0', () => {
						TEUtils.strictEqual(pipe(0, MBrand.Int.fromNumber, writeTester),'0');
					});

					it('Positive number', () => {
						TEUtils.strictEqual(pipe(1048, MBrand.Int.fromNumber, writeTester),'1,048');
					});

					it('Negative number', () => {
						TEUtils.strictEqual(pipe(-224, MBrand.Int.fromNumber, writeTester),'-224');
					});
				});
			});
		});

		describe('PositiveInt', () => {
			describe('binary', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.binary);
				describe('Reading', () => {
					it('string not representing a binary number', () => {
						TEUtils.assertFalse(readTester(' 11foo'));
					});

					it('string with binary number at start', () => {
						TEUtils.deepStrictEqual(readTester('00118foo'),[3, '8foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.binary);
				it('Writing', () => {
					TEUtils.strictEqual(pipe(15, MBrand.PositiveInt.fromNumber, writeTester),'1111');
				});
			});

			describe('octal', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.octal);
				describe('Reading', () => {
					it('string not representing an octal number', () => {
						TEUtils.assertFalse(readTester(' 16foo'));
					});

					it('string with octal number at start', () => {
						TEUtils.deepStrictEqual(readTester('168foo'),[14, '8foo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.octal);
				it('Writing', () => {
					TEUtils.strictEqual(pipe(14, MBrand.PositiveInt.fromNumber, writeTester),'16');
				});
			});

			describe('hexadecimal', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.hexadecimal);
				describe('Reading', () => {
					it('string not representing a hexadecimal number', () => {
						TEUtils.assertFalse(readTester(' foo'));
					});

					it('string with hexadecimal number at start', () => {
						TEUtils.deepStrictEqual(readTester('Ffoo'),[255, 'oo']);
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.hexadecimal);
				it('Writing', () => {
					TEUtils.strictEqual(pipe(16, MBrand.PositiveInt.fromNumber, writeTester),'10');
				});
			});

			describe('uk', () => {
				const readTester = readTesterMaker(Transformer.Number.PositiveInt.uk);
				describe('Reading', () => {
					it('Positive integer', () => {
						TEUtils.deepStrictEqual(readTester('10foo'),[10, 'foo']);
					});

					it('Negative fractional number', () => {
						TEUtils.assertFalse(readTester('-10.3foo'));
					});
				});

				const writeTester = writeTesterMaker(Transformer.Number.PositiveInt.uk);
				describe('Writing', () => {
					it('0', () => {
						TEUtils.strictEqual(pipe(0, MBrand.PositiveInt.fromNumber, writeTester),'0');
					});

					it('Positive number', () => {
						TEUtils.strictEqual(pipe(1048, MBrand.PositiveInt.fromNumber, writeTester),'1,048');
					});
				});
			});
		});
	});
});
