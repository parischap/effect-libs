/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format } from '@parischap/conversions';
import { MBigDecimal } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, Equal, Option, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('NumberBase10Format', () => {
	const commaAndSpace = CVNumberBase10Format.commaAndSpace;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVNumberBase10Format.moduleTag
			);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertTrue(
					Equal.equals(commaAndSpace, CVNumberBase10Format.make({ ...commaAndSpace }))
				);
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(commaAndSpace, CVNumberBase10Format.commaAndDot));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(commaAndSpace.toString(), 'CommaAndSpace');
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(commaAndSpace.pipe(CVNumberBase10Format.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVNumberBase10Format.has(commaAndSpace));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVNumberBase10Format.has(new Date()));
			});
		});
	});

	describe('toNumberExtractor', () => {
		describe('Scientific notation tests', () => {
			it('None', () => {
				const numberExtractor = CVNumberBase10Format.toNumberExtractor(commaAndSpace);
				TEUtils.assertNone(numberExtractor('-45,45e-2Dummy'));
			});

			describe('Standard scientific notation', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withStandardScientificNotation,
					CVNumberBase10Format.toNumberExtractor
				);

				it('With no scientific notation', () => {
					TEUtils.assertEquals(
						numberExtractor('1 234 544,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(123454445n, 2), '1 234 544,45'))
					);
				});

				it('With scientific notation', () => {
					TEUtils.assertEquals(
						numberExtractor('-45,45e-2Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-4545n, 4), '-45,45e-2'))
					);
				});

				it('With mal-formed scientific notation', () => {
					TEUtils.assertEquals(
						numberExtractor('-45,45e-Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-4545n, 2), '-45,45'))
					);
				});
			});

			describe('Normalized scientific notation', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withNormalizedScientificNotation,
					CVNumberBase10Format.toNumberExtractor
				);

				describe('With no scientific notation', () => {
					it('Passing', () => {
						TEUtils.assertEquals(
							numberExtractor('-1,654Dummy'),
							Option.some(Tuple.make(BigDecimal.make(-1654n, 3), '-1,654'))
						);
					});

					it('Not passing', () => {
						TEUtils.assertNone(numberExtractor('21,654Dummy'));
					});
				});

				describe('With scientific notation', () => {
					it('Passing', () => {
						TEUtils.assertEquals(
							numberExtractor('-1,654e3Dummy'),
							Option.some(Tuple.make(BigDecimal.make(-1654n, 0), '-1,654e3'))
						);
					});

					it('Not passing', () => {
						TEUtils.assertNone(numberExtractor('0,654e3Dummy'));
					});
				});
			});

			describe('Engineering scientific notation', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withEngineeringScientificNotation,
					CVNumberBase10Format.toNumberExtractor
				);

				describe('With no scientific notation', () => {
					it('Passing', () => {
						TEUtils.assertEquals(
							numberExtractor('824Dummy'),
							Option.some(Tuple.make(BigDecimal.make(824n, 0), '824'))
						);
					});

					it('Not passing', () => {
						TEUtils.assertNone(numberExtractor('1 000,654Dummy'));
					});
				});

				describe('With scientific notation', () => {
					it('Passing', () => {
						TEUtils.assertEquals(
							numberExtractor('-543,6e3Dummy'),
							Option.some(Tuple.make(BigDecimal.make(-543600n, 0), '-543,6e3'))
						);
					});

					it('Not passing', () => {
						TEUtils.assertNone(numberExtractor('0,654e3Dummy'));
					});
				});
			});
		});

		describe('Sign display tests', () => {
			describe('Auto', () => {
				const numberExtractor = CVNumberBase10Format.toNumberExtractor(commaAndSpace);

				it('Negative non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('-544,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-54445n, 2), '-544,45'))
					);
				});

				it('Negative null value', () => {
					TEUtils.assertEquals(
						numberExtractor('-0Dummy'),
						Option.some(Tuple.make(BigDecimal.make(0n, 0), '-0'))
					);
				});

				it('Positive non-null value', () => {
					TEUtils.assertNone(numberExtractor('+0,45Dummy'));
				});

				it('Positive null value', () => {
					TEUtils.assertNone(numberExtractor('+0Dummy'));
				});

				it('Unsigned non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('45,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(4545n, 2), '45,45'))
					);
				});

				it('Unsigned null value', () => {
					TEUtils.assertEquals(
						numberExtractor('0Dummy'),
						Option.some(Tuple.make(BigDecimal.make(0n, 0), '0'))
					);
				});
			});

			describe('Always', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withSignDisplay,
					CVNumberBase10Format.toNumberExtractor
				);

				it('Negative non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('-544,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-54445n, 2), '-544,45'))
					);
				});

				it('Negative null value', () => {
					TEUtils.assertEquals(
						numberExtractor('-0,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-45n, 2), '-0,45'))
					);
				});

				it('Positive non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('+45,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(4545n, 2), '+45,45'))
					);
				});

				it('Positive null value', () => {
					TEUtils.assertEquals(
						numberExtractor('+0Dummy'),
						Option.some(Tuple.make(BigDecimal.make(0n, 0), '+0'))
					);
				});

				it('Unsigned non-null value', () => {
					TEUtils.assertNone(numberExtractor('45,45Dummy'));
				});

				it('Unsigned null value', () => {
					TEUtils.assertNone(numberExtractor('0Dummy'));
				});
			});

			describe('ExceptZero', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withSignDisplayExceptZero,
					CVNumberBase10Format.toNumberExtractor
				);

				it('Negative non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('-544,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-54445n, 2), '-544,45'))
					);
				});

				it('Negative null value', () => {
					TEUtils.assertNone(numberExtractor('-0Dummy'));
				});

				it('Positive non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('+45,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(4545n, 2), '+45,45'))
					);
				});

				it('Positive null value', () => {
					TEUtils.assertNone(numberExtractor('+0Dummy'));
				});

				it('Unsigned non-null value', () => {
					TEUtils.assertNone(numberExtractor('45,45Dummy'));
				});

				it('Unsigned null value', () => {
					TEUtils.assertEquals(
						numberExtractor('0Dummy'),
						Option.some(Tuple.make(BigDecimal.make(0n, 0), '0'))
					);
				});
			});

			describe('Negative', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withSignDisplayForNegativeExceptZero,
					CVNumberBase10Format.toNumberExtractor
				);

				it('Negative non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('-544,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-54445n, 2), '-544,45'))
					);
				});

				it('Negative null value', () => {
					TEUtils.assertNone(numberExtractor('-0Dummy'));
				});

				it('Positive non-null value', () => {
					TEUtils.assertNone(numberExtractor('+45,45Dummy'));
				});

				it('Positive null value', () => {
					TEUtils.assertNone(numberExtractor('+0Dummy'));
				});

				it('Unsigned non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('45,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(4545n, 2), '45,45'))
					);
				});

				it('Unsigned null value', () => {
					TEUtils.assertEquals(
						numberExtractor('0Dummy'),
						Option.some(Tuple.make(BigDecimal.make(0n, 0), '0'))
					);
				});
			});

			describe('Never', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withoutSignDisplay,
					CVNumberBase10Format.toNumberExtractor
				);

				it('Negative non-null value', () => {
					TEUtils.assertNone(numberExtractor('-544,45Dummy'));
				});

				it('Negative null value', () => {
					TEUtils.assertNone(numberExtractor('-0Dummy'));
				});

				it('Positive non-null value', () => {
					TEUtils.assertNone(numberExtractor('+45,45Dummy'));
				});

				it('Positive null value', () => {
					TEUtils.assertNone(numberExtractor('+0Dummy'));
				});

				it('Unsigned non-null value', () => {
					TEUtils.assertEquals(
						numberExtractor('45,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(4545n, 2), '45,45'))
					);
				});

				it('Unsigned null value', () => {
					TEUtils.assertEquals(
						numberExtractor('0Dummy'),
						Option.some(Tuple.make(BigDecimal.make(0n, 0), '0'))
					);
				});
			});
		});

		describe('ShowNullInteger part tests', () => {
			describe('True', () => {
				const numberExtractor = CVNumberBase10Format.toNumberExtractor(commaAndSpace);

				it('Non-null value with explicit 0', () => {
					TEUtils.assertEquals(
						numberExtractor('-0,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-45n, 2), '-0,45'))
					);
				});

				it('Null value', () => {
					TEUtils.assertEquals(
						numberExtractor('0Dummy'),
						Option.some(Tuple.make(MBigDecimal.zero, '0'))
					);
				});

				it('Non-null value with implicit 0', () => {
					TEUtils.assertNone(numberExtractor('-,45Dummy'));
				});
			});

			describe('False', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withNullIntegerPartNotShowing,
					CVNumberBase10Format.toNumberExtractor
				);

				it('Non-null value with explicit 0', () => {
					TEUtils.assertNone(numberExtractor('-0,45Dummy'));
				});

				it('Null value', () => {
					TEUtils.assertEquals(
						numberExtractor('0Dummy'),
						Option.some(Tuple.make(MBigDecimal.zero, '0'))
					);
				});

				it('Non-null value with implicit 0', () => {
					TEUtils.assertEquals(
						numberExtractor('-,45Dummy'),
						Option.some(Tuple.make(BigDecimal.make(-45n, 2), '-,45'))
					);
				});
			});
		});

		describe('minimumFractionDigits tests', () => {
			describe('Two decimals', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withTwoDecimals,
					CVNumberBase10Format.toNumberExtractor
				);

				it('No decimal', () => {
					TEUtils.assertNone(numberExtractor('8Dummy'));
				});

				it('One decimal', () => {
					TEUtils.assertNone(numberExtractor('8,1Dummy'));
				});

				it('Two decimals', () => {
					TEUtils.assertEquals(
						numberExtractor('8,10Dummy'),
						Option.some(Tuple.make(BigDecimal.make(81n, 1), '8,10'))
					);
				});
			});
		});

		describe('maximumFractionDigits tests', () => {
			describe('Three decimals', () => {
				const numberExtractor = CVNumberBase10Format.toNumberExtractor(commaAndSpace);

				it('No decimal', () => {
					TEUtils.assertEquals(
						numberExtractor('8Dummy'),
						Option.some(Tuple.make(BigDecimal.make(8n, 0), '8'))
					);
				});

				it('Three decimals', () => {
					TEUtils.assertEquals(
						numberExtractor('8,100Dummy'),
						Option.some(Tuple.make(BigDecimal.make(81n, 1), '8,100'))
					);
				});

				it('Four decimals', () => {
					TEUtils.assertNone(numberExtractor('0,1234Dummy'));
				});
			});

			describe('Unbounded', () => {
				const numberExtractor = pipe(
					commaAndSpace,
					CVNumberBase10Format.withUnlimitedDecimals,
					CVNumberBase10Format.toNumberExtractor
				);

				it('Four decimals', () => {
					TEUtils.assertEquals(
						numberExtractor('0,1234Dummy'),
						Option.some(Tuple.make(BigDecimal.make(1234n, 4), '0,1234'))
					);
				});
			});
		});

		describe('General tests', () => {
			const numberExtractor = CVNumberBase10Format.toNumberExtractor(commaAndSpace);

			it('String not starting by number', () => {
				TEUtils.assertNone(numberExtractor('Dummy'));
			});

			it('Only a sign', () => {
				TEUtils.assertNone(numberExtractor('+ Dummy'));
			});

			it('Only an exponent', () => {
				TEUtils.assertNone(numberExtractor('e12 Dummy'));
			});

			it('Unsigned mantissa with no integer part', () => {
				TEUtils.assertEquals(
					numberExtractor('0,45Dummy'),
					Option.some(Tuple.make(BigDecimal.make(45n, 2), '0,45'))
				);
			});

			it('Signed mantissa with no integer part', () => {
				TEUtils.assertEquals(
					numberExtractor('-0,45Dummy'),
					Option.some(Tuple.make(BigDecimal.make(-45n, 2), '-0,45'))
				);
			});

			it('Signed mantissa with no fractional part', () => {
				TEUtils.assertEquals(
					numberExtractor('-45'),
					Option.some(Tuple.make(BigDecimal.make(-45n, 0), '-45'))
				);
			});

			it('Signed mantissa', () => {
				TEUtils.assertEquals(
					numberExtractor('-45,45'),
					Option.some(Tuple.make(BigDecimal.make(-4545n, 2), '-45,45'))
				);
			});
		});
	});

	describe('toNumberReader', () => {
		const numberReader = pipe(
			commaAndSpace,
			CVNumberBase10Format.withStandardScientificNotation,
			CVNumberBase10Format.toNumberReader
		);
		it('Passing', () => {
			TEUtils.assertEquals(numberReader('-45,45e-2'), Option.some(BigDecimal.make(-4545n, 4)));
		});

		it('Not passing', () => {
			TEUtils.assertNone(numberReader('-45,45e-'));
		});
	});
});
