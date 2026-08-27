import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';

describe('CVDateTimeFormatSeparator', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVDateTimeFormatSeparator.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
