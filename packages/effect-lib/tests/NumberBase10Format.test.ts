import { describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';

describe('MNumberBase10Format', () => {
  const { frenchStyleNumber } = MNumberBase10Format;

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MNumberBase10Format.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('toDescription', () => {
    it('General integer', () => {
      TestUtils.assertEquals(
        MNumberBase10Format.toDescription(MNumberBase10Format.integer),
        'potentially signed integer',
      );
      TestUtils.assertEquals(
        pipe(
          MNumberBase10Format.ukStyleInteger,
          MNumberBase10Format.withThousandSeparator(''),
          MNumberBase10Format.toDescription,
        ),
        'potentially signed integer',
      );
    });

    it('Signed integer', () => {
      TestUtils.assertEquals(
        pipe(
          MNumberBase10Format.dutchStyleInteger,
          MNumberBase10Format.withSignDisplay,
          MNumberBase10Format.toDescription,
        ),
        'signed Dutch-style integer',
      );
    });

    it('Unsigned integer', () => {
      TestUtils.assertEquals(
        pipe(
          MNumberBase10Format.dutchStyleInteger,
          MNumberBase10Format.withoutSignDisplay,
          MNumberBase10Format.toDescription,
        ),
        'unsigned Dutch-style integer',
      );
    });

    it('Number', () => {
      TestUtils.assertEquals(
        MNumberBase10Format.toDescription(frenchStyleNumber),
        'potentially signed French-style number',
      );
    });

    it('Number with 2 decimal places in engineering notation', () => {
      TestUtils.assertEquals(
        pipe(
          MNumberBase10Format.dutchStyleInteger,
          MNumberBase10Format.withNDecimals(2),
          MNumberBase10Format.withEngineeringScientificNotation,
          MNumberBase10Format.toDescription,
        ),
        'potentially signed Dutch-style 2-decimal number in engineering notation',
      );
    });

    it('Number with padding', () => {
      TestUtils.assertEquals(
        pipe(
          MNumberBase10Format.frenchStyleInteger,
          MNumberBase10Format.zeroPadded(3),
          MNumberBase10Format.toDescription,
        ),
        '0-left-padded potentially signed French-style integer',
      );
    });
  });
});
