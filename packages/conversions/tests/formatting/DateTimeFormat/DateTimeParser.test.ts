import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTime from '@parischap/conversions/CVDateTime';
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVDateTimeParser from '@parischap/conversions/CVDateTimeParser';
import { pipe } from 'effect';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('CVDateTimeParser', () => {
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

  const isoParser = CVDateTimeParser.make({ dateTimeFormat: isoFormat, context: enGBContext });
  const exhaustiveParser = CVDateTimeParser.make({
    dateTimeFormat: exhaustiveFormat,
    context: enGBContext,
  });

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVDateTimeParser.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(
        isoParser.toString(),
        "'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm' parser in 'en-GB' context",
      );
    });
  });

  describe('name', () => {
    it('returns the parser name', () => {
      TestUtils.strictEqual(
        CVDateTimeParser.name(isoParser),
        "'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm' parser in 'en-GB' context",
      );
    });
  });

  describe('parse', () => {
    describe('isoFormat / enGB', () => {
      const parse = CVDateTimeParser.parse(isoParser);

      it('Non-matching: rejects month 13', () => {
        TestUtils.assertLeftMessage(
          parse('2025-13-01T22:54:12,543+00:00'),
          "Expected 'month' to be between 1 (included) and 12 (included). Actual: 13",
        );
      });

      it('Matching: produces the correct UTC timestamp', () => {
        TestUtils.assertRight(
          pipe('2025-12-01T22:54:12,543-03:22', parse, Either.map(CVDateTime.timestamp)),
          Date.UTC(2025, 11, 2, 2, 16, 12, 543),
        );
      });
    });

    describe('Exhaustive format / enGB', () => {
      const parse = CVDateTimeParser.parse(exhaustiveParser);

      it('Non-matching: rejects invalid monthDay combination', () => {
        TestUtils.assertLeftMessage(
          parse(
            '2025 2520252026 26202612 12DecDecember1 0130 30364 3641 MonMondayPM13 131 015 0553 53234 234+1 +0112 125 05',
          ),
          "Expected 'monthDay' to be: 29. Actual: 30",
        );
      });

      it('Non-matching: rejects conflicting weekday values', () => {
        TestUtils.assertLeftMessage(
          parse(
            '2025 2520252026 26202612 12DecDecember1 0130 30364 3642 TueMondayPM13 131 015 0553 53234 234+1 +0112 125 05',
          ),
          "#weekday is present more than once in template and receives differing values '2' and '1'",
        );
      });

      it('Matching: produces the correct UTC timestamp', () => {
        TestUtils.assertRight(
          pipe(
            '2025 2520252026 26202612 12DecDecember1 0130 30364 3642 TueTuesdayPM13 131 015 0553 53234 234+1 +0112 125 05',
            parse,
            Either.map(CVDateTime.timestamp),
          ),
          Date.UTC(2025, 11, 30, 11, 53, 48, 234),
        );
      });
    });
  });

  describe('parseOrThrow', () => {
    const parseOrThrow = CVDateTimeParser.parseOrThrow(isoParser);

    it('Matching: returns a CVDateTime directly', () => {
      TestUtils.strictEqual(
        CVDateTime.timestamp(parseOrThrow('2025-06-15T10:30:00,000+00:00')),
        Date.UTC(2025, 5, 15, 10, 30, 0, 0),
      );
    });

    it('Non-matching: throws on invalid input', () => {
      TestUtils.assertThrows(() => parseOrThrow('not-a-date'));
    });
  });
});
