import * as TestUtils from '@parischap/configs/TestUtils';
import * as MTreeNode from '@parischap/effect-lib/MTreeNode'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('MNode', () => {
  describe('Tag', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(MTreeNode.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });
  });
});
