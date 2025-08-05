/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVReal } from '@parischap/conversions';
import { MBigDecimal } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Option, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('NumberBase10Format', () => {
	const frenchStyleThreeDecimalNumber = CVNumberBase10Format.frenchStyleThreeDecimalNumber;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVNumberBase10Format.moduleTag
			);
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				frenchStyleThreeDecimalNumber.toString(),
				'French-style three-decimal number'
			);
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
		describe('toReader', () => {
			describe('Auto', () => {
				const reader = CVNumberBase10Format.SignDisplay.toReader(
					CVNumberBase10Format.SignDisplay.Auto
				);
				it('No sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '' }), 1);
					TEUtils.assertSome(reader({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '-' }), -1);
					TEUtils.assertSome(reader({ isZero: true, sign: '-' }), -1);
				});
				it('Plus sign', () => {
					TEUtils.assertNone(reader({ isZero: false, sign: '+' }));
					TEUtils.assertNone(reader({ isZero: true, sign: '+' }));
				});
			});

			describe('Always', () => {
				const reader = CVNumberBase10Format.SignDisplay.toReader(
					CVNumberBase10Format.SignDisplay.Always
				);
				it('No sign', () => {
					TEUtils.assertNone(reader({ isZero: false, sign: '' }));
					TEUtils.assertNone(reader({ isZero: true, sign: '' }));
				});
				it('Minus sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '-' }), -1);
					TEUtils.assertSome(reader({ isZero: true, sign: '-' }), -1);
				});
				it('Plus sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '+' }), 1);
					TEUtils.assertSome(reader({ isZero: true, sign: '+' }), 1);
				});
			});

			describe('ExceptZero', () => {
				const reader = CVNumberBase10Format.SignDisplay.toReader(
					CVNumberBase10Format.SignDisplay.ExceptZero
				);
				it('No sign', () => {
					TEUtils.assertNone(reader({ isZero: false, sign: '' }));
					//TEUtils.assertSome(reader({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '-' }), -1);
					TEUtils.assertNone(reader({ isZero: true, sign: '-' }));
				});
				it('Plus sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '+' }), 1);
					TEUtils.assertNone(reader({ isZero: true, sign: '+' }));
				});
			});

			describe('Negative', () => {
				const reader = CVNumberBase10Format.SignDisplay.toReader(
					CVNumberBase10Format.SignDisplay.Negative
				);
				it('No sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '' }), 1);
					TEUtils.assertSome(reader({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '-' }), -1);
					TEUtils.assertNone(reader({ isZero: true, sign: '-' }));
				});
				it('Plus sign', () => {
					TEUtils.assertNone(reader({ isZero: false, sign: '+' }));
					TEUtils.assertNone(reader({ isZero: true, sign: '+' }));
				});
			});

			describe('Never', () => {
				const reader = CVNumberBase10Format.SignDisplay.toReader(
					CVNumberBase10Format.SignDisplay.Never
				);
				it('No sign', () => {
					TEUtils.assertSome(reader({ isZero: false, sign: '' }), 1);
					TEUtils.assertSome(reader({ isZero: true, sign: '' }), 1);
				});
				it('Minus sign', () => {
					TEUtils.assertNone(reader({ isZero: false, sign: '-' }));
					TEUtils.assertNone(reader({ isZero: true, sign: '-' }));
				});
				it('Plus sign', () => {
					TEUtils.assertNone(reader({ isZero: false, sign: '+' }));
					TEUtils.assertNone(reader({ isZero: true, sign: '+' }));
				});
			});
		});

		describe('toWriter', () => {
			describe('Auto', () => {
				const writer = CVNumberBase10Format.SignDisplay.toWriter(
					CVNumberBase10Format.SignDisplay.Auto
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(writer({ isZero: true, sign: -1 }), '-');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: 1 }), '');
					TEUtils.strictEqual(writer({ isZero: true, sign: 1 }), '');
				});
			});

			describe('Always', () => {
				const writer = CVNumberBase10Format.SignDisplay.toWriter(
					CVNumberBase10Format.SignDisplay.Always
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(writer({ isZero: true, sign: -1 }), '-');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: 1 }), '+');
					TEUtils.strictEqual(writer({ isZero: true, sign: 1 }), '+');
				});
			});

			describe('ExceptZero', () => {
				const writer = CVNumberBase10Format.SignDisplay.toWriter(
					CVNumberBase10Format.SignDisplay.ExceptZero
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(writer({ isZero: true, sign: -1 }), '');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: 1 }), '+');
					TEUtils.strictEqual(writer({ isZero: true, sign: 1 }), '');
				});
			});

			describe('Negative', () => {
				const writer = CVNumberBase10Format.SignDisplay.toWriter(
					CVNumberBase10Format.SignDisplay.Negative
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: -1 }), '-');
					TEUtils.strictEqual(writer({ isZero: true, sign: -1 }), '');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: 1 }), '');
					TEUtils.strictEqual(writer({ isZero: true, sign: 1 }), '');
				});
			});

			describe('Never', () => {
				const writer = CVNumberBase10Format.SignDisplay.toWriter(
					CVNumberBase10Format.SignDisplay.Never
				);
				it('Minus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: -1 }), '');
					TEUtils.strictEqual(writer({ isZero: true, sign: -1 }), '');
				});
				it('Plus sign', () => {
					TEUtils.strictEqual(writer({ isZero: false, sign: 1 }), '');
					TEUtils.strictEqual(writer({ isZero: true, sign: 1 }), '');
				});
			});
		});
	});

	describe('ScientificNotation', () => {
		describe('toReader', () => {
			describe('None', () => {
				const reader = CVNumberBase10Format.ScientificNotation.toReader(
					CVNumberBase10Format.ScientificNotation.None
				);
				it('Empty string', () => {
					TEUtils.assertSome(reader(''), 0);
				});
				it('Value', () => {
					TEUtils.assertNone(reader('+15'));
				});
			});

			describe('Standard', () => {
				const reader = CVNumberBase10Format.ScientificNotation.toReader(
					CVNumberBase10Format.ScientificNotation.Standard
				);
				it('Empty string', () => {
					TEUtils.assertSome(reader(''), 0);
				});
				it('Positive value', () => {
					TEUtils.assertSome(reader('+15'), 15);
				});
			});

			describe('Normalized', () => {
				const reader = CVNumberBase10Format.ScientificNotation.toReader(
					CVNumberBase10Format.ScientificNotation.Normalized
				);
				it('Empty string', () => {
					TEUtils.assertSome(reader(''), 0);
				});
				it('Negative Value', () => {
					TEUtils.assertSome(reader('-15'), -15);
				});
			});

			describe('Engineering', () => {
				const reader = CVNumberBase10Format.ScientificNotation.toReader(
					CVNumberBase10Format.ScientificNotation.Engineering
				);
				it('Empty string', () => {
					TEUtils.assertSome(reader(''), 0);
				});
				it('Multiple of 3', () => {
					TEUtils.assertSome(reader('15'), 15);
				});
				it('Non-multiple of 3', () => {
					TEUtils.assertNone(reader('16'));
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
			//Use withSignDisplayForNegativeExceptZero to make sure that SignDisplay.toReader is called properly
			const numberExtractor = pipe(
				frenchStyleThreeDecimalNumber,
				CVNumberBase10Format.withSignDisplayForNegativeExceptZero(),
				CVNumberBase10Format.toBigDecimalExtractor
			);

			it('String not starting by number', () => {
				TEUtils.assertNone(numberExtractor('Dummy'));
			});

			it('Only a sign', () => {
				TEUtils.assertNone(numberExtractor('- Dummy'));
			});

			it('Negative zero', () => {
				TEUtils.assertNone(numberExtractor('-0Dummy'));
			});

			it('Zero', () => {
				TEUtils.assertSome(numberExtractor('0Dummy'), Tuple.make(BigDecimal.make(0n, 2), '0'));
			});

			it('Unsigned mantissa with no integer part', () => {
				TEUtils.assertSome(
					numberExtractor('0,45Dummy'),
					Tuple.make(BigDecimal.make(45n, 2), '0,45')
				);
			});

			it('Signed mantissa with no integer part', () => {
				TEUtils.assertSome(
					numberExtractor('-0,45Dummy'),
					Tuple.make(BigDecimal.make(-45n, 2), '-0,45')
				);
			});

			it('Signed mantissa with no fractional part', () => {
				TEUtils.assertSome(numberExtractor('-45'), Tuple.make(BigDecimal.make(-45n, 0), '-45'));
			});

			it('Signed mantissa', () => {
				TEUtils.assertSome(
					numberExtractor('-45,45'),
					Tuple.make(BigDecimal.make(-4545n, 2), '-45,45')
				);
			});

			it('Fractional part of mantissa starting with zeros', () => {
				TEUtils.assertSome(
					numberExtractor('-45,00'),
					Tuple.make(BigDecimal.make(-45n, 0), '-45,00')
				);
			});
		});

		describe('Allow scientific notation', () => {
			//Use withEngineeringScientificNotation to make sure that ScientificNotation.toReader is called properly
			const numberExtractor = pipe(
				frenchStyleThreeDecimalNumber,
				CVNumberBase10Format.withEngineeringScientificNotation(),
				CVNumberBase10Format.toBigDecimalExtractor
			);

			it('Only an exponent', () => {
				TEUtils.assertNone(numberExtractor('e12Dummy'));
			});

			it('An exponent that is not a multiple of 3', () => {
				TEUtils.assertNone(numberExtractor('512,45e13Dummy'));
			});

			it('A mantissa out of range', () => {
				TEUtils.assertNone(numberExtractor('1 512,45e12Dummy'));
				TEUtils.assertNone(numberExtractor('0,45Dummy'));
			});

			it('Zero', () => {
				TEUtils.assertSome(numberExtractor('0Dummy'), Tuple.make(BigDecimal.make(0n, 2), '0'));
			});

			it('A number respecting all conditions', () => {
				TEUtils.assertSome(
					numberExtractor('512,45e12Dummy'),
					Tuple.make(BigDecimal.make(51245n, -10), '512,45e12')
				);
			});
		});

		describe('ShowNullInteger part tests', () => {
			describe('True', () => {
				const numberExtractor = CVNumberBase10Format.toBigDecimalExtractor(
					frenchStyleThreeDecimalNumber
				);

				it('Non-null value with explicit 0', () => {
					TEUtils.assertSome(
						numberExtractor('-0,45Dummy'),
						Tuple.make(BigDecimal.make(-45n, 2), '-0,45')
					);
				});

				it('Null value', () => {
					TEUtils.assertSome(numberExtractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
				});

				it('Non-null value with implicit 0', () => {
					TEUtils.assertNone(numberExtractor('-,45Dummy'));
				});
			});

			describe('False', () => {
				const numberExtractor = pipe(
					frenchStyleThreeDecimalNumber,
					CVNumberBase10Format.withNullIntegerPartNotShowing(),
					CVNumberBase10Format.toBigDecimalExtractor
				);

				it('Non-null value with explicit 0', () => {
					TEUtils.assertNone(numberExtractor('-0,45Dummy'));
				});

				it('Null value', () => {
					TEUtils.assertSome(numberExtractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
				});

				it('Non-null value with implicit 0', () => {
					TEUtils.assertSome(
						numberExtractor('-,45Dummy'),
						Tuple.make(BigDecimal.make(-45n, 2), '-,45')
					);
				});
			});
		});

		describe('minimumFractionDigits tests', () => {
			describe('Two decimals', () => {
				const numberExtractor = pipe(
					frenchStyleThreeDecimalNumber,
					CVNumberBase10Format.withNDecimals(2),
					CVNumberBase10Format.toBigDecimalExtractor
				);

				it('No decimal', () => {
					TEUtils.assertNone(numberExtractor('8Dummy'));
				});

				it('One decimal', () => {
					TEUtils.assertNone(numberExtractor('8,1Dummy'));
				});

				it('Two decimals', () => {
					TEUtils.assertSome(
						numberExtractor('8,10Dummy'),
						Tuple.make(BigDecimal.make(81n, 1), '8,10')
					);
				});
			});
		});

		describe('maximumFractionDigits tests', () => {
			describe('Three decimals', () => {
				const numberExtractor = CVNumberBase10Format.toBigDecimalExtractor(
					frenchStyleThreeDecimalNumber
				);

				it('No decimal', () => {
					TEUtils.assertSome(numberExtractor('8Dummy'), Tuple.make(BigDecimal.make(8n, 0), '8'));
				});

				it('Three decimals', () => {
					TEUtils.assertSome(
						numberExtractor('8,100Dummy'),
						Tuple.make(BigDecimal.make(81n, 1), '8,100')
					);
				});

				it('Four decimals', () => {
					TEUtils.assertNone(numberExtractor('0,1234Dummy'));
				});
			});

			describe('Unbounded', () => {
				const numberExtractor = pipe(
					frenchStyleThreeDecimalNumber,
					CVNumberBase10Format.withMaxNDecimals(+Infinity),
					CVNumberBase10Format.toBigDecimalExtractor
				);

				it('Four decimals', () => {
					TEUtils.assertSome(
						numberExtractor('0,1234Dummy'),
						Tuple.make(BigDecimal.make(1234n, 4), '0,1234')
					);
				});
			});
		});
	});

	describe('toRealExtractor', () => {
		const numberExtractor = CVNumberBase10Format.toRealExtractor(frenchStyleThreeDecimalNumber);
		it('passing', () => {
			TEUtils.assertSome(
				numberExtractor('0,45Dummy'),
				Tuple.make(CVReal.unsafeFromNumber(0.45), '0,45')
			);
		});

		it('Not passing', () => {
			TEUtils.assertNone(numberExtractor('Dummy'));
		});
	});

	describe('toBigDecimalReader', () => {
		const numberReader = pipe(
			frenchStyleThreeDecimalNumber,
			CVNumberBase10Format.withStandardScientificNotation(),
			CVNumberBase10Format.toBigDecimalReader
		);
		it('Passing', () => {
			TEUtils.assertSome(numberReader('-45,45e-2'), BigDecimal.make(-4545n, 4));
		});

		it('Not passing', () => {
			TEUtils.assertNone(numberReader('-45,45e-'));
		});
	});

	describe('toRealReader', () => {
		const numberReader = CVNumberBase10Format.toRealReader(frenchStyleThreeDecimalNumber);
		it('Passing', () => {
			TEUtils.assertSome(numberReader('0,45'), CVReal.unsafeFromNumber(0.45));
		});

		it('Not passing', () => {
			TEUtils.assertNone(numberReader('0.45'));
		});
	});

	describe('toNumberWriter', () => {
		describe('General tests with frenchStyleThreeDecimalNumber', () => {
			const numberWriter = CVNumberBase10Format.toNumberWriter(frenchStyleThreeDecimalNumber);
			it('Zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(0)), '0');
			});

			it('Negative zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(-0.0004)), '-0');
			});

			it('Number with less than maximumFractionDigits decimals', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(1528.65)), '1 528,65');
			});

			it('BigDecimal as input, more than maximumFractionDigits decimals', () => {
				TEUtils.assertEquals(numberWriter(BigDecimal.make(-14675435n, 4)), '-1 467,544');
			});
		});

		describe('Tests with withNullIntegerPartNotShowing', () => {
			const numberWriter = pipe(
				frenchStyleThreeDecimalNumber,
				CVNumberBase10Format.withNullIntegerPartNotShowing(),
				CVNumberBase10Format.toNumberWriter
			);
			it('Zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(0)), '0');
			});

			it('Number rounded down to zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(-0.0004)), '-0');
			});

			it('Number rounded up from zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(0.0005)), ',001');
			});
		});

		describe('Tests with withNDecimals(2) and withNullIntegerPartNotShowing', () => {
			const numberWriter = pipe(
				frenchStyleThreeDecimalNumber,
				CVNumberBase10Format.withNDecimals(2),
				CVNumberBase10Format.withNullIntegerPartNotShowing(),
				CVNumberBase10Format.toNumberWriter
			);
			it('Zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(0)), ',00');
			});

			it('Number rounded down to zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(-0.004)), '-,00');
			});

			it('Number rounded up from zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(0.005)), ',01');
			});
		});

		describe('Tests with withEngineeringScientificNotation', () => {
			const numberWriter = pipe(
				frenchStyleThreeDecimalNumber,
				CVNumberBase10Format.withEngineeringScientificNotation(),
				CVNumberBase10Format.withMinNDecimals(2),
				CVNumberBase10Format.toNumberWriter
			);
			it('Negative Zero', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(-0)), '-0,00E0');
			});

			it('Big positive number', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(154321.5)), '154,322E3');
			});

			it('Small negative number', () => {
				TEUtils.assertEquals(numberWriter(CVReal.unsafeFromNumber(-523e-5)), '-5,23E-3');
			});
		});
	});
});
