import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTime from '@parischap/conversions/CVDateTime'
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat'
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext'
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder'
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator'
import * as CVEmail from '@parischap/conversions/CVEmail'
import * as CVInteger from '@parischap/conversions/CVInteger'
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format'
import * as CVPositiveInteger from '@parischap/conversions/CVPositiveInteger'
import * as CVPositiveReal from '@parischap/conversions/CVPositiveReal'
import * as CVReal from '@parischap/conversions/CVReal'
import * as CVSchema from '@parischap/conversions/CVSchema'
import * as CVSemVer from '@parischap/conversions/CVSemVer'
import {pipe} from 'effect'
import * as BigDecimal from 'effect/BigDecimal'
import * as DateTime from 'effect/DateTime'
import * as Schema from 'effect/Schema'
import { describe, it } from 'vitest';

describe('CVSchema', () => {
  describe('Email', () => {
    const target = CVEmail.unsafeFromString('foo@bar.baz');
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.Email);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder('foo'));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.Email);

      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('EmailFromSelf', () => {
    const target = CVEmail.unsafeFromString('foo@bar.baz');
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.EmailFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.EmailFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('SemVer', () => {
    const target = CVSemVer.unsafeFromString('1.0.1');
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.SemVer);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder('foo'));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.SemVer);

      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('SemVerFromSelf', () => {
    const target = CVSemVer.unsafeFromString('1.0.1');
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.SemVerFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.SemVerFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('RealFromNumber', () => {
    const target = CVReal.unsafeFromNumber(15.4);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.RealFromNumber);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder(Infinity));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.RealFromNumber);

      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('RealFromSelf', () => {
    const target = CVReal.unsafeFromNumber(15.4);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.RealFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.RealFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('Real', () => {
    const schema = CVSchema.Real(CVNumberBase10Format.frenchStyleNumber);
    const target = CVReal.unsafeFromNumber(1024.56);
    const targetAsString = '1 024,56';
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(schema);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder(''));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(targetAsString), target);
      });
    });
    it('Encoding', () => {
      const encoder = Schema.encodeEither(schema);
      TestUtils.assertRight(encoder(target), targetAsString);
    });
  });

  describe('IntegerFromNumber', () => {
    const target = CVInteger.unsafeFromNumber(15);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.IntegerFromNumber);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder(Infinity));
        TestUtils.assertLeft(decoder(15.4));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.IntegerFromNumber);

      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('IntegerFromSelf', () => {
    const target = CVInteger.unsafeFromNumber(15);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.IntegerFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.IntegerFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('PositiveIntegerFromNumber', () => {
    const target = CVPositiveInteger.unsafeFromNumber(15);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.PositiveIntegerFromNumber);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder(Infinity));
        TestUtils.assertLeft(decoder(15.4));
        TestUtils.assertLeft(decoder(-15));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.PositiveIntegerFromNumber);

      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('PositiveIntegerFromSelf', () => {
    const target = CVPositiveInteger.unsafeFromNumber(15);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.PositiveIntegerFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.PositiveIntegerFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('PositiveRealFromNumber', () => {
    const target = CVPositiveReal.unsafeFromNumber(15.4);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.PositiveRealFromNumber);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder(Infinity));
        TestUtils.assertLeft(decoder(-15.4));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.PositiveRealFromNumber);

      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('PositiveRealFromSelf', () => {
    const target = CVPositiveReal.unsafeFromNumber(15.4);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.PositiveRealFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.PositiveRealFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('BigDecimal', () => {
    const schema = CVSchema.BigDecimal(CVNumberBase10Format.frenchStyleNumber);
    const target = BigDecimal.make(102_456n, 2);
    const targetAsString = '1 024,56';
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(schema);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder(''));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(targetAsString), target);
      });
    });
    it('Encoding', () => {
      const encoder = Schema.encodeEither(schema);
      TestUtils.assertRight(encoder(target), targetAsString);
    });
  });

  describe('DateTimeFromSelf', () => {
    const target = CVDateTime.fromTimestampOrThrow(0);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.DateTimeFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), target);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.DateTimeFromSelf);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), target);
      });
    });
  });

  describe('DateTimeFromDate', () => {
    const target = CVDateTime.fromTimestampOrThrow(0);
    const targetAsDate = new Date(0);
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.DateFromDateTime);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), targetAsDate);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.DateFromDateTime);
      it('Passing', () => {
        TestUtils.assertRight(encoder(targetAsDate), target);
      });
    });
  });

  describe('DateTimeFromEffectDateTime', () => {
    const target = CVDateTime.fromTimestampOrThrow(1_756_128_920_881, 8);
    const targetAsEFfectDateTime = DateTime.unsafeMakeZoned(1_756_128_920_881, { timeZone: 8 });
    describe('Decoding', () => {
      const decoder = Schema.decodeEither(CVSchema.DateTimeZonedFromDateTime);
      it('Passing', () => {
        TestUtils.assertRight(decoder(target), targetAsEFfectDateTime);
      });
    });

    describe('Encoding', () => {
      const encoder = Schema.encodeEither(CVSchema.DateTimeZonedFromDateTime);
      it('Passing', () => {
        TestUtils.assertRight(encoder(targetAsEFfectDateTime), target);
      });
    });
  });

  describe('DateTime', () => {
    const placeholder = CVDateTimeFormatPlaceholder.make;
    const sep = CVDateTimeFormatSeparator;
    const frenchDateFormat = CVDateTimeFormat.make({
      context: CVDateTimeFormatContext.fromLocaleOrThrow('fr-FR'),
      parts: [
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
      ],
    });
    const schema = CVSchema.DateTime(frenchDateFormat);

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
      const decoder = Schema.decodeEither(schema);
      it('Not passing', () => {
        TestUtils.assertLeft(decoder(''));
        TestUtils.assertLeft(decoder('2025/12/14'));
      });
      it('Passing', () => {
        TestUtils.assertRight(decoder(targetAsString), target);
      });
    });
    describe('Encoding', () => {
      const encoder = Schema.encodeEither(schema);
      it('Passing', () => {
        TestUtils.assertRight(encoder(target), targetAsString);
      });

      it('Not passing', () => {
        TestUtils.assertLeft(
          pipe(
            new Date(12_025, 7, 25, 10, 24, 47).getTime(),
            CVDateTime.fromTimestampOrThrow,
            encoder,
          ),
        );
      });
    });
  });
});
