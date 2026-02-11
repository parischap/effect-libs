import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTimeFormatSeparator', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVDateTimeFormatSeparator.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
