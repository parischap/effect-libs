import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';

import { assert, describe, it } from '@effect/vitest';

describe('CVTemplateSeparator', () => {
  const separator = CVTemplateSeparator.make('foo');

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVTemplateSeparator.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      assert.strictEqual(separator.toString(), 'foo');
    });
  });
});
