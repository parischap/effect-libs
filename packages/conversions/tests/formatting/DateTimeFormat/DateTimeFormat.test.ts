import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('CVDateTimeFormat', () => {
  const placeholder = CVDateTimeFormatPlaceholder.make;
  const sep = CVDateTimeFormatSeparator;

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

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVDateTimeFormat.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(isoFormat.toString(), 'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm');
    });
  });

  describe('name', () => {
    it('returns the format name', () => {
      TestUtils.strictEqual(CVDateTimeFormat.name(isoFormat), 'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm');
    });
  });

  describe('parts', () => {
    it('returns the parts array with the correct length', () => {
      TestUtils.strictEqual(CVDateTimeFormat.parts(isoFormat).length, 16);
    });
  });
});
