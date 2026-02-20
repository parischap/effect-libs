import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import { pipe } from 'effect';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('CVNumberBase10Format', () => {
  const { frenchStyleNumber } = CVNumberBase10Format;

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVNumberBase10Format.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('toDescription', () => {
    it('General integer', () => {
      TestUtils.assertEquals(
        CVNumberBase10Format.toDescription(CVNumberBase10Format.integer),
        'potentially signed integer',
      );
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.ukStyleInteger,
          CVNumberBase10Format.withThousandSeparator(''),
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

    it('Number with padding', () => {
      TestUtils.assertEquals(
        pipe(
          CVNumberBase10Format.frenchStyleInteger,
          CVNumberBase10Format.zeroPadded(3),
          CVNumberBase10Format.toDescription,
        ),
        '0-left-padded potentially signed French-style integer',
      );
    });
  });
});
