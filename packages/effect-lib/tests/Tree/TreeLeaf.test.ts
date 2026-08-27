import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTreeLeaf from '@parischap/effect-lib/MTreeLeaf';

describe('MTreeLeaf', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTreeLeaf.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
