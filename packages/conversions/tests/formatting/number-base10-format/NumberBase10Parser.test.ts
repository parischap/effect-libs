import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVNumberBase10Parser from '@parischap/conversions/CVNumberBase10Parser';
import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import { pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';
import { describe, expect, it } from 'vitest';

describe('CVNumberBase10Parser', () => {
  const { frenchStyleNumber } = CVNumberBase10Format;

  describe('moduleTag and .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVNumberBase10Parser.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('description', () => {
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.integer,
          CVNumberBase10Parser.fromFormat,
          CVNumberBase10Parser.description,
        ),
        'potentially signed integer parser',
      );
    });
  });

  describe('extractAsBigDecimal', () => {
    describe('General test', () => {
      const bigDecimalExtractor = pipe(
        frenchStyleNumber,
        CVNumberBase10Parser.fromFormat,
        CVNumberBase10Parser.extractAsBigDecimal,
      );

      it('String not starting by number', () => {
        TestUtils.assertNone(bigDecimalExtractor('Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(bigDecimalExtractor('- Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(bigDecimalExtractor('-0Dummy'));
      });

      it('Unexpected fillChar', () => {
        TestUtils.assertNone(bigDecimalExtractor('- 5Dummy'));
        TestUtils.assertNone(bigDecimalExtractor(' 5Dummy'));
      });

      it('Unsigned mantissa with no integer part', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('0,45Dummy'),
          Tuple.make(BigDecimal.make(45n, 2), '0,45'),
        );
      });

      it('Signed mantissa with no integer part', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('-0,45Dummy'),
          Tuple.make(BigDecimal.make(-45n, 2), '-0,45'),
        );
      });

      it('Signed mantissa with no fractional part', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('-45'),
          Tuple.make(BigDecimal.make(-45n, 0), '-45'),
        );
      });

      it('Signed mantissa', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('-45,45'),
          Tuple.make(BigDecimal.make(-4545n, 2), '-45,45'),
        );
      });

      it('Fractional part of mantissa starting with zeros', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('-45,00'),
          Tuple.make(BigDecimal.make(-45n, 0), '-45,00'),
        );
      });
    });

    describe('Allow scientific notation', () => {
      //Use withEngineeringScientificNotation to make sure that ScientificNotation.toParser is called properly
      const bigDecimalExtractor = pipe(
        frenchStyleNumber,
        CVNumberBase10Format.withEngineeringScientificNotation,
        CVNumberBase10Parser.fromFormat,
        CVNumberBase10Parser.extractAsBigDecimal,
      );

      it('Only an exponent', () => {
        TestUtils.assertNone(bigDecimalExtractor('e12Dummy'));
      });

      it('An exponent that is not a multiple of 3', () => {
        TestUtils.assertNone(bigDecimalExtractor('512,45e13Dummy'));
      });

      it('A mantissa out of range', () => {
        TestUtils.assertNone(bigDecimalExtractor('1 512,45e12Dummy'));
        TestUtils.assertNone(bigDecimalExtractor('0,45Dummy'));
      });

      it('Zero', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('0Dummy'),
          Tuple.make(BigDecimal.make(0n, 0), '0'),
        );
      });

      it('A number respecting all conditions', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('512,45e12Dummy'),
          Tuple.make(BigDecimal.make(51_245n, -10), '512,45e12'),
        );
      });
    });

    describe('ShowNullInteger part tests', () => {
      describe('True', () => {
        const bigDecimalExtractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Parser.fromFormat,
          CVNumberBase10Parser.extractAsBigDecimal,
        );
        it('Non-null value with explicit 0', () => {
          TestUtils.assertSome(
            bigDecimalExtractor('-0,45Dummy'),
            Tuple.make(BigDecimal.make(-45n, 2), '-0,45'),
          );
        });

        it('Null value', () => {
          TestUtils.assertSome(bigDecimalExtractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
        });

        it('Non-null value with implicit 0', () => {
          TestUtils.assertNone(bigDecimalExtractor('-,45Dummy'));
        });
      });

      describe('False', () => {
        const bigDecimalExtractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Format.withNullIntegerPartNotShowing,
          CVNumberBase10Parser.fromFormat,
          CVNumberBase10Parser.extractAsBigDecimal,
        );

        it('Non-null value with explicit 0', () => {
          TestUtils.assertNone(bigDecimalExtractor('-0,45Dummy'));
        });

        it('Null value', () => {
          TestUtils.assertSome(bigDecimalExtractor('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
        });

        it('Non-null value with implicit 0', () => {
          TestUtils.assertSome(
            bigDecimalExtractor('-,45Dummy'),
            Tuple.make(BigDecimal.make(-45n, 2), '-,45'),
          );
        });
      });
    });

    describe('minimumFractionalDigits tests', () => {
      describe('Two decimals', () => {
        const bigDecimalExtractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Format.withNDecimals(2),
          CVNumberBase10Parser.fromFormat,
          CVNumberBase10Parser.extractAsBigDecimal,
        );

        it('No decimal', () => {
          TestUtils.assertNone(bigDecimalExtractor('8Dummy'));
        });

        it('One decimal', () => {
          TestUtils.assertNone(bigDecimalExtractor('8,1Dummy'));
        });

        it('Two decimals', () => {
          TestUtils.assertSome(
            bigDecimalExtractor('8,10Dummy'),
            Tuple.make(BigDecimal.make(81n, 1), '8,10'),
          );
        });
      });
    });

    describe('maximumFractionalDigits tests', () => {
      describe('Three decimals', () => {
        const bigDecimalExtractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Parser.fromFormat,
          CVNumberBase10Parser.extractAsBigDecimal,
        );

        it('No decimal', () => {
          TestUtils.assertSome(
            bigDecimalExtractor('8Dummy'),
            Tuple.make(BigDecimal.make(8n, 0), '8'),
          );
        });

        it('Three decimals', () => {
          TestUtils.assertSome(
            bigDecimalExtractor('8,100Dummy'),
            Tuple.make(BigDecimal.make(81n, 1), '8,100'),
          );
        });

        it('Four decimals', () => {
          TestUtils.assertNone(bigDecimalExtractor('0,1234Dummy'));
        });
      });

      describe('Unbounded', () => {
        const bigDecimalExtractor = pipe(
          frenchStyleNumber,
          CVNumberBase10Format.withMaxNDecimals(Infinity),
          CVNumberBase10Parser.fromFormat,
          CVNumberBase10Parser.extractAsBigDecimal,
        );

        it('Four decimals', () => {
          TestUtils.assertSome(
            bigDecimalExtractor('0,1234Dummy'),
            Tuple.make(BigDecimal.make(1234n, 4), '0,1234'),
          );
        });
      });
    });

    describe('With 0 as fillChar', () => {
      const bigDecimalExtractor = pipe(
        frenchStyleNumber,
        CVNumberBase10Format.zeroPadded(2),
        CVNumberBase10Format.withSignDisplayForNegative,
        CVNumberBase10Parser.fromFormat,
        CVNumberBase10Parser.extractAsBigDecimal,
      );

      it('String not starting by number', () => {
        TestUtils.assertNone(bigDecimalExtractor('Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(bigDecimalExtractor('-Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(bigDecimalExtractor('-0Dummy'));
      });

      it('Single negative number', () => {
        TestUtils.assertNone(bigDecimalExtractor('-5Dummy'));
      });

      it('Single positive number', () => {
        TestUtils.assertNone(bigDecimalExtractor('5Dummy'));
      });

      it('Too big positive value', () => {
        TestUtils.assertNone(bigDecimalExtractor('150,45Dummy'));
      });

      it('Negative double zero', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('-00Dummy'),
          Tuple.make(BigDecimal.make(0n, 0), '-00'),
        );
      });

      it('Negative value', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('-05Dummy'),
          Tuple.make(BigDecimal.make(-5n, 0), '-05'),
        );
      });

      it('Positive value', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('05Dummy'),
          Tuple.make(BigDecimal.make(5n, 0), '05'),
        );
      });

      it('Real value', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('05,35Dummy'),
          Tuple.make(BigDecimal.make(535n, 2), '05,35'),
        );
      });
    });

    describe('With space as fillChar', () => {
      const bigDecimalExtractor = pipe(
        frenchStyleNumber,
        CVNumberBase10Format.spacePadded(2),
        CVNumberBase10Format.withSignDisplayForNegative,
        CVNumberBase10Parser.fromFormat,
        CVNumberBase10Parser.extractAsBigDecimal,
      );

      it('String not starting by number', () => {
        TestUtils.assertNone(bigDecimalExtractor('Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(bigDecimalExtractor('-Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(bigDecimalExtractor('- Dummy'));
      });

      it('Single negative number', () => {
        TestUtils.assertNone(bigDecimalExtractor('-5Dummy'));
      });

      it('Single positive number', () => {
        TestUtils.assertNone(bigDecimalExtractor('5Dummy'));
      });

      it('Two spaces', () => {
        TestUtils.assertNone(bigDecimalExtractor('  Dummy'));
      });

      it('Too big negative value', () => {
        TestUtils.assertNone(bigDecimalExtractor('-150,45Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('- 0Dummy'),
          Tuple.make(BigDecimal.make(0n, 0), '- 0'),
        );
      });

      it('Negative value', () => {
        TestUtils.assertSome(
          bigDecimalExtractor('-15Dummy'),
          Tuple.make(BigDecimal.make(-15n, 0), '-15'),
        );
      });

      it('Positive value', () => {
        TestUtils.assertSome(
          bigDecimalExtractor(' 5Dummy'),
          Tuple.make(BigDecimal.make(5n, 0), ' 5'),
        );
      });

      it('Real value', () => {
        TestUtils.assertSome(
          bigDecimalExtractor(' 5,35Dummy'),
          Tuple.make(BigDecimal.make(535n, 2), ' 5,35'),
        );
      });
    });
  });

  describe('extractAsBigDecimalOrThrow', () => {
    const bigDecimalExtractor = pipe(
      frenchStyleNumber,
      CVNumberBase10Parser.fromFormat,
      CVNumberBase10Parser.extractAsBigDecimalOrThrow,
    );

    it('passing', () => {
      TestUtils.assertEquals(
        bigDecimalExtractor('0,45Dummy'),
        Tuple.make(BigDecimal.make(45n, 2), '0,45'),
      );
    });

    it('Not passing', () => {
      expect(() => bigDecimalExtractor('Dummy')).toThrow();
    });
  });

  describe('extractAsNumber', () => {
    const numberExtractor = pipe(
      frenchStyleNumber,
      CVNumberBase10Parser.fromFormat,
      CVNumberBase10Parser.extractAsNumber,
    );

    it('passing', () => {
      TestUtils.assertSome(numberExtractor('0,45Dummy'), Tuple.make(0.45, '0,45'));
    });

    it('Not passing', () => {
      TestUtils.assertNone(numberExtractor('Dummy'));
    });
  });

  describe('extractAsNumberOrThrow', () => {
    const numberExtractor = pipe(
      frenchStyleNumber,
      CVNumberBase10Parser.fromFormat,
      CVNumberBase10Parser.extractAsNumberOrThrow,
    );

    it('passing', () => {
      TestUtils.assertEquals(numberExtractor('0,45Dummy'), Tuple.make(0.45, '0,45'));
    });

    it('Not passing', () => {
      expect(() => numberExtractor('Dummy')).toThrow();
    });
  });

  describe('parseAsBigDecimal', () => {
    const bigDecimalParser = pipe(
      frenchStyleNumber,
      CVNumberBase10Parser.fromFormat,
      CVNumberBase10Parser.parseAsBigDecimal,
    );

    it('passing', () => {
      TestUtils.assertSome(bigDecimalParser('45,50'), BigDecimal.make(4550n, 2));
    });

    it('Not passing (extra characters)', () => {
      TestUtils.assertNone(bigDecimalParser('45,50Dummy'));
    });
  });

  describe('parseAsBigDecimalOrThrow', () => {
    const bigDecimalParser = pipe(
      frenchStyleNumber,
      CVNumberBase10Parser.fromFormat,
      CVNumberBase10Parser.parseAsBigDecimalOrThrow,
    );

    it('passing', () => {
      TestUtils.assertEquals(bigDecimalParser('45,50'), BigDecimal.make(4550n, 2));
    });

    it('Not passing', () => {
      expect(() => bigDecimalParser('45,50Dummy')).toThrow();
    });
  });

  describe('parseAsNumber', () => {
    const numberParser = pipe(
      frenchStyleNumber,
      CVNumberBase10Parser.fromFormat,
      CVNumberBase10Parser.parseAsNumber,
    );

    it('passing', () => {
      TestUtils.assertSome(numberParser('45,50'), 45.5);
    });

    it('Not passing (extra characters)', () => {
      TestUtils.assertNone(numberParser('45,50Dummy'));
    });
  });

  describe('parseAsNumberOrThrow', () => {
    const numberParser = pipe(
      frenchStyleNumber,
      CVNumberBase10Parser.fromFormat,
      CVNumberBase10Parser.parseAsNumberOrThrow,
    );

    it('passing', () => {
      TestUtils.assertEquals(numberParser('45,50'), 45.5);
    });

    it('Not passing', () => {
      expect(() => numberParser('45,50Dummy')).toThrow();
    });
  });
});
