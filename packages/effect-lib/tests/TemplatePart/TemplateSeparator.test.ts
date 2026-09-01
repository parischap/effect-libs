import { assert, describe, it } from '@effect/vitest';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';

describe('MTemplateSeparator', () => {
  const separator = MTemplateSeparator.make('foo');

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTemplateSeparator.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      assert.strictEqual(separator.toString(), 'foo');
    });
  });
});
