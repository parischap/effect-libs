import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';

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
      assert.strictEqual(enGBContext.toString(), 'en-GB');
    });
  });

  it('fromLocale', () => {
    TestUtils.assertSome(CVDateTimeFormatContext.fromLocale('en-US'));
  });
});
