import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVTemplatePartSeparator from '@parischap/conversions/CVTemplatePartSeparator';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVTemplatePartSeparator', () => {
  const separator = CVTemplatePartSeparator.make('foo');

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVTemplatePartSeparator.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(separator.toString(), 'foo');
    });
  });
});
