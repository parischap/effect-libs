import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('CVDateTimeFormatContext', () => {
  const enGBContext = CVDateTimeFormatContext.enGB;

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVDateTimeFormatContext.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(enGBContext.toString(), 'en-GB');
    });
  });

  it('fromLocale', () => {
    TestUtils.assertSome(CVDateTimeFormatContext.fromLocale('en-US'));
  });
});
