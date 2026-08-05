import { pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVNumberBase10Formatter from '@parischap/conversions/CVNumberBase10Formatter';

import { describe, it } from 'vitest';

describe('CVNumberBase10Formatter', () => {
  const { frenchStyleNumber } = CVNumberBase10Format;

  describe('moduleTag and .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVNumberBase10Formatter.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('description', () => {
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.integer,
          CVNumberBase10Formatter.fromFormat,
          CVNumberBase10Formatter.description,
        ),
        'potentially signed integer formatter',
      );
    });
  });

  describe('format', () => {
    const frenchStyleNumberWithSignDisplayForNegative = pipe(
      frenchStyleNumber,
      CVNumberBase10Format.withSignDisplayForNegative,
    );

    describe('General tests with frenchStyleThreeDecimalNumberWithAutoSign', () => {
      const formatter = pipe(
        frenchStyleNumberWithSignDisplayForNegative,
        CVNumberBase10Formatter.fromFormat,
        CVNumberBase10Formatter.format,
      );
      it('Zero', () => {
        TestUtils.assertSome(formatter(0), '0');
        TestUtils.assertSome(formatter(-0), '-0');
        TestUtils.assertSome(formatter(BigDecimal.make(-0n, 0)), '0');
        TestUtils.assertSome(formatter(-0.0004), '-0');
      });

      it('Number with less than maximumFractionalDigits decimals', () => {
        TestUtils.assertSome(formatter(1528.65), '1 528,65');
      });

      it('BigDecimal as input, more than maximumFractionalDigits decimals', () => {
        TestUtils.assertSome(formatter(BigDecimal.make(-14_675_435n, 4)), '-1 467,544');
      });

      it('Non-finite number', () => {
        TestUtils.assertNone(formatter(Number.NaN));
        TestUtils.assertNone(formatter(Infinity));
        TestUtils.assertNone(formatter(-Infinity));
      });
    });

    describe('Tests with withNullIntegerPartNotShowing', () => {
      const formatter = pipe(
        frenchStyleNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withNullIntegerPartNotShowing,
        CVNumberBase10Formatter.fromFormat,
        CVNumberBase10Formatter.format,
      );
      it('Zero', () => {
        TestUtils.assertSome(formatter(0), '0');
      });

      it('Number rounded down to zero', () => {
        TestUtils.assertSome(formatter(-0.0004), '-0');
      });

      it('Number rounded up from zero', () => {
        TestUtils.assertSome(formatter(0.0005), ',001');
      });
    });

    describe('Tests with withNDecimals(2) and withNullIntegerPartNotShowing', () => {
      const formatter = pipe(
        frenchStyleNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withNDecimals(2),
        CVNumberBase10Format.withNullIntegerPartNotShowing,
        CVNumberBase10Formatter.fromFormat,
        CVNumberBase10Formatter.format,
      );
      it('Zero', () => {
        TestUtils.assertSome(formatter(0), ',00');
      });

      it('Number rounded down to zero', () => {
        TestUtils.assertSome(formatter(-0.004), '-,00');
      });

      it('Number rounded up from zero', () => {
        TestUtils.assertSome(formatter(0.005), ',01');
      });
    });

    describe('Tests with withEngineeringScientificNotation', () => {
      const formatter = pipe(
        frenchStyleNumberWithSignDisplayForNegative,
        CVNumberBase10Format.withEngineeringScientificNotation,
        CVNumberBase10Format.withMinNDecimals(2),
        CVNumberBase10Formatter.fromFormat,
        CVNumberBase10Formatter.format,
      );
      it('Negative Zero', () => {
        TestUtils.assertSome(formatter(-0), '-0,00e0');
      });

      it('Big positive number', () => {
        TestUtils.assertSome(formatter(154_321.5), '154,322e3');
      });

      it('Small negative number', () => {
        TestUtils.assertSome(formatter(-523e-5), '-5,23e-3');
      });
    });

    describe('Tests with zeroPadded', () => {
      const formatter = pipe(
        frenchStyleNumberWithSignDisplayForNegative,
        CVNumberBase10Format.zeroPadded(2),
        CVNumberBase10Formatter.fromFormat,
        CVNumberBase10Formatter.format,
      );
      it('Negative Zero', () => {
        TestUtils.assertSome(formatter(-0), '-00');
      });

      it('Small positive number', () => {
        TestUtils.assertSome(formatter(1.5), '01,5');
      });

      it('Positive number', () => {
        TestUtils.assertSome(formatter(11.5), '11,5');
      });

      it('Big Positive number', () => {
        TestUtils.assertSome(formatter(112.5), '112,5');
      });

      it('Small negative number', () => {
        TestUtils.assertSome(formatter(-1.5), '-01,5');
      });

      it('Negative number', () => {
        TestUtils.assertSome(formatter(-11.5), '-11,5');
      });

      it('Big negative number', () => {
        TestUtils.assertSome(formatter(-112.5), '-112,5');
      });
    });
  });

  describe('formatOrThrow', () => {
    const formatOrThrow = pipe(
      frenchStyleNumber,
      CVNumberBase10Formatter.fromFormat,
      CVNumberBase10Formatter.formatOrThrow,
    );

    it('Finite number', () => {
      TestUtils.strictEqual(formatOrThrow(1528.65), '1 528,65');
    });

    it('Non-finite number: throws', () => {
      TestUtils.throws(() => formatOrThrow(Number.NaN));
      TestUtils.throws(() => formatOrThrow(Infinity));
    });
  });
});
