import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';

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
