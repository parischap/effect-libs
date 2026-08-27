import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MPortError from '@parischap/effect-lib/MPortError';

describe('MPortError', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MPortError.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });
});
