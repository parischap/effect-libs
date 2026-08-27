import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTreeNonLeaf from '@parischap/effect-lib/MTreeNonLeaf';

describe('MTreeNonLeaf', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTreeNonLeaf.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
