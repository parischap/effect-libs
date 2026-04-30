import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTime from '@parischap/conversions/CVDateTime';
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVDateTimeFormatter from '@parischap/conversions/CVDateTimeFormatter';

import { describe, it } from 'vitest';

describe('CVDateTimeFormatter', () => {
  const placeholder = CVDateTimeFormatPlaceholder.make;
  const sep = CVDateTimeFormatSeparator;
  const enGBContext = CVDateTimeFormatContext.enGB;

  const isoFormat = CVDateTimeFormat.make(
    placeholder('yyyy'),
    sep.hyphen,
    placeholder('MM'),
    sep.hyphen,
    placeholder('dd'),
    sep.make('T'),
    placeholder('HH'),
    sep.colon,
    placeholder('mm'),
    sep.colon,
    placeholder('ss'),
    sep.comma,
    placeholder('SSS'),
    placeholder('zHzH'),
    sep.colon,
    placeholder('zmzm'),
  );

  const exhaustiveFormat = CVDateTimeFormat.make(
    placeholder('y'),
    sep.space,
    placeholder('yy'),
    placeholder('yyyy'),
    placeholder('R'),
    sep.space,
    placeholder('RR'),
    placeholder('RRRR'),
    placeholder('M'),
    sep.space,
    placeholder('MM'),
    placeholder('MMM'),
    placeholder('MMMM'),
    placeholder('I'),
    sep.space,
    placeholder('II'),
    placeholder('d'),
    sep.space,
    placeholder('dd'),
    placeholder('D'),
    sep.space,
    placeholder('DDD'),
    placeholder('i'),
    sep.space,
    placeholder('iii'),
    placeholder('iiii'),
    placeholder('a'),
    placeholder('H'),
    sep.space,
    placeholder('HH'),
    placeholder('K'),
    sep.space,
    placeholder('KK'),
    placeholder('m'),
    sep.space,
    placeholder('mm'),
    placeholder('s'),
    sep.space,
    placeholder('ss'),
    placeholder('S'),
    sep.space,
    placeholder('SSS'),
    placeholder('zH'),
    sep.space,
    placeholder('zHzH'),
    placeholder('zm'),
    sep.space,
    placeholder('zmzm'),
    placeholder('zs'),
    sep.space,
    placeholder('zszs'),
  );

  const isoFormatter = CVDateTimeFormatter.make({
    dateTimeFormat: isoFormat,
    context: enGBContext,
  });
  const exhaustiveFormatter = CVDateTimeFormatter.make({
    dateTimeFormat: exhaustiveFormat,
    context: enGBContext,
  });

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVDateTimeFormatter.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(
        isoFormatter.toString(),
        "'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm' formatter in 'en-GB' context",
      );
    });
  });

  describe('name', () => {
    it('returns the formatter name', () => {
      TestUtils.strictEqual(
        CVDateTimeFormatter.name(isoFormatter),
        "'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm' formatter in 'en-GB' context",
      );
    });
  });

  describe('format', () => {
    describe('isoFormat / enGB', () => {
      const format = CVDateTimeFormatter.format(isoFormatter);

      it('Non-matching: rejects a 5-digit year for a 4-digit format', () => {
        TestUtils.assertFailureMessage(
          format(CVDateTime.fromPartsOrThrow({ year: 10_024 })),
          'Expected length of #year to be: 4. Actual: 5',
        );
      });

      it('Matching: produces the correct ISO string', () => {
        TestUtils.assertSuccess(
          format(
            CVDateTime.fromPartsOrThrow({ year: 2025, month: 8, monthDay: 13, zoneMinute: 42 }),
          ),
          '2025-08-13T00:00:00,000+00:42',
        );
      });
    });

    describe('Exhaustive format / enGB', () => {
      const format = CVDateTimeFormatter.format(exhaustiveFormatter);

      it('Non-matching: rejects a year outside the 2-digit range', () => {
        TestUtils.assertFailureMessage(
          format(CVDateTime.fromPartsOrThrow({ year: 1925, month: 2, monthDay: 28 })),
          'Expected #year to be between 2000 (included) and 2099 (included). Actual: 1925',
        );
      });

      it('Matching: produces the correct exhaustive string', () => {
        TestUtils.assertSuccess(
          format(
            CVDateTime.fromPartsOrThrow({
              year: 2025,
              month: 2,
              monthDay: 28,
              minute: 54,
              zoneHour: -5,
            }),
          ),
          '2025 2520252025 2520252 02FebFebruary9 0928 2859 0595 FriFridayAM0 000 0054 540 000 000-5 -050 000 00',
        );
      });
    });
  });

  describe('formatOrThrow', () => {
    const formatOrThrow = CVDateTimeFormatter.formatOrThrow(isoFormatter);

    it('Matching: returns a string directly', () => {
      TestUtils.strictEqual(
        formatOrThrow(
          CVDateTime.fromPartsOrThrow({ year: 2025, month: 1, monthDay: 1, zoneHour: 0 }),
        ),
        '2025-01-01T00:00:00,000+00:00',
      );
    });

    it('Non-matching: throws on invalid input', () => {
      TestUtils.throws(() => formatOrThrow(CVDateTime.fromPartsOrThrow({ year: 10_024 })));
    });
  });
});
