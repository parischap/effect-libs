import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTreeNonLeaf from '@parischap/effect-lib/MTreeNonLeaf'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

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
