import * as TestUtils from '@parischap/configs/TestUtils';
import { CVNumberBase10Format, CVReal } from '@parischap/conversions';
import { MBigDecimal, MNumber } from '@parischap/effect-lib';
import { BigDecimal, Option, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVNumberBase10Format', () => {
  const { frenchStyleNumber } = CVNumberBase10Format;
  const frenchStyleThreeDecimalNumberWithSignDisplayForNegative = pipe(
    frenchStyleNumber,
    CVNumberBase10Format.withSignDisplayForNegative,
  );

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVNumberBase10Format.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('SignDisplay', () => {
    describe('toParser', () => {
      describe('Auto', () => {
        const parser = CVNumberBase10Format.SignDisplay.toParser(
          CVNumberBase10Format.SignDisplay.Auto,
        );
        it('No sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
          TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
        });
        it('Minus sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
          TestUtils.assertSome(parser({ isZero: true, sign: '-' }), -1);
        });
        it('Plus sign', () => {
          TestUtils.assertNone(parser({ isZero: false, sign: '+' }));
          TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
        });
      });

      describe('Always', () => {
        const parser = CVNumberBase10Format.SignDisplay.toParser(
          CVNumberBase10Format.SignDisplay.Always,
        );
        it('No sign', () => {
          TestUtils.assertNone(parser({ isZero: false, sign: '' }));
          TestUtils.assertNone(parser({ isZero: true, sign: '' }));
        });
        it('Minus sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
          TestUtils.assertSome(parser({ isZero: true, sign: '-' }), -1);
        });
        it('Plus sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '+' }), 1);
          TestUtils.assertSome(parser({ isZero: true, sign: '+' }), 1);
        });
      });

      describe('ExceptZero', () => {
        const parser = CVNumberBase10Format.SignDisplay.toParser(
          CVNumberBase10Format.SignDisplay.ExceptZero,
        );
        it('No sign', () => {
          TestUtils.assertNone(parser({ isZero: false, sign: '' }));
          //TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
        });
        it('Minus sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
          TestUtils.assertNone(parser({ isZero: true, sign: '-' }));
        });
        it('Plus sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '+' }), 1);
          TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
        });
      });

      describe('Negative', () => {
        const parser = CVNumberBase10Format.SignDisplay.toParser(
          CVNumberBase10Format.SignDisplay.Negative,
        );
        it('No sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
          TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
        });
        it('Minus sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
          TestUtils.assertNone(parser({ isZero: true, sign: '-' }));
        });
        it('Plus sign', () => {
          TestUtils.assertNone(parser({ isZero: false, sign: '+' }));
          TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
        });
      });

      describe('Never', () => {
        const parser = CVNumberBase10Format.SignDisplay.toParser(
          CVNumberBase10Format.SignDisplay.Never,
        );
        it('No sign', () => {
          TestUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
          TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
        });
        it('Minus sign', () => {
          TestUtils.assertNone(parser({ isZero: false, sign: '-' }));
          TestUtils.assertNone(parser({ isZero: true, sign: '-' }));
        });
        it('Plus sign', () => {
          TestUtils.assertNone(parser({ isZero: false, sign: '+' }));
          TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
        });
      });
    });

    describe('toFormatter', () => {
      describe('Auto', () => {
        const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
          CVNumberBase10Format.SignDisplay.Auto,
        );
        it('Minus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
          TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
        });
        it('Plus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
          TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
        });
      });

      describe('Always', () => {
        const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
          CVNumberBase10Format.SignDisplay.Always,
        );
        it('Minus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
          TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
        });
        it('Plus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
          TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '+');
        });
      });

      describe('ExceptZero', () => {
        const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
          CVNumberBase10Format.SignDisplay.ExceptZero,
        );
        it('Minus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
          TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
        });
        it('Plus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
          TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
        });
      });

      describe('Negative', () => {
        const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
          CVNumberBase10Format.SignDisplay.Negative,
        );
        it('Minus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
          TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
        });
        it('Plus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
          TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
        });
      });

      describe('Never', () => {
        const formatter = CVNumberBase10Format.SignDisplay.toFormatter(
          CVNumberBase10Format.SignDisplay.Never,
        );
        it('Minus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '');
          TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
        });
        it('Plus sign', () => {
          TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
          TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
        });
      });
    });
  });

  describe('ScientificNotation', () => {
    describe('toParser', () => {
      describe('None', () => {
        const parser = CVNumberBase10Format.ScientificNotation.toParser(
          CVNumberBase10Format.ScientificNotation.None,
        );
        it('Empty string', () => {
          TestUtils.assertSome(parser(''), 0);
        });
        it('Value', () => {
          TestUtils.assertNone(parser('+15'));
        });
      });

      describe('Standard', () => {
        const parser = CVNumberBase10Format.ScientificNotation.toParser(
          CVNumberBase10Format.ScientificNotation.Standard,
        );
        it('Empty string', () => {
          TestUtils.assertSome(parser(''), 0);
        });
        it('Positive value', () => {
          TestUtils.assertSome(parser('+15'), 15);
        });
      });

      describe('Normalized', () => {
        const parser = CVNumberBase10Format.ScientificNotation.toParser(
          CVNumberBase10Format.ScientificNotation.Normalized,
        );
        it('Empty string', () => {
          TestUtils.assertSome(parser(''), 0);
        });
        it('Negative Value', () => {
          TestUtils.assertSome(parser('-15'), -15);
        });
      });

      describe('Engineering', () => {
        const parser = CVNumberBase10Format.ScientificNotation.toParser(
          CVNumberBase10Format.ScientificNotation.Engineering,
        );
        it('Empty string', () => {
          TestUtils.assertSome(parser(''), 0);
        });
        it('Multiple of 3', () => {
          TestUtils.assertSome(parser('15'), 15);
        });
        it('Non-multiple of 3', () => {
          TestUtils.assertNone(parser('16'));
        });
      });
    });

    describe('toMantissaChecker', () => {
      describe('None', () => {
        const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
          CVNumberBase10Format.ScientificNotation.None,
        );
        TestUtils.assertSome(pipe(checker(BigDecimal.make(15n, 1))));

        it('Standard', () => {
          const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
            CVNumberBase10Format.ScientificNotation.Standard,
          );
          TestUtils.assertSome(pipe(checker(BigDecimal.make(0n, 1))));
        });

        describe('Normalized', () => {
          const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
            CVNumberBase10Format.ScientificNotation.Normalized,
          );
          it('Passing', () => {
            TestUtils.assertSome(pipe(checker(BigDecimal.make(95n, 1))));
          });
          it('Not-passing', () => {
            TestUtils.assertNone(checker(BigDecimal.make(95n, 2)));
          });
        });

        describe('Engineering', () => {
          const checker = CVNumberBase10Format.ScientificNotation.toMantissaChecker(
            CVNumberBase10Format.ScientificNotation.Engineering,
          );
          it('Passing', () => {
            TestUtils.assertSome(pipe(checker(BigDecimal.make(59_527n, 2))));
          });
          it('Not-passing', () => {
            TestUtils.assertNone(checker(BigDecimal.make(100_198n, 2)));
          });
        });
      });

      describe('toMantissaAdjuster', () => {
        const aBigNumber = BigDecimal.make(15_654_543_234n, 2);
        const aSmallNumber = BigDecimal.make(-15n, 4);
        it('None', () => {
          const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
            CVNumberBase10Format.ScientificNotation.None,
          );
          TestUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
        });

        it('Standard', () => {
          const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
            CVNumberBase10Format.ScientificNotation.Standard,
          );
          TestUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
        });

        describe('Normalized', () => {
          const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
            CVNumberBase10Format.ScientificNotation.Normalized,
          );
          it('Big number', () => {
            TestUtils.assertEquals(adjuster(aBigNumber), [
              BigDecimal.make(15_654_543_234n, 10),
              Option.some(8),
            ]);
          });
          it('Small number', () => {
            TestUtils.assertEquals(adjuster(aSmallNumber), [
              BigDecimal.make(-15n, 1),
              Option.some(-3),
            ]);
          });
        });

        describe('Engineering', () => {
          const adjuster = CVNumberBase10Format.ScientificNotation.toMantissaAdjuster(
            CVNumberBase10Format.ScientificNotation.Engineering,
          );
          it('Big number', () => {
            TestUtils.assertEquals(adjuster(aBigNumber), [
              BigDecimal.make(15_654_543_234n, 8),
              Option.some(6),
            ]);
          });
          it('Small number', () => {
            TestUtils.assertEquals(adjuster(aSmallNumber), [
              BigDecimal.make(-15n, 1),
              Option.some(-3),
            ]);
          });
        });
      });
    });
  });

  describe('toDescription', () => {
    it('integer without location', () => {
      TestUtils.assertEquals(
        CVNumberBase10Format.toDescription(CVNumberBase10Format.integer),
        'potentially signed integer',
      );
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.ukStyleInteger,
          CVNumberBase10Format.withThousandSeparator('/'),
          CVNumberBase10Format.toDescription,
        ),
        'potentially signed integer',
      );
    });

    it('Signed integer', () => {
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.dutchStyleInteger,
          CVNumberBase10Format.withSignDisplay,
          CVNumberBase10Format.toDescription,
        ),
        'signed Dutch-style integer',
      );
    });

    it('Unsigned integer', () => {
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.dutchStyleInteger,
          CVNumberBase10Format.withoutSignDisplay,
          CVNumberBase10Format.toDescription,
        ),
        'unsigned Dutch-style integer',
      );
    });

    it('Number', () => {
      TestUtils.assertEquals(
        CVNumberBase10Format.toDescription(frenchStyleNumber),
        'potentially signed French-style number',
      );
    });

    it('Number with 2 decimal places in engineering notation', () => {
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.dutchStyleInteger,
          CVNumberBase10Format.withNDecimals(2),
          CVNumberBase10Format.withEngineeringScientificNotation,
          CVNumberBase10Format.toDescription,
        ),
        'potentially signed Dutch-style 2-decimal number in engineering notation',
      );
    });
  });

  describe('toBigDecimalExtractor', () => {
    describe('General tests with frenchStyleNumber', () => {
      const extractor = CVNumberBase10Format.toBigDecimalExtractor(frenchStyleNumber);
      it('String not starting by number', () => {
        TestUtils.assertNone(extractor('Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(extractor('- Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(extractor('-0Dummy'));
      });

      it('Unexpected fillChar', () => {
        TestUtils.assertNone(extractor('- 5Dummy'));
        TestUtils.assertNone(extractor(' 5Dummy'));
      });

      it('Unsigned mantissa with no integer part', () => {
        TestUtils.assertSome(extractor('0,45Dummy'), Tuple.make(BigDecimal.make(45n, 2), '0,45'));
      });

      it('Signed mantissa with no integer part', () => {
        TestUtils.assertSome(
          extractor('-0,45Dummy'),
          Tuple.make(BigDecimal.make(-45n, 2), '-0,45'),
        );
      });

      it('Signed mantissa with no fractional part', () => {
        TestUtils.assertSome(extractor('-45'), Tuple.make(BigDecimal.make(-45n, 0), '-45'));
      });

      it('Signed mantissa', () => {
        TestUtils.assertSome(extractor('-45,45'), Tuple.make(BigDecimal.make(-4545n, 2), '-45,45'));
      });

      it('Fractional part of mantissa starting with zeros', () => {
        TestUtils.assertSome(extractor('-45,00'), Tuple.make(BigDecimal.make(-45n, 0), '-45,00'));
      });
    });

    describe('Allow scientific notation', () => {
      //Use withEngineeringScientificNotation to make sure that ScientificNotation.toParser is called properly
      const extractor = pipe(
        frenchStyleNumber,
        CVNumberBase10Format.withEngineeringScientificNotation,
        CVNumberBase10Format.toBigDecimalExtractor,
      );

      it('Only an exponent', () => {
        TestUtils.assertNone(extractor('e12Dummy'));
      });

      it('An exponent that is not a multiple of 3', () => {
        TestUtils.assertNone(extractor('512,45e13Dummy'));
      });

      it('A mantissa out of range', () => {
        TestUtils.assertNone(extractor('1 512,45e12Dummy'));
        TestUtils.assertNone(extractor('0,45Dummy'));
      });

      it('Zero', () => {
        TestUtils.assertSome(extractor('0Dummy'), Tuple.make(BigDecimal.make(0n, 0), '0'));
      });

      it('A number respecting all conditions', () => {
        TestUtils.assertSome(
          extractor('512,45e12Dummy'),
          Tuple.make(BigDecimal.make(51_245n, -10), '512,45e12'),
        );
      });
    });

    describe('ShowNullInteger part tests', () => {
      describe('True', () => {
        const extractor = CVNumberBase10Format.toBigDecimalExtractor(frenchStyleNumber);

        it('Non-null value with explicit 0', () => {
          TestUtils.assertSome(
            extractor('-0,45Dummy'),
            Tuple.make(BigDecimal.make(-45n, 2), '-0,45'),
          );
        });

        it('Null value', () => {
          TestUtils.assertSome(extractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
        });

        it('Non-null value with implicit 0', () => {
          TestUtils.assertNone(extractor('-,45Dummy'));
        });
      });

      describe('False', () => {
        const extractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Format.withNullIntegerPartNotShowing,
          CVNumberBase10Format.toBigDecimalExtractor,
        );

        it('Non-null value with explicit 0', () => {
          TestUtils.assertNone(extractor('-0,45Dummy'));
        });

        it('Null value', () => {
          TestUtils.assertSome(extractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
        });

        it('Non-null value with implicit 0', () => {
          TestUtils.assertSome(
            extractor('-,45Dummy'),
            Tuple.make(BigDecimal.make(-45n, 2), '-,45'),
          );
        });
      });
    });

    describe('minimumFractionalDigits tests', () => {
      describe('Two decimals', () => {
        const extractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Format.withNDecimals(2),
          CVNumberBase10Format.toBigDecimalExtractor,
        );

        it('No decimal', () => {
          TestUtils.assertNone(extractor('8Dummy'));
        });

        it('One decimal', () => {
          TestUtils.assertNone(extractor('8,1Dummy'));
        });

        it('Two decimals', () => {
          TestUtils.assertSome(extractor('8,10Dummy'), Tuple.make(BigDecimal.make(81n, 1), '8,10'));
        });
      });
    });

    describe('maximumFractionalDigits tests', () => {
      describe('Three decimals', () => {
        const extractor = CVNumberBase10Format.toBigDecimalExtractor(frenchStyleNumber);

        it('No decimal', () => {
          TestUtils.assertSome(extractor('8Dummy'), Tuple.make(BigDecimal.make(8n, 0), '8'));
        });

        it('Three decimals', () => {
          TestUtils.assertSome(
            extractor('8,100Dummy'),
            Tuple.make(BigDecimal.make(81n, 1), '8,100'),
          );
        });

        it('Four decimals', () => {
          TestUtils.assertNone(extractor('0,1234Dummy'));
        });
      });

      describe('Unbounded', () => {
        const extractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Format.withMaxNDecimals(Infinity),
          CVNumberBase10Format.toBigDecimalExtractor,
        );

        it('Four decimals', () => {
          TestUtils.assertSome(
            extractor('0,1234Dummy'),
            Tuple.make(BigDecimal.make(1234n, 4), '0,1234'),
          );
        });
      });
    });

    describe('With a fillChar', () => {
      const extractor = CVNumberBase10Format.toBigDecimalExtractor(frenchStyleNumber, ' ');

      it('String not starting by number', () => {
        TestUtils.assertNone(extractor(' Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(extractor('- Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(extractor('-0Dummy'));
      });

      it('Negative value', () => {
        TestUtils.assertSome(extractor('- 5Dummy'), Tuple.make(BigDecimal.make(-5n, 0), '- 5'));
      });

      it('Positive value', () => {
        TestUtils.assertSome(extractor(' 5Dummy'), Tuple.make(BigDecimal.make(5n, 0), ' 5'));
      });
    });
  });

  describe('toRealExtractor', () => {
    const extractor = CVNumberBase10Format.toRealExtractor(frenchStyleNumber);
    it('passing', () => {
      TestUtils.assertSome(
        extractor('0,45Dummy'),
        Tuple.make(CVReal.unsafeFromNumber(0.45), '0,45'),
      );
    });

    it('Not passing', () => {
      TestUtils.assertNone(extractor('Dummy'));
    });
  });

  describe('toBigDecimalParser', () => {
    const parser = pipe(
      frenchStyleNumber,
      CVNumberBase10Format.withStandardScientificNotation,
      CVNumberBase10Format.toBigDecimalParser,
    );
    it('Passing', () => {
      TestUtils.assertSome(parser('-45,45e-2'), BigDecimal.make(-4545n, 4));
    });

    it('Not passing', () => {
      TestUtils.assertNone(parser('-45,45e-'));
    });
  });

  describe('toRealParser', () => {
    const parser = CVNumberBase10Format.toRealParser(
      frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
    );
    it('Passing', () => {
      TestUtils.assertSome(parser('0,45'), CVReal.unsafeFromNumber(0.45));
    });

    it('Zero', () => {
      TestUtils.assertSome(parser('0'), CVReal.unsafeFromNumber(0));
      TestUtils.assertSome(pipe('-0', parser, Option.map(MNumber.sign2)), -1);
    });

    it('Not passing', () => {
      TestUtils.assertNone(parser('0.45'));
    });
  });

  describe('toNumberFormatter', () => {
    describe('General tests with frenchStyleThreeDecimalNumberWithAutoSign', () => {
      const formatter = CVNumberBase10Format.toNumberFormatter(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
      );
      it('Zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), '0');
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0)), '-0');
        TestUtils.assertEquals(formatter(BigDecimal.make(-0n, 0)), '0');
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
      });

      it('Number with less than maximumFractionalDigits decimals', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(1528.65)), '1 528,65');
      });

      it('BigDecimal as input, more than maximumFractionalDigits decimals', () => {
        TestUtils.assertEquals(formatter(BigDecimal.make(-14_675_435n, 4)), '-1 467,544');
      });
    });

    describe('Tests with withNullIntegerPartNotShowing', () => {
      const formatter = pipe(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withNullIntegerPartNotShowing,
        CVNumberBase10Format.toNumberFormatter,
      );
      it('Zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), '0');
      });

      it('Number rounded down to zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
      });

      it('Number rounded up from zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0.0005)), ',001');
      });
    });

    describe('Tests with withNDecimals(2) and withNullIntegerPartNotShowing', () => {
      const formatter = pipe(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withNDecimals(2),
        CVNumberBase10Format.withNullIntegerPartNotShowing,
        CVNumberBase10Format.toNumberFormatter,
      );
      it('Zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), ',00');
      });

      it('Number rounded down to zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.004)), '-,00');
      });

      it('Number rounded up from zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0.005)), ',01');
      });
    });

    describe('Tests with withEngineeringScientificNotation', () => {
      const formatter = pipe(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withEngineeringScientificNotation,
        CVNumberBase10Format.withMinNDecimals(2),
        CVNumberBase10Format.toNumberFormatter,
      );
      it('Negative Zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0)), '-0,00e0');
      });

      it('Big positive number', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(154_321.5)), '154,322e3');
      });

      it('Small negative number', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-523e-5)), '-5,23e-3');
      });
    });
  });

  describe('toRealFormatter', () => {
    describe('General tests with frenchStyleThreeDecimalNumberWithAutoSign', () => {
      const formatter = CVNumberBase10Format.toNumberFormatter(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
      );
      it('Zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(0)), '0');
      });

      it('Negative zero', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
      });

      it('Number with less than maximumFractionalDigits decimals', () => {
        TestUtils.assertEquals(formatter(CVReal.unsafeFromNumber(1528.65)), '1 528,65');
      });

      it('BigDecimal as input, more than maximumFractionalDigits decimals', () => {
        TestUtils.assertEquals(formatter(BigDecimal.make(-14_675_435n, 4)), '-1 467,544');
      });
    });

    describe('Tests with withNullIntegerPartNotShowing', () => {
      const numberFormatter = pipe(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withNullIntegerPartNotShowing,
        CVNumberBase10Format.toNumberFormatter,
      );
      it('Zero', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0)), '0');
      });

      it('Number rounded down to zero', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-0.0004)), '-0');
      });

      it('Number rounded up from zero', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0.0005)), ',001');
      });
    });

    describe('Tests with withNDecimals(2) and withNullIntegerPartNotShowing', () => {
      const numberFormatter = pipe(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withNDecimals(2),
        CVNumberBase10Format.withNullIntegerPartNotShowing,
        CVNumberBase10Format.toNumberFormatter,
      );
      it('Zero', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0)), ',00');
      });

      it('Number rounded down to zero', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-0.004)), '-,00');
      });

      it('Number rounded up from zero', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(0.005)), ',01');
      });
    });

    describe('Tests with withEngineeringScientificNotation', () => {
      const numberFormatter = pipe(
        frenchStyleThreeDecimalNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withEngineeringScientificNotation,
        CVNumberBase10Format.withMinNDecimals(2),
        CVNumberBase10Format.toNumberFormatter,
      );
      it('Negative Zero', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-0)), '-0,00e0');
      });

      it('Big positive number', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(154_321.5)), '154,322e3');
      });

      it('Small negative number', () => {
        TestUtils.assertEquals(numberFormatter(CVReal.unsafeFromNumber(-523e-5)), '-5,23e-3');
      });
    });
  });
});
