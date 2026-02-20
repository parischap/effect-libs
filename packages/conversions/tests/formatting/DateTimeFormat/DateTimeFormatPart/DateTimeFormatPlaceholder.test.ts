import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('CVDateTimeFormatPlaceholder', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVDateTimeFormatPlaceholder.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
