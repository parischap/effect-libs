import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTimeFormatPlaceholder', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVDateTimeFormatPlaceholder.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
