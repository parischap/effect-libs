import { assert, describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as Tuple from 'effect/Tuple';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';

describe('MBigDecimal', () => {
  describe('fromPrimitiveOption', () => {
    const fromPrimitiveOption = MBigDecimal.fromPrimitiveOption(4);
    it('Passing', () => {
      TestUtils.assertSome(fromPrimitiveOption(10), BigDecimal.make(10n, 4));
    });
    it('Non-integer number', () => {
      TestUtils.assertNone(fromPrimitiveOption(10.4));
    });
    it('Negative Infinity', () => {
      TestUtils.assertNone(fromPrimitiveOption(-Infinity));
    });
    it('NaN', () => {
      TestUtils.assertNone(fromPrimitiveOption(Number.NaN));
    });
  });

  describe('zero', () => {
    it('Equals BigDecimal.make(0n, 0)', () => {
      TestUtils.assertEquals(MBigDecimal.zero, BigDecimal.make(0n, 0));
    });
  });

  describe('trunc', () => {
    it('Number that does not need to be truncated', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(545n, 1), MBigDecimal.trunc(2)),
        BigDecimal.make(545n, 1),
      );
    });

    it('Positive number, first fractional digit < 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(544n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(54n, 2),
      );
    });

    it('Positive number, first fractional digit >= 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(545n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(54n, 2),
      );
    });

    it('Negative number, first fractional digit < 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(-544n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(-54n, 2),
      );
    });

    it('Negative number, first fractional digit >= 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(-545n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(-54n, 2),
      );
    });
  });

  describe('truncatedAndFollowingParts', () => {
    const truncatedAndFollowingParts = MBigDecimal.truncatedAndFollowingParts(1);
    it('Positive number, first fractional digit < 5', () => {
      assert.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(544n, 2)), [
        BigDecimal.make(54n, 1),
        BigDecimal.make(4n, 2),
      ]);
    });

    it('Positive number, first fractional digit >= 5', () => {
      assert.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(545n, 2)), [
        BigDecimal.make(54n, 1),
        BigDecimal.make(5n, 2),
      ]);
    });

    it('Negative number, first fractional digit < 5', () => {
      assert.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(-544n, 2)), [
        BigDecimal.make(-54n, 1),
        BigDecimal.make(-4n, 2),
      ]);
    });

    it('Negative number, first fractional digit >= 5', () => {
      assert.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(-545n, 2)), [
        BigDecimal.make(-54n, 1),
        BigDecimal.make(-5n, 2),
      ]);
    });
  });

  describe('round', () => {
    const round = MBigDecimal.round(3, MBigDecimal.RoundingOption.HalfEven);
    it('Even number', () => {
      TestUtils.assertEquals(round(BigDecimal.make(4566n, 4)), BigDecimal.make(457n, 3));
    });
    it('Odd number', () => {
      TestUtils.assertEquals(round(BigDecimal.make(-4564n, 4)), BigDecimal.make(-456n, 3));
    });
  });

  describe('extractFromString', () => {
    const { frenchStyleNumber } = MNumberBase10Format;

    describe('General test', () => {
      const extractFromString = MBigDecimal.extractFromString(frenchStyleNumber);

      it('String not starting by number', () => {
        TestUtils.assertNone(extractFromString('Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(extractFromString('- Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(extractFromString('-0Dummy'));
      });

      it('Unexpected fillChar', () => {
        TestUtils.assertNone(extractFromString('- 5Dummy'));
        TestUtils.assertNone(extractFromString(' 5Dummy'));
      });

      it('Unsigned mantissa with no integer part', () => {
        TestUtils.assertSome(
          extractFromString('0,45Dummy'),
          Tuple.make(BigDecimal.make(45n, 2), '0,45'),
        );
      });

      it('Signed mantissa with no integer part', () => {
        TestUtils.assertSome(
          extractFromString('-0,45Dummy'),
          Tuple.make(BigDecimal.make(-45n, 2), '-0,45'),
        );
      });

      it('Signed mantissa with no fractional part', () => {
        TestUtils.assertSome(
          extractFromString('-45'),
          Tuple.make(BigDecimal.make(-45n, 0), '-45'),
        );
      });

      it('Signed mantissa', () => {
        TestUtils.assertSome(
          extractFromString('-45,45'),
          Tuple.make(BigDecimal.make(-4545n, 2), '-45,45'),
        );
      });

      it('Fractional part of mantissa starting with zeros', () => {
        TestUtils.assertSome(
          extractFromString('-45,00'),
          Tuple.make(BigDecimal.make(-45n, 0), '-45,00'),
        );
      });
    });

    describe('Allow scientific notation', () => {
      //Use withEngineeringScientificNotation to make sure that ScientificNotation.toParser is called properly
      const extractFromString = MBigDecimal.extractFromString(
        pipe(frenchStyleNumber, MNumberBase10Format.withEngineeringScientificNotation),
      );

      it('Only an exponent', () => {
        TestUtils.assertNone(extractFromString('e12Dummy'));
      });

      it('An exponent that is not a multiple of 3', () => {
        TestUtils.assertNone(extractFromString('512,45e13Dummy'));
      });

      it('A mantissa out of range', () => {
        TestUtils.assertNone(extractFromString('1 512,45e12Dummy'));
        TestUtils.assertNone(extractFromString('0,45Dummy'));
      });

      it('Zero', () => {
        TestUtils.assertSome(extractFromString('0Dummy'), Tuple.make(BigDecimal.make(0n, 0), '0'));
      });

      it('A number respecting all conditions', () => {
        TestUtils.assertSome(
          extractFromString('512,45e12Dummy'),
          Tuple.make(BigDecimal.make(51_245n, -10), '512,45e12'),
        );
      });
    });

    describe('ShowNullInteger part tests', () => {
      describe('True', () => {
        const extractFromString = MBigDecimal.extractFromString(frenchStyleNumber);
        it('Non-null value with explicit 0', () => {
          TestUtils.assertSome(
            extractFromString('-0,45Dummy'),
            Tuple.make(BigDecimal.make(-45n, 2), '-0,45'),
          );
        });

        it('Null value', () => {
          TestUtils.assertSome(extractFromString('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
        });

        it('Non-null value with implicit 0', () => {
          TestUtils.assertNone(extractFromString('-,45Dummy'));
        });
      });

      describe('False', () => {
        const extractFromString = MBigDecimal.extractFromString(
          pipe(frenchStyleNumber, MNumberBase10Format.withNullIntegerPartNotShowing),
        );

        it('Non-null value with explicit 0', () => {
          TestUtils.assertNone(extractFromString('-0,45Dummy'));
        });

        it('Null value', () => {
          TestUtils.assertSome(extractFromString('0Dummy'), Tuple.make(MBigDecimal.zero, '0'));
        });

        it('Non-null value with implicit 0', () => {
          TestUtils.assertSome(
            extractFromString('-,45Dummy'),
            Tuple.make(BigDecimal.make(-45n, 2), '-,45'),
          );
        });
      });
    });

    describe('minimumFractionalDigits tests', () => {
      describe('Two decimals', () => {
        const extractFromString = MBigDecimal.extractFromString(
          pipe(frenchStyleNumber, MNumberBase10Format.withNDecimals(2)),
        );

        it('No decimal', () => {
          TestUtils.assertNone(extractFromString('8Dummy'));
        });

        it('One decimal', () => {
          TestUtils.assertNone(extractFromString('8,1Dummy'));
        });

        it('Two decimals', () => {
          TestUtils.assertSome(
            extractFromString('8,10Dummy'),
            Tuple.make(BigDecimal.make(81n, 1), '8,10'),
          );
        });
      });
    });

    describe('maximumFractionalDigits tests', () => {
      describe('Three decimals', () => {
        const extractFromString = MBigDecimal.extractFromString(frenchStyleNumber);

        it('No decimal', () => {
          TestUtils.assertSome(
            extractFromString('8Dummy'),
            Tuple.make(BigDecimal.make(8n, 0), '8'),
          );
        });

        it('Three decimals', () => {
          TestUtils.assertSome(
            extractFromString('8,100Dummy'),
            Tuple.make(BigDecimal.make(81n, 1), '8,100'),
          );
        });

        it('Four decimals', () => {
          TestUtils.assertNone(extractFromString('0,1234Dummy'));
        });
      });

      describe('Unbounded', () => {
        const extractFromString = MBigDecimal.extractFromString(
          pipe(frenchStyleNumber, MNumberBase10Format.withMaxNDecimals(Infinity)),
        );

        it('Four decimals', () => {
          TestUtils.assertSome(
            extractFromString('0,1234Dummy'),
            Tuple.make(BigDecimal.make(1234n, 4), '0,1234'),
          );
        });
      });
    });

    describe('With 0 as fillChar', () => {
      const extractFromString = MBigDecimal.extractFromString(
        pipe(
          frenchStyleNumber,
          MNumberBase10Format.zeroPadded(2),
          MNumberBase10Format.withSignDisplayForNegative,
        ),
      );

      it('String not starting by number', () => {
        TestUtils.assertNone(extractFromString('Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(extractFromString('-Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(extractFromString('-0Dummy'));
      });

      it('Single negative number', () => {
        TestUtils.assertNone(extractFromString('-5Dummy'));
      });

      it('Single positive number', () => {
        TestUtils.assertNone(extractFromString('5Dummy'));
      });

      it('Too big positive value', () => {
        TestUtils.assertNone(extractFromString('150,45Dummy'));
      });

      it('Negative double zero', () => {
        TestUtils.assertSome(
          extractFromString('-00Dummy'),
          Tuple.make(BigDecimal.make(0n, 0), '-00'),
        );
      });

      it('Negative value', () => {
        TestUtils.assertSome(
          extractFromString('-05Dummy'),
          Tuple.make(BigDecimal.make(-5n, 0), '-05'),
        );
      });

      it('Positive value', () => {
        TestUtils.assertSome(
          extractFromString('05Dummy'),
          Tuple.make(BigDecimal.make(5n, 0), '05'),
        );
      });

      it('Real value', () => {
        TestUtils.assertSome(
          extractFromString('05,35Dummy'),
          Tuple.make(BigDecimal.make(535n, 2), '05,35'),
        );
      });
    });

    describe('With space as fillChar', () => {
      const extractFromString = MBigDecimal.extractFromString(
        pipe(
          frenchStyleNumber,
          MNumberBase10Format.spacePadded(2),
          MNumberBase10Format.withSignDisplayForNegative,
        ),
      );

      it('String not starting by number', () => {
        TestUtils.assertNone(extractFromString('Dummy'));
      });

      it('Only a sign', () => {
        TestUtils.assertNone(extractFromString('-Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertNone(extractFromString('- Dummy'));
      });

      it('Single negative number', () => {
        TestUtils.assertNone(extractFromString('-5Dummy'));
      });

      it('Single positive number', () => {
        TestUtils.assertNone(extractFromString('5Dummy'));
      });

      it('Two spaces', () => {
        TestUtils.assertNone(extractFromString('  Dummy'));
      });

      it('Too big negative value', () => {
        TestUtils.assertNone(extractFromString('-150,45Dummy'));
      });

      it('Negative zero', () => {
        TestUtils.assertSome(
          extractFromString('- 0Dummy'),
          Tuple.make(BigDecimal.make(0n, 0), '- 0'),
        );
      });

      it('Negative value', () => {
        TestUtils.assertSome(
          extractFromString('-15Dummy'),
          Tuple.make(BigDecimal.make(-15n, 0), '-15'),
        );
      });

      it('Positive value', () => {
        TestUtils.assertSome(
          extractFromString(' 5Dummy'),
          Tuple.make(BigDecimal.make(5n, 0), ' 5'),
        );
      });

      it('Real value', () => {
        TestUtils.assertSome(
          extractFromString(' 5,35Dummy'),
          Tuple.make(BigDecimal.make(535n, 2), ' 5,35'),
        );
      });
    });
  });

  describe('extractFromStringOrThrow', () => {
    const extractFromStringOrThrow = MBigDecimal.extractFromStringOrThrow(
      MNumberBase10Format.frenchStyleNumber,
    );

    it('passing', () => {
      TestUtils.assertEquals(
        extractFromStringOrThrow('0,45Dummy'),
        Tuple.make(BigDecimal.make(45n, 2), '0,45'),
      );
    });

    it('Not passing', () => {
      TestUtils.throws(() => extractFromStringOrThrow('Dummy'));
    });
  });

  describe('parseFromString', () => {
    const parseFromString = MBigDecimal.parseFromString(MNumberBase10Format.frenchStyleNumber);

    it('passing', () => {
      TestUtils.assertSome(parseFromString('45,50'), BigDecimal.make(4550n, 2));
    });

    it('Not passing (extra characters)', () => {
      TestUtils.assertNone(parseFromString('45,50Dummy'));
    });

    it('Negative value keeps its sign', () => {
      TestUtils.assertSome(parseFromString('-45,50'), BigDecimal.make(-4550n, 2));
    });
  });

  describe('parseFromStringOrThrow', () => {
    const parseFromStringOrThrow = MBigDecimal.parseFromStringOrThrow(
      MNumberBase10Format.frenchStyleNumber,
    );

    it('passing', () => {
      TestUtils.assertEquals(parseFromStringOrThrow('45,50'), BigDecimal.make(4550n, 2));
    });

    it('Not passing', () => {
      TestUtils.throws(() => parseFromStringOrThrow('45,50Dummy'));
    });
  });
});
