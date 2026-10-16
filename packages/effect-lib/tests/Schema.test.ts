import { assert, describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as Arbitrary from 'effect/Arbitrary';
import * as Array from 'effect/Array';
import * as BigDecimal from 'effect/BigDecimal';
import * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Result from 'effect/Result';
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
      it('Not passing: explicit message', () => {
        TestUtils.assertFailureMessage(
          Schema.decodeResult(schema)(''),
          'Expected a number written in the given format',
        );
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
      it('Not passing: explicit message', () => {
        TestUtils.assertFailureMessage(
          Schema.decodeResult(schema)(''),
          'Expected a number written in the given format',
        );
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
    const target = MDateTime.fromTimestampOrThrow(0, 0);
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

    it('Not passing: errors refer to MDateTime', () => {
      TestUtils.assertFailureMessage(
        Schema.decodeUnknownResult(MSchema.DateTime)(0),
        'Expected MDateTime',
      );
    });

    describe('Formatter', () => {
      const formatter = Schema.toFormatter(MSchema.DateTime);
      it('Year in [0, 9999]: ISO string', () => {
        assert.strictEqual(formatter(target), '1970-01-01T00:00:00.000+00:00');
      });
      it('Year out of [0, 9999]: expanded ISO string', () => {
        assert.strictEqual(
          formatter(MDateTime.fromTimestampOrThrow(8_640_000_000_000_000, 0)),
          '+275760-09-13T00:00:00.000+00:00',
        );
      });
    });

    describe('JSON codec', () => {
      const jsonCodec = Schema.toCodecJson(MSchema.DateTime);
      const dateTime = MDateTime.fromTimestampOrThrow(1_756_128_920_881, 8.5);
      const encoded = { timestamp: 1_756_128_920_881, zoneOffset: 8.5 };
      it('Encoding', () => {
        TestUtils.assertSuccess(Schema.encodeUnknownResult(jsonCodec)(dateTime), encoded);
      });
      it('Decoding: passing (zone offset is kept)', () => {
        TestUtils.assertSuccess(
          pipe(Schema.decodeResult(jsonCodec)(encoded), Result.map(MDateTime.getIsoString)),
          MDateTime.getIsoString(dateTime),
        );
      });
      it('Decoding: not passing', () => {
        TestUtils.assertFailure(Schema.decodeResult(jsonCodec)({ timestamp: 0, zoneOffset: 15 }));
        TestUtils.assertFailure(Schema.decodeResult(jsonCodec)({ timestamp: 0.5, zoneOffset: 0 }));
      });
    });

    describe('Arbitrary', () => {
      const samples = Effect.runSync(
        Arbitrary.sampleEffect(Arbitrary.schema(MSchema.DateTime), { count: 50, seed: 1 }),
      );
      it('Generates MDateTime`s', () => {
        assert.strictEqual(samples.length, 50);
      });
      it('Generated MDateTime`s are in a realistic range', () => {
        TestUtils.assertEquals(
          Array.every(
            samples,
            (sample) =>
              sample.timestamp >= Date.UTC(1900, 0, 1) && sample.timestamp <= Date.UTC(2100, 0, 1),
          ),
          true,
        );
      });
      it('Generated MDateTime`s can be formatted', () => {
        TestUtils.assertEquals(
          Array.every(samples, (sample) => Schema.toFormatter(MSchema.DateTime)(sample).length > 0),
          true,
        );
      });
    });
  });

  describe('Filters on MDateTime', () => {
    const at = (timestamp: number, zoneOffset = 0) =>
      MDateTime.fromTimestampOrThrow(timestamp, zoneOffset);
    const bound = at(1000);
    const boundAsString = '1970-01-01T00:00:01.000+00:00';
    const decode = (schema: Schema.Codec<MDateTime.Type>) => Schema.decodeUnknownResult(schema);

    describe('isGreaterThanDateTime', () => {
      const decoder = decode(MSchema.DateTime.check(MSchema.isGreaterThanDateTime(bound)));
      it('Passing', () => {
        TestUtils.assertSuccess(decoder(at(1001)), at(1001));
      });
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          decoder(bound),
          `Expected a value greater than ${boundAsString}`,
        );
      });
    });

    describe('isGreaterThanOrEqualToDateTime', () => {
      const decoder = decode(MSchema.DateTime.check(MSchema.isGreaterThanOrEqualToDateTime(bound)));
      it('Passing', () => {
        TestUtils.assertSuccess(decoder(bound), bound);
      });
      it('Passing: same instant in another time zone', () => {
        TestUtils.assertSuccess(decoder(at(1000, 5)), at(1000, 5));
      });
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          decoder(at(999)),
          `Expected a value greater than or equal to ${boundAsString}`,
        );
      });
    });

    describe('isLessThanDateTime', () => {
      const decoder = decode(MSchema.DateTime.check(MSchema.isLessThanDateTime(bound)));
      it('Passing', () => {
        TestUtils.assertSuccess(decoder(at(999)), at(999));
      });
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          decoder(bound),
          `Expected a value less than ${boundAsString}`,
        );
      });
    });

    describe('isLessThanOrEqualToDateTime', () => {
      const decoder = decode(MSchema.DateTime.check(MSchema.isLessThanOrEqualToDateTime(bound)));
      it('Passing', () => {
        TestUtils.assertSuccess(decoder(bound), bound);
      });
      it('Not passing', () => {
        TestUtils.assertFailureMessage(
          decoder(at(1001)),
          `Expected a value less than or equal to ${boundAsString}`,
        );
      });
    });

    describe('isBetweenDateTime', () => {
      const minimum = at(0);
      const inclusive = decode(
        MSchema.DateTime.check(MSchema.isBetweenDateTime({ minimum, maximum: bound })),
      );
      const exclusive = decode(
        MSchema.DateTime.check(
          MSchema.isBetweenDateTime({
            minimum,
            maximum: bound,
            exclusiveMinimum: true,
            exclusiveMaximum: true,
          }),
        ),
      );
      it('Inclusive bounds: passing', () => {
        TestUtils.assertSuccess(inclusive(minimum), minimum);
        TestUtils.assertSuccess(inclusive(bound), bound);
      });
      it('Inclusive bounds: not passing', () => {
        TestUtils.assertFailureMessage(
          inclusive(at(1001)),
          `Expected a value between 1970-01-01T00:00:00.000+00:00 and ${boundAsString}`,
        );
      });
      it('Exclusive bounds: not passing', () => {
        TestUtils.assertFailureMessage(
          exclusive(bound),
          `Expected a value between 1970-01-01T00:00:00.000+00:00 (excluded) and ${boundAsString} (excluded)`,
        );
        TestUtils.assertFailure(exclusive(minimum));
      });
      it('Exclusive bounds: passing', () => {
        TestUtils.assertSuccess(exclusive(at(1)), at(1));
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
