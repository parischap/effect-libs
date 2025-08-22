/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVReal } from '@parischap/conversions';
import { MBigDecimal, MNumber } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Option, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('NumberBase10Format', () => {
	const frenchStyleThreeDecimalNumber = CVNumberBase10Format.frenchStyleThreeDecimalNumber;
	const frenchStyleThreeDecimalNumberWithAutoSign = pipe(
		frenchStyleThreeDecimalNumber,
		CVNumberBase10Format.withSignDisplayForNegative()
	);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVNumberBase10Format.moduleTag
			);
		});

		describe('.toString()', () => {
			it('With descriptor', () => {
				TEUtils.strictEqual(
					frenchStyleThreeDecimalNumber.toString(),
					'French-style three-decimal number'
				);
			});

			it('Without descriptor', () => {
				TEUtils.strictEqual(
					pipe(
						frenchStyleThreeDecimalNumber,
						CVNumberBase10Format.withoutThousandSeparator()
					).toString(),
					`{
  "_id": "@parischap/conversions/NumberBase10Format/",
  "descriptor": "",
  "thousandSeparator": "",
  "fractionalSeparator": ",",
  "showNullIntegerPart": true,
  "minimumFractionDigits": 0,
  "maximumFractionDigits": 3,
  "eNotationChars": [
    "E",
    "e"
  ],
  "scientificNotation": 0,
  "roundingMode": 6,
  "signDisplay": 3
}`
				);
			});
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(frenchStyleThreeDecimalNumber.pipe(CVNumberBase10Format.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVNumberBase10Format.has(frenchStyleThreeDecimalNumber));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVNumberBase10Format.has(new Date()));
			});
		});
	});

	describe('SignDisplay', () => {
		describe('toParser', () => {
			describe('Auto', () => {
				const parser = CVNumberBase10Format.SignDisplay.toParser(
					CVNumberBase10Format.SignDisplay.Auto
				);
				it('No sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
					TEUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
					TEUtils.assertSome(parser({ isZero: true, sign: '-' }), -1);
				});
				it('Plus sign', () => {
					TEUtils.assertNone(parser({ isZero: false, sign: '+' }));
					TEUtils.assertNone(parser({ isZero: true, sign: '+' }));
				});
			});

			describe('Always', () => {
				const parser = CVNumberBase10Format.SignDisplay.toParser(
					CVNumberBase10Format.SignDisplay.Always
				);
				it('No sign', () => {
					TEUtils.assertNone(parser({ isZero: false, sign: '' }));
					TEUtils.assertNone(parser({ isZero: true, sign: '' }));
				});
				it('Minus sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
					TEUtils.assertSome(parser({ isZero: true, sign: '-' }), -1);
				});
				it('Plus sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '+' }), 1);
					TEUtils.assertSome(parser({ isZero: true, sign: '+' }), 1);
				});
			});

			describe('ExceptZero', () => {
				const parser = CVNumberBase10Format.SignDisplay.toParser(
					CVNumberBase10Format.SignDisplay.ExceptZero
				);
				it('No sign', () => {
					TEUtils.assertNone(parser({ isZero: false, sign: '' }));
					//TEUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
					TEUtils.assertNone(parser({ isZero: true, sign: '-' }));
				});
				it('Plus sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '+' }), 1);
					TEUtils.assertNone(parser({ isZero: true, sign: '+' }));
				});
			});

			describe('Negative', () => {
				const parser = CVNumberBase10Format.SignDisplay.toParser(
					CVNumberBase10Format.SignDisplay.Negative
				);
				it('No sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
					TEUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
					TEUtils.assertNone(parser({ isZero: true, sign: '-' }));
				});
				it('Plus sign', () => {
					TEUtils.assertNone(parser({ isZero: false, sign: '+' }));
					TEUtils.assertNone(parser({ isZero: true, sign: '+' }));
				});
			});

			describe('Never', () => {
				const parser = CVNumberBase10Format.SignDisplay.toParser(
					CVNumberBase10Format.SignDisplay.Never
				);
				it('No sign', () => {
					TEUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
					TEUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertNone(parser({ isZero: false, sign: '-' }));
					TEUtils.assertNone(parser({ isZero: true, sign: '-' }));
				});
				it('Plus sign', () => {
					TEUtils.assertNone(parser({ isZero: false, sign: '+' }));
					TEUtils.assertNone(parser({ isZero: true, sign: '+' }));
				});
			});
		});

		describe('toFormatter', () => {
			describe('Auto', () => {
				const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
					CVNumberBase10Format.SignDisplay.Auto
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
					TEUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
				});
			});

			describe('Always', () => {
				const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
					CVNumberBase10Format.SignDisplay.Always
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
					TEUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '+');
				});
			});

			describe('ExceptZero', () => {
				const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
					CVNumberBase10Format.SignDisplay.ExceptZero
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
					TEUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
				});
			});

			describe('Negative', () => {
				const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
					CVNumberBase10Format.SignDisplay.Negative
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
					TEUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
				});
			});

			describe('Never', () => {
				const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
					CVNumberBase10Format.SignDisplay.Never
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '');
					TEUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
					TEUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
				});
			});
		});
	});

	describe('ScientificNotation', () => {
		describe('toParser', () => {
			describe('None', () => {
				const parser = CVNumberBase10Format.ScientificNotation.toParser(
					CVNumberBase10Format.ScientificNotation.None
				);
				it('Empty string', () => {
					TEUtils.assertSome(parser(''), 0);
				});
				it('Value', () => {
					TEUtils.assertNone(parser('+15'));
				});
			});

			describe('Standard', () => {
				const parser = CVNumberBase10Format.ScientificNotation.toParser(
					CVNumberBase10Format.ScientificNotation.Standard
				);
				it('Empty string', () => {
					TEUtils.assertSome(parser(''), 0);
				});
				it('Positive value', () => {
					TEUtils.assertSome(parser('+15'), 15);
				});
			});

			describe('Normalized', () => {
				const parser = CVNumberBase10Format.ScientificNotation.toParser(
					CVNumberBase10Format.ScientificNotation.Normalized
				);
				it('Empty string', () => {
					TEUtils.assertSome(parser(''), 0);
				});
				it('Negative Value', () => {
					TEUtils.assertSome(parser('-15'), -15);
				});
			});

			describe('Engineering', () => {
				const parser = CVNumberBase10Format.ScientificNotation.toParser(
					CVNumberBase10Format.ScientificNotation.Engineering
				);
				it('Empty string', () => {
					TEUtils.assertSome(parser(''), 0);
				});
				it('Multiple of 3', () => {
					TEUtils.assertSome(parser('15'), 15);
				});
				it('Non-multiple of 3', () => {
					TEUtils.assertNone(parser('16'));
				});
			});
		});

		describe('toMantissaChecker', () => {
			describe('None', () => {
				const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
					CVNumberBase10Format.ScientificNotation.None
				);
				TEUtils.assertSome(pipe(checker(BigDecimal.make(15n, 1))));

				it('Standard', () => {
					const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
						CVNumberBase10Format.ScientificNotation.Standard
					);
					TEUtils.assertSome(pipe(checker(BigDecimal.make(0n, 1))));
				});

				describe('Normalized', () => {
					const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
						CVNumberBase10Format.ScientificNotation.Normalized
					);
					it('Passing', () => {
						TEUtils.assertSome(pipe(checker(BigDecimal.make(95n, 1))));
					});
					it('Not-passing', () => {
						TEUtils.assertNone(checker(BigDecimal.make(95n, 2)));
					});
				});

				describe('Engineering', () => {
					const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
						CVNumberBase10Format.ScientificNotation.Engineering
					);
					it('Passing', () => {
						TEUtils.assertSome(pipe(checker(BigDecimal.make(59527n, 2))));
					});
					it('Not-passing', () => {
						TEUtils.assertNone(checker(BigDecimal.make(100198n, 2)));
					});
				});
			});

			describe('toMantissaAdjuster', () => {
				const aBigNumber = BigDecimal.make(15_654_543_234n, 2);
				const aSmallNumber = BigDecimal.make(-15n, 4);
				it('None', () => {
					const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
						CVNumberBase10Format.ScientificNotation.None
					);
					TEUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
				});

				it('Standard', () => {
					const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
						CVNumberBase10Format.ScientificNotation.Standard
					);
					TEUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
				});

				describe('Normalized', () => {
					const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
						CVNumberBase10Format.ScientificNotation.Normalized
					);
					it('Big number', () => {
						TEUtils.assertEquals(adjuster(aBigNumber), [
							BigDecimal.make(15654543234n, 10),
							Option.some(8)
						]);
					});
					it('Small number', () => {
						TEUtils.assertEquals(adjuster(aSmallNumber), [
							BigDecimal.make(-15n, 1),
							Option.some(-3)
						]);
					});
				});

				describe('Engineering', () => {
					const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
						CVNumberBase10Format.ScientificNotation.Engineering
					);
					it('Big number', () => {
						TEUtils.assertEquals(adjuster(aBigNumber), [
							BigDecimal.make(15_654_543_234n, 8),
							Option.some(6)
						]);
					});
					it('Small number', () => {
						TEUtils.assertEquals(adjuster(aSmallNumber), [
							BigDecimal.make(-15n, 1),
							Option.some(-3)
						]);
					});
				});
			});
		});
	});

	describe('toBigDecimalExtractor', () => {
		describe('General tests with frenchStyleThreeDecimalNumber', () => {
			const extractor = CVNumberBase10Format.toBigDecimalExtractor(frenchStyleThreeDecimalNumber);
			it('String not starting by number', () => {
				TEUtils.assertNone(extractor('Dummy'));
			});

			it('Only a sign', () => {
				TEUtils.assertNone(extractor('- Dummy'));
			});

			it('Negative zero', () => {
				TEUtils.assertNone(extractor('-0Dummy'));
			});

			it('Unexpected fillChar', () => {
				TEUtils.assertNone(extractor('- 5Dummy'));
				TEUtils.assertNone(extractor(' 5Dummy'));
			});

			it('Unsigned mantissa with no integer part', () => {
				TEUtils.assertSome(extractor('0,45Dummy'), Tuple.make(BigDecimal.make(45n, 2), '0,45'));
			});

			it('Signed mantissa with no integer part', () => {
				TEUtils.assertSome(extractor('-0,45Dummy'), Tuple.make(BigDecimal.make(-45n, 2), '-0,45'));
			});

			it('Signed mantissa with no fractional part', () => {
				TEUtils.assertSome(extractor('-45'), Tuple.make(BigDecimal.make(-45n, 0), '-45'));
			});

			it('Signed mantissa', () => {
				TEUtils.assertSome(extractor('-45,45'), Tuple.make(BigDecimal.make(-4545n, 2), '-45,45'));
			});

			it('Fractional part of mantissa starting with zeros', () => {
				TEUtils.assertSome(extractor('-45,00'), Tuple.make(BigDecimal.make(-45n, 0), '-45,00'));
			});
		});

		describe('Allow scientific notation', () => {
			//Use withEngineeringScientificNotation to make sure that ScientificNotation.toParser is called properly
			const extractor = pipe(
				frenchStyleThreeDecimalNumber,
				CVNumberBase10Format.withEngineeringScientificNotation(),
				CVNumberBase10Format.toBigDecimalExtractor
			);

			it('Only an exponent', () => {
				TEUtils.assertNone(extractor('e12Dummy'));
			});

			it('An exponent that is not a multiple of 3', () => {
				TEUtils.assertNone(extractor('512,45e13Dummy'));
			});

			it('A mantissa out of range', () => {
				TEUtils.assertNone(extractor('1 512,45e12Dummy'));
				TEUtils.assertNone(extractor('0,45Dummy'));
			});

			it('Zero', () => {
				TEUtils.assertSome(extractor('0Dummy'), Tuple.make(BigDecimal.make(0n, 0), '0'));
			});

			it('A number respecting all conditions', () => {
				TEUtils.assertSome(
					extractor('512,45e12Dummy'),
					Tuple.make(BigDecimal.make(51245n, -10), '512,45e12')
				);
			});
		});

		describe('ShowNullInteger part tests', () => {
			describe('True', () => {
				const extractor = CVNumberBase10Format.toBigDecimalExtractor(frenchStyleThreeDecimalNumber);

				it('Non-null value with explicit 0', () => {
					TEUtils.assertSome(
						extractor('-0,45Dummy'),
						Tuple.make(BigDecimal.make(-45n, 2), '-0,45')
					);
				});

				it('Null value', () => {
					TEUtils.assertSome(extractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
				});

				it('Non-null value with implicit 0', () => {
					TEUtils.assertNone(extractor('-,45Dummy'));
				});
			});

			describe('False', () => {
				const extractor = pipe(
					frenchStyleThreeDecimalNumber,
					CVNumberBase10Format.withNullIntegerPartNotShowing(),
					CVNumberBase10Format.toBigDecimalExtractor
				);

				it('Non-null value with explicit 0', () => {
					TEUtils.assertNone(extractor('-0,45Dummy'));
				});

				it('Null value', () => {
					TEUtils.assertSome(extractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
				});

				it('Non-null value with implicit 0', () => {
					TEUtils.assertSome(extractor('-,45Dummy'), Tuple.make(BigDecimal.make(-45n, 2), '-,45'));
				});
			});
		});

		describe('minimumFractionDigits tests', () => {
			describe('Two decimals', () => {
				const extractor = pipe(
					frenchStyleThreeDecimalNumber,
					CVNumberBase10Format.withNDecimals(2),
					CVNumberBase10Format.toBigDecimalExtractor
				);

				it('No decimal', () => {
					TEUtils.assertNone(extractor('8Dummy'));
				});

				it('One decimal', () => {
					TEUtils.assertNone(extractor('8,1Dummy'));
				});

				it('Two decimals', () => {
					TEUtils.assertSome(extractor('8,10Dummy'), Tuple.make(BigDecimal.make(81n, 1), '8,10'));
				});
			});
		});

		describe('maximumFractionDigits tests', () => {
			describe('Three decimals', () => {
				const extractor = CVNumberBase10Format.toBigDecimalExtractor(frenchStyleThreeDecimalNumber);

				it('No decimal', () => {
					TEUtils.assertSome(extractor('8Dummy'), Tuple.make(BigDecimal.make(8n, 0), '8'));
				});

				it('Three decimals', () => {
					TEUtils.assertSome(extractor('8,100Dummy'), Tuple.make(BigDecimal.make(81n, 1), '8,100'));
				});

				it('Four decimals', () => {
					TEUtils.assertNone(extractor('0,1234Dummy'));
				});
			});

			describe('Unbounded', () => {
				const extractor = pipe(
					frenchStyleThreeDecimalNumber,
					CVNumberBase10Format.withMaxNDecimals(+Infinity),
					CVNumberBase10Format.toBigDecimalExtractor
				);

				it('Four decimals', () => {
					TEUtils.assertSome(
						extractor('0,1234Dummy'),
						Tuple.make(BigDecimal.make(1234n, 4), '0,1234')
					);
				});
			});
		});

		describe('With a fillChar', () => {
			const extractor = CVNumberBase10Format.toBigDecimalExtractor(
				frenchStyleThreeDecimalNumber,
				' '
			);

			it('String not starting by number', () => {
				TEUtils.assertNone(extractor(' Dummy'));
			});

			it('Only a sign', () => {
				TEUtils.assertNone(extractor('- Dummy'));
			});

			it('Negative zero', () => {
				TEUtils.assertNone(extractor('-0Dummy'));
			});

			it('Negative value', () => {
				TEUtils.assertSome(extractor('- 5Dummy'), Tuple.make(BigDecimal.make(-5n, 0), '- 5'));
			});

			it('Positive value', () => {
				TEUtils.assertSome(extractor(' 5Dummy'), Tuple.make(BigDecimal.make(5n, 0), ' 5'));
			});
		});
	});

	describe('toRealExtractor', () => {
		const extractor = CVNumberBase10Format.toRealExtractor(frenchStyleThreeDecimalNumber);
		it('passing', () => {
			TEUtils.assertSome(extractor('0,45Dummy'), Tuple.make(CVReal.unsafeFromNumber(0.45), '0,45'));
		});

		it('Not passing', () => {
			TEUtils.assertNone(extractor('Dummy'));
		});
	});

	describe('toBigDecimalParser', () => {
		const parser = pipe(
			frenchStyleThreeDecimalNumber,
			CVNumberBase10Format.withStandardScientificNotation(),
			CVNumberBase10Format.toBigDecimalParser
		);
		it('Passing', () => {
			TEUtils.assertSome(parser('-45,45e-2'), BigDecimal.make(-4545n, 4));
		});

		it('Not passing', () => {
			TEUtils.assertNone(parser('-45,45e-'));
		});
	});

	describe('toRealParser', () => {
		const parser = CVNumberBase10Format.toRealParser(frenchStyleThreeDecimalNumberWithAutoSign);
		it('Passing', () => {
			TEUtils.assertSome(parser('0,45'), CVReal.unsafeFromNumber(0.45));
		});

		it('Zero', () => {
			TEUtils.assertSome(parser('0'), CVReal.unsafeFromNumber(0));
			TEUtils.assertSome(pipe('-0', parser, Option.map(MNumber.sign2)), -1);
		});

		it('Not passing', () => {
			TEUtils.assertNone(parser('0.45'));
		});
	});

	describe('toNumberFormatter', () => {
		describe('General tests with frenchStyleThreeDecimalNumberWithAutoSign', () => {
			const formatter = CVNumberBase10Format.toNumberFormatter(
				frenchStyleThreeDecimalNumberWithAutoSign
			);
			it('Zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), '0');
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0)), '-0');
				TEUtils.assertEquals(formatter(BigDecimal.make(-0n, 0)), '0');
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
			});

			it('Number with less than maximumFractionDigits decimals', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(1528.65)), '1 528,65');
			});

			it('BigDecimal as input, more than maximumFractionDigits decimals', () => {
				TEUtils.assertEquals(formatter(BigDecimal.make(-14675435n, 4)), '-1 467,544');
			});
		});

		describe('Tests with withNullIntegerPartNotShowing', () => {
			const formatter = pipe(
				frenchStyleThreeDecimalNumberWithAutoSign,
				CVNumberBase10Format.withNullIntegerPartNotShowing(),
				CVNumberBase10Format.toNumberFormatter
			);
			it('Zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), '0');
			});

			it('Number rounded down to zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
			});

			it('Number rounded up from zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0.0005)), ',001');
			});
		});

		describe('Tests with withNDecimals(2) and withNullIntegerPartNotShowing', () => {
			const formatter = pipe(
				frenchStyleThreeDecimalNumberWithAutoSign,
				CVNumberBase10Format.withNDecimals(2),
				CVNumberBase10Format.withNullIntegerPartNotShowing(),
				CVNumberBase10Format.toNumberFormatter
			);
			it('Zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), ',00');
			});

			it('Number rounded down to zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.004)), '-,00');
			});

			it('Number rounded up from zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0.005)), ',01');
			});
		});

		describe('Tests with withEngineeringScientificNotation', () => {
			const formatter = pipe(
				frenchStyleThreeDecimalNumberWithAutoSign,
				CVNumberBase10Format.withEngineeringScientificNotation(),
				CVNumberBase10Format.withMinNDecimals(2),
				CVNumberBase10Format.toNumberFormatter
			);
			it('Negative Zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0)), '-0,00E0');
			});

			it('Big positive number', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(154321.5)), '154,322E3');
			});

			it('Small negative number', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-523e-5)), '-5,23E-3');
			});
		});
	});

	describe('toRealFormatter', () => {
		describe('General tests with frenchStyleThreeDecimalNumberWithAutoSign', () => {
			const formatter = CVNumberBase10Format.toNumberFormatter(
				frenchStyleThreeDecimalNumberWithAutoSign
			);
			it('Zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), '0');
			});

			it('Negative zero', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
			});

			it('Number with less than maximumFractionDigits decimals', () => {
				TEUtils.assertEquals(formatter(CVReal.unsafeFromNumber(1528.65)), '1 528,65');
			});

			it('BigDecimal as input, more than maximumFractionDigits decimals', () => {
				TEUtils.assertEquals(formatter(BigDecimal.make(-14675435n, 4)), '-1 467,544');
			});
		});

		describe('Tests with withNullIntegerPartNotShowing', () => {
			const numberFormatter = pipe(
				frenchStyleThreeDecimalNumberWithAutoSign,
				CVNumberBase10Format.withNullIntegerPartNotShowing(),
				CVNumberBase10Format.toNumberFormatter
			);
			it('Zero', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0)), '0');
			});

			it('Number rounded down to zero', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
			});

			it('Number rounded up from zero', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0.0005)), ',001');
			});
		});

		describe('Tests with withNDecimals(2) and withNullIntegerPartNotShowing', () => {
			const numberFormatter = pipe(
				frenchStyleThreeDecimalNumberWithAutoSign,
				CVNumberBase10Format.withNDecimals(2),
				CVNumberBase10Format.withNullIntegerPartNotShowing(),
				CVNumberBase10Format.toNumberFormatter
			);
			it('Zero', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0)), ',00');
			});

			it('Number rounded down to zero', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-0.004)), '-,00');
			});

			it('Number rounded up from zero', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0.005)), ',01');
			});
		});

		describe('Tests with withEngineeringScientificNotation', () => {
			const numberFormatter = pipe(
				frenchStyleThreeDecimalNumberWithAutoSign,
				CVNumberBase10Format.withEngineeringScientificNotation(),
				CVNumberBase10Format.withMinNDecimals(2),
				CVNumberBase10Format.toNumberFormatter
			);
			it('Negative Zero', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-0)), '-0,00E0');
			});

			it('Big positive number', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(154321.5)), '154,322E3');
			});

			it('Small negative number', () => {
				TEUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-523e-5)), '-5,23E-3');
			});
		});
	});
});
