import { assert, describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';

describe('MDateTimeContext', () => {
  const enGBContext = MDateTimeContext.enGB;

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MDateTimeContext.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      assert.strictEqual(enGBContext.toString(), 'en-GB');
    });
  });

  it('fromLocale', () => {
    TestUtils.assertSome(MDateTimeContext.fromLocale('en-US'));
  });
});
