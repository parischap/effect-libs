import * as BigDecimal from 'effect/BigDecimal';
import * as DateTime from 'effect/DateTime';
import * as Schema from 'effect/Schema';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTime from '@parischap/conversions/CVDateTime';
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVDateTimeFormatter from '@parischap/conversions/CVDateTimeFormatter';
import * as CVDateTimeParser from '@parischap/conversions/CVDateTimeParser';
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVSchema from '@parischap/conversions/CVSchema';

import { describe, it } from 'vitest';

describe('CVSchema', () => {
  describe('FiniteFromString', () => {
    const schema = CVSchema.FiniteFromString(CVNumberBase10Format.frenchStyleNumber);
    const target = 1024.56;
    const targetAsString = '1 024,56';
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(schema);
      it('Not passing', () => {
        TestUtils.assertFailureExit(decoder(''));
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
    const schema = CVSchema.BigDecimalFromString(CVNumberBase10Format.frenchStyleNumber);
    const target = BigDecimal.make(102_456n, 2);
    const targetAsString = '1 024,56';
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(schema);
      it('Not passing', () => {
        TestUtils.assertFailureExit(decoder(''));
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

  describe('CVDateTime', () => {
    const target = CVDateTime.fromTimestampOrThrow(0);
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(CVSchema.CVDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeExit(CVSchema.CVDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(encoder(target), target);
      });
    });
  });

  describe('DateFromCVDateTime', () => {
    const target = CVDateTime.fromTimestampOrThrow(0);
    const targetAsDate = new Date(0);
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(CVSchema.DateFromCVDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(target), targetAsDate);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeExit(CVSchema.DateFromCVDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(encoder(targetAsDate), target);
      });
    });
  });

  describe('DateTimeZonedFromCVDateTime', () => {
    const target = CVDateTime.fromTimestampOrThrow(1_756_128_920_881, 8);
    const targetAsEFfectDateTime = DateTime.makeZonedUnsafe(1_756_128_920_881, { timeZone: 8 });
    describe('Decoding', () => {
      const decoder = Schema.decodeExit(CVSchema.DateTimeZonedFromCVDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(decoder(target), targetAsEFfectDateTime);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeExit(CVSchema.DateTimeZonedFromCVDateTime);
      it('Passing', () => {
        TestUtils.assertSuccessExit(encoder(targetAsEFfectDateTime), target);
      });
    });
  });

  describe('CVDateTimeFromString', () => {
    const placeholder = CVDateTimeFormatPlaceholder.make;
    const sep = CVDateTimeFormatSeparator;
    const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow('fr-FR');
    const frenchDateFormat = CVDateTimeFormat.make(
      placeholder('dd'),
      sep.slash,
      placeholder('MM'),
      sep.slash,
      placeholder('yyyy'),
      sep.space,
      placeholder('HH'),
      sep.colon,
      placeholder('mm'),
      sep.colon,
      placeholder('ss'),
      sep.make(' Local time'),
    );
    const schema = CVSchema.CVDateTimeFromString(
      CVDateTimeParser.make({ dateTimeFormat: frenchDateFormat, context: frenchContext }),
      CVDateTimeFormatter.make({ dateTimeFormat: frenchDateFormat, context: frenchContext }),
    );

    const target = CVDateTime.fromPartsOrThrow({
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
        TestUtils.assertFailureExit(decoder(''));
        TestUtils.assertFailureExit(decoder('2025/12/14'));
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
        TestUtils.assertFailureExit(
          encoder(CVDateTime.fromTimestampOrThrow(new Date(12_025, 7, 25, 10, 24, 47).getTime())),
        );
      });
    });
  });
});
