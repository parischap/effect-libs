import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';

describe('CVDateTimeFormatPlaceholder', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVDateTimeFormatPlaceholder.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
