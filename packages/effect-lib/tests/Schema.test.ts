import { describe, it } from '@effect/vitest';
import * as BigDecimal from 'effect/BigDecimal';
import * as DateTime from 'effect/DateTime';
import * as Schema from 'effect/Schema';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MDateTime from '@parischap/effect-lib/MDateTime';
import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MSchema from '@parischap/effect-lib/MSchema';

describe('MSchema', () => {
  describe('FiniteFromString', () => {
    const schema = MSchema.FiniteFromString(MNumberBase10Format.frenchStyleNumber);
    const target = 1024.56;
    const targetAsString = '1 024,56';
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(schema);
      it('Not passing', () => {
        TestUtils.assertFailedExit(decoder(''));
      });
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(targetAsString), target);
      });
    });
    it('Encoding', () => {
      const encoder = Schema.encodeExit(schema);
      TestUtils.assertSuccessExit(encoder(target), targetAsString);
    });
  });

  describe('BigDecimalFromString', () => {
    const schema = MSchema.BigDecimalFromString(MNumberBase10Format.frenchStyleNumber);
    const target = BigDecimal.make(102_456n, 2);
    const targetAsString = '1 024,56';
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(schema);
      it('Not passing', () => {
        TestUtils.assertFailedExit(decoder(''));
      });
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(targetAsString), target);
      });
    });
    it('Encoding', () => {
      const encoder = Schema.encodeExit(schema);
      TestUtils.assertSuccessExit(encoder(target), targetAsString);
    });
  });

  describe('MDateTime', () => {
    const target = MDateTime.fromTimestampOrThrow(0);
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(MSchema.DateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeExit(MSchema.DateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(encoder(target), target);
      });
    });
  });

  describe('DateFromDateTime', () => {
    const target = MDateTime.fromTimestampOrThrow(0);
    const targetAsDate = new Date(0);
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(MSchema.DateFromDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(target), targetAsDate);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeExit(MSchema.DateFromDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(encoder(targetAsDate), target);
      });
    });
  });

  describe('DateTimeZonedFromDateTime', () => {
    const target = MDateTime.fromTimestampOrThrow(1_756_128_920_881, 8);
    const targetAsEFfectDateTime = DateTime.makeZonedUnsafe(1_756_128_920_881, { timeZone: 8 });
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(MSchema.DateTimeZonedFromDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(target), targetAsEFfectDateTime);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeExit(MSchema.DateTimeZonedFromDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(encoder(targetAsEFfectDateTime), target);
      });
    });
  });

  describe('DateTimeFromString', () => {
    const { Token } = MDateTimeFormat;
    const frenchContext = MDateTimeContext.fromLocaleOrThrow('fr-FR');
    const frenchDateFormat = MDateTimeFormat.make(
      Token.dd,
      '/',
      Token.MM,
      '/',
      Token.yyyy,
      ' ',
      Token.HH,
      ':',
      Token.mm,
      ':',
      Token.ss,
      ' Local time',
    );
    const schema = MSchema.DateTimeFromString(frenchDateFormat, frenchContext);

    const target = MDateTime.fromPartsOrThrow({
      year: 2025,
      month: 8,
      monthDay: 25,
      hour23: 10,
      minute: 24,
      second: 47,
    });

    const targetAsString = '25/08/2025 10:24:47 Local time';

    describe('Decoding', () => {
      const decoder = Schema.decodeExit(schema);
      it('Not passing', () => {
        TestUtils.assertFailedExit(decoder(''));
        TestUtils.assertFailedExit(decoder('2025/12/14'));
      });
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(targetAsString), target);
      });
    });
    describe('Encoding', () => {
      const encoder = Schema.encodeExit(schema);
      it('Passing', () => {
        TestUtils.assertSuccessExit(encoder(target), targetAsString);
      });

      it('Not passing', () => {
        TestUtils.assertFailedExit(
          encoder(MDateTime.fromTimestampOrThrow(new Date(12_025, 7, 25, 10, 24, 47).getTime())),
        );
      });
    });
  });
});
